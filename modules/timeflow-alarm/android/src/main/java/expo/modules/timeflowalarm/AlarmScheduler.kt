package expo.modules.timeflowalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationManagerCompat

object AlarmScheduler {
  fun canScheduleExact(context: Context): Boolean {
    val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return false
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      alarmManager.canScheduleExactAlarms()
    } else {
      true
    }
  }

  fun canPostNotifications(context: Context): Boolean {
    return NotificationManagerCompat.from(context).areNotificationsEnabled()
  }

  fun canUseFullScreenIntent(context: Context): Boolean {
    if (Build.VERSION.SDK_INT < 34) {
      return true
    }
    return context.getSystemService(android.app.NotificationManager::class.java)?.canUseFullScreenIntent() == true
  }

  fun sync(context: Context, json: String): String {
    val alarms = AlarmStore.decode(json)
    AlarmStore.write(context, alarms)
    val scheduled = reschedule(context)
    val reason = when {
      !canScheduleExact(context) -> "exact_alarm"
      !canPostNotifications(context) -> "notifications"
      !canUseFullScreenIntent(context) -> "full_screen_intent"
      else -> null
    }
    return org.json.JSONObject()
      .put("ok", canScheduleExact(context))
      .put("blocked", !canScheduleExact(context))
      .put("scheduled", scheduled)
      .put("reason", reason ?: org.json.JSONObject.NULL)
      .toString()
  }

  fun restoreAfterBoot(context: Context) {
    val now = System.currentTimeMillis()
    val updated = AlarmStore.read(context).map { alarm ->
      if (!alarm.enabled || alarm.status == "disabled" || alarm.status == "dismissed") {
        alarm
      } else if (alarm.triggerAt > now) {
        alarm
      } else if (now - alarm.triggerAt <= AlarmContract.GRACE_MS) {
        alarm.copy(triggerAt = now + 2_000L, updatedAt = now)
      } else if (alarm.repeatDays.isNotEmpty()) {
        val next = AlarmClockMath.nextTriggerMillis(alarm.hour, alarm.minute, alarm.repeatDays, now)
        if (next == null) {
          alarm.copy(enabled = false, status = "disabled", triggerAt = 0L, updatedAt = now)
        } else {
          alarm.copy(triggerAt = next, status = "scheduled", updatedAt = now)
        }
      } else {
        alarm.copy(enabled = false, status = "dismissed", triggerAt = 0L, updatedAt = now)
      }
    }
    AlarmStore.write(context, updated)
    reschedule(context)
  }

  fun fire(context: Context, id: String) {
    val alarm = AlarmStore.find(context, id) ?: return
    if (!alarm.enabled) {
      return
    }
    val now = System.currentTimeMillis()
    val timezoneShifted = alarm.status != "snoozed" && AlarmClockMath.localMinuteDiff(alarm.hour, alarm.minute, now) > 2
    if (timezoneShifted) {
      val next = AlarmClockMath.nextTriggerMillis(alarm.hour, alarm.minute, alarm.repeatDays, now)
      if (next != null) {
        val shifted = alarm.copy(triggerAt = next, status = "scheduled", enabled = true, updatedAt = now)
        AlarmStore.replace(context, shifted)
        scheduleOne(context, shifted)
      }
      return
    }
    AlarmStore.replace(context, alarm.copy(status = "ringing", updatedAt = now))
    AlarmRingingService.start(context, id)
  }

  fun snooze(context: Context, id: String) {
    val alarm = AlarmStore.find(context, id) ?: return
    AlarmRingingService.stop(context)
    cancel(context, id)
    val now = System.currentTimeMillis()
    val updated = alarm.copy(
      triggerAt = now + alarm.snoozeMinutes.coerceAtLeast(1) * 60_000L,
      enabled = true,
      status = "snoozed",
      updatedAt = now,
    )
    AlarmStore.replace(context, updated)
    scheduleOne(context, updated)
  }

  fun dismiss(context: Context, id: String) {
    val alarm = AlarmStore.find(context, id) ?: return
    AlarmRingingService.stop(context)
    cancel(context, id)
    val now = System.currentTimeMillis()
    val updated = if (alarm.repeatDays.isEmpty()) {
      alarm.copy(enabled = false, status = "dismissed", triggerAt = 0L, updatedAt = now)
    } else {
      val next = AlarmClockMath.nextTriggerMillis(alarm.hour, alarm.minute, alarm.repeatDays, now)
      if (next == null) {
        alarm.copy(enabled = false, status = "disabled", triggerAt = 0L, updatedAt = now)
      } else {
        alarm.copy(enabled = true, status = "scheduled", triggerAt = next, updatedAt = now)
      }
    }
    AlarmStore.replace(context, updated)
    if (updated.enabled) {
      scheduleOne(context, updated)
    }
  }

  private fun reschedule(context: Context): Int {
    val alarms = AlarmStore.read(context)
    val ids = (alarms.map { it.id } + AlarmStore.previousIds(context)).distinct()
    ids.forEach { id -> cancel(context, id) }
    AlarmStore.writeIds(context, alarms.map { it.id })
    val ringing = AlarmRingingService.currentId
    if (ringing != null && alarms.none { it.id == ringing && it.enabled && it.status == "ringing" }) {
      AlarmRingingService.stop(context)
    }
    if (!canScheduleExact(context)) {
      return 0
    }
    var count = 0
    alarms.filter { it.enabled && it.triggerAt > System.currentTimeMillis() && it.status != "ringing" }.forEach { alarm ->
      if (scheduleOne(context, alarm)) {
        count += 1
      }
    }
    return count
  }

  private fun scheduleOne(context: Context, alarm: StoredAlarm): Boolean {
    if (!canScheduleExact(context) || alarm.triggerAt <= System.currentTimeMillis()) {
      return false
    }
    val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return false
    val operation = pendingBroadcast(context, alarm.id, AlarmContract.ACTION_ALARM)
    val show = pendingActivity(context, alarm.id)
    return try {
      alarmManager.setAlarmClock(AlarmManager.AlarmClockInfo(alarm.triggerAt, show), operation)
      true
    } catch (_: SecurityException) {
      false
    }
  }

  private fun cancel(context: Context, id: String) {
    val alarmManager = context.getSystemService(AlarmManager::class.java) ?: return
    alarmManager.cancel(pendingBroadcast(context, id, AlarmContract.ACTION_ALARM))
  }

  fun launchIntent(context: Context, id: String): Intent {
    return Intent(Intent.ACTION_VIEW, Uri.parse("timeflow://alarm/ringing?id=$id")).apply {
      setPackage(context.packageName)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or
        Intent.FLAG_ACTIVITY_CLEAR_TOP or
        Intent.FLAG_ACTIVITY_SINGLE_TOP or
        Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
    }
  }

  fun pendingActivity(context: Context, id: String): PendingIntent {
    return PendingIntent.getActivity(context, requestCode(id, "show"), launchIntent(context, id), pendingFlags())
  }

  fun pendingBroadcast(context: Context, id: String, action: String): PendingIntent {
    val intent = Intent(context, AlarmReceiver::class.java).apply {
      this.action = action
      data = Uri.parse("timeflow://action/$action/$id")
      putExtra(AlarmContract.EXTRA_ID, id)
    }
    return PendingIntent.getBroadcast(context, requestCode(id, action), intent, pendingFlags())
  }

  private fun pendingFlags(): Int {
    return PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  }

  private fun requestCode(id: String, action: String): Int {
    return (id + ":" + action).hashCode()
  }
}
