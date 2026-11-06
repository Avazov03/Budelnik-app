package expo.modules.timeflowalarm

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

data class StoredAlarm(
  val id: String,
  val title: String,
  val hour: Int,
  val minute: Int,
  val repeatDays: List<Int>,
  val snoozeMinutes: Int,
  val soundId: String,
  val vibrationEnabled: Boolean,
  val triggerAt: Long,
  val enabled: Boolean,
  val status: String,
  val updatedAt: Long,
)

object AlarmContract {
  const val PREFS = "timeflow_alarms"
  const val KEY_ALARMS = "alarms"
  const val KEY_IDS = "ids"
  const val EXTRA_ID = "alarmId"
  const val ACTION_ALARM = "app.timeflow.ALARM"
  const val ACTION_SNOOZE = "app.timeflow.SNOOZE"
  const val ACTION_DISMISS = "app.timeflow.DISMISS"
  const val CHANNEL_ID = "timeflow-alarm-ring-2"
  const val NOTIFICATION_ID = 41001
  const val GRACE_MS = 15 * 60 * 1000L
}

object AlarmClockMath {
  fun nextTriggerMillis(hour: Int, minute: Int, repeatDays: List<Int>, fromMillis: Long): Long? {
    if (hour !in 0..23 || minute !in 0..59) {
      return null
    }
    val days = repeatDays.distinct().filter { it in 1..7 }
    if (days.isEmpty()) {
      val today = wallTime(fromMillis, 0, hour, minute)
      if (today > fromMillis) {
        return today
      }
      return wallTime(fromMillis, 1, hour, minute)
    }
    for (offset in 0..7) {
      val candidate = wallTime(fromMillis, offset, hour, minute)
      if (candidate > fromMillis && isoWeekday(candidate) in days) {
        return candidate
      }
    }
    return null
  }

  fun localMinuteDiff(hour: Int, minute: Int, nowMillis: Long): Int {
    val calendar = Calendar.getInstance().apply { timeInMillis = nowMillis }
    val current = calendar.get(Calendar.HOUR_OF_DAY) * 60 + calendar.get(Calendar.MINUTE)
    val target = hour * 60 + minute
    val raw = kotlin.math.abs(current - target)
    return minOf(raw, 24 * 60 - raw)
  }

  private fun wallTime(fromMillis: Long, dayOffset: Int, hour: Int, minute: Int): Long {
    return Calendar.getInstance().apply {
      timeInMillis = fromMillis
      add(Calendar.DATE, dayOffset)
      set(Calendar.HOUR_OF_DAY, hour)
      set(Calendar.MINUTE, minute)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis
  }

  private fun isoWeekday(millis: Long): Int {
    val day = Calendar.getInstance().apply { timeInMillis = millis }.get(Calendar.DAY_OF_WEEK)
    return if (day == Calendar.SUNDAY) 7 else day - 1
  }
}

object AlarmStore {
  private fun prefs(context: Context): SharedPreferences {
    return context.getSharedPreferences(AlarmContract.PREFS, Context.MODE_PRIVATE)
  }

  fun read(context: Context): List<StoredAlarm> {
    val raw = prefs(context).getString(AlarmContract.KEY_ALARMS, "[]") ?: "[]"
    return decode(raw)
  }

  fun readJson(context: Context): String {
    return prefs(context).getString(AlarmContract.KEY_ALARMS, "[]") ?: "[]"
  }

  fun previousIds(context: Context): List<String> {
    val raw = prefs(context).getString(AlarmContract.KEY_IDS, "[]") ?: "[]"
    return try {
      val array = JSONArray(raw)
      List(array.length()) { index -> array.optString(index) }.filter { it.isNotBlank() }
    } catch (_: Exception) {
      emptyList()
    }
  }

  fun write(context: Context, alarms: List<StoredAlarm>) {
    val array = JSONArray()
    alarms.forEach { alarm -> array.put(encode(alarm)) }
    prefs(context).edit()
      .putString(AlarmContract.KEY_ALARMS, array.toString())
      .commit()
  }

  fun writeIds(context: Context, ids: List<String>) {
    val array = JSONArray()
    ids.forEach { id -> array.put(id) }
    prefs(context).edit().putString(AlarmContract.KEY_IDS, array.toString()).commit()
  }

  fun replace(context: Context, alarm: StoredAlarm) {
    val next = read(context).filter { it.id != alarm.id } + alarm
    write(context, next)
  }

  fun find(context: Context, id: String): StoredAlarm? {
    return read(context).firstOrNull { it.id == id }
  }

  fun decode(raw: String): List<StoredAlarm> {
    return try {
      val array = JSONArray(raw)
      buildList {
        for (index in 0 until array.length()) {
          val item = array.optJSONObject(index) ?: continue
          val id = item.optString("id")
          if (id.isBlank()) {
            continue
          }
          val daysJson = item.optJSONArray("repeatDays") ?: JSONArray()
          val days = buildList {
            for (dayIndex in 0 until daysJson.length()) {
              val day = daysJson.optInt(dayIndex, -1)
              if (day in 1..7) {
                add(day)
              }
            }
          }
          add(
            StoredAlarm(
              id = id,
              title = item.optString("title", "Budilnik").ifBlank { "Budilnik" },
              hour = item.optInt("hour", 0),
              minute = item.optInt("minute", 0),
              repeatDays = days,
              snoozeMinutes = item.optInt("snoozeMinutes", 5).coerceIn(1, 60),
              soundId = item.optString("soundId", "default"),
              vibrationEnabled = item.optBoolean("vibrationEnabled", true),
              triggerAt = item.optLong("triggerAt", 0L),
              enabled = item.optBoolean("enabled", false),
              status = item.optString("status", "scheduled"),
              updatedAt = item.optLong("updatedAt", 0L),
            ),
          )
        }
      }
    } catch (_: Exception) {
      emptyList()
    }
  }

  private fun encode(alarm: StoredAlarm): JSONObject {
    val days = JSONArray()
    alarm.repeatDays.forEach { day -> days.put(day) }
    return JSONObject()
      .put("id", alarm.id)
      .put("title", alarm.title)
      .put("hour", alarm.hour)
      .put("minute", alarm.minute)
      .put("repeatDays", days)
      .put("snoozeMinutes", alarm.snoozeMinutes)
      .put("soundId", alarm.soundId)
      .put("vibrationEnabled", alarm.vibrationEnabled)
      .put("triggerAt", alarm.triggerAt)
      .put("enabled", alarm.enabled)
      .put("status", alarm.status)
      .put("updatedAt", alarm.updatedAt)
  }
}
