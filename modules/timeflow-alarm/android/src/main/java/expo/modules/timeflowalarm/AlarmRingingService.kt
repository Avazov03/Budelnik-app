package expo.modules.timeflowalarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat

class AlarmRingingService : Service() {
  private var ringtone: Ringtone? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private var screenWakeLock: PowerManager.WakeLock? = null
  private var vibrator: Vibrator? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val id = intent?.getStringExtra(AlarmContract.EXTRA_ID)
    val alarm = id?.let { AlarmStore.find(this, it) }
    if (alarm == null) {
      stopSelf()
      return START_NOT_STICKY
    }
    currentId = alarm.id
    createChannel()
    val notification = buildNotification(alarm)
    val type = if (Build.VERSION.SDK_INT >= 29) {
      android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
    } else {
      0
    }
    try {
      ServiceCompat.startForeground(this, AlarmContract.NOTIFICATION_ID, notification, type)
    } catch (_: Exception) {
      val manager = getSystemService(NotificationManager::class.java)
      manager?.notify(AlarmContract.NOTIFICATION_ID, notification)
    }
    acquireWakeLock()
    startSound()
    startVibration(alarm.vibrationEnabled)
    revealAlarm(alarm.id)
    return START_STICKY
  }

  override fun onDestroy() {
    ringtone?.stop()
    ringtone = null
    vibrator?.cancel()
    vibrator = null
    wakeLock?.let { lock ->
      if (lock.isHeld) {
        lock.release()
      }
    }
    wakeLock = null
    screenWakeLock?.let { lock ->
      if (lock.isHeld) {
        lock.release()
      }
    }
    screenWakeLock = null
    currentId = null
    super.onDestroy()
  }

  private fun revealAlarm(id: String) {
    val power = getSystemService(PowerManager::class.java)
    @Suppress("DEPRECATION")
    val screen = power?.newWakeLock(
      PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
        PowerManager.ACQUIRE_CAUSES_WAKEUP or
        PowerManager.ON_AFTER_RELEASE,
      "timeflow:screen",
    )
    screen?.acquire(20_000L)
    screenWakeLock = screen
    // PendingIntent.send is more reliable than startActivity from a service on Android 10+.
    try {
      AlarmScheduler.pendingActivity(this, id).send()
    } catch (_: Exception) {
      try {
        startActivity(AlarmScheduler.launchIntent(this, id))
      } catch (_: Exception) {
        // Full-screen intent on the notification remains the fallback.
      }
    }
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = getSystemService(NotificationManager::class.java) ?: return
    val channel = NotificationChannel(
      AlarmContract.CHANNEL_ID,
      "Budilnik",
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = "TimeFlow budilnik signali"
      setSound(null, null)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      setBypassDnd(true)
      enableVibration(true)
    }
    manager.createNotificationChannel(channel)
  }

  private fun buildNotification(alarm: StoredAlarm): android.app.Notification {
    val time = "%02d:%02d".format(alarm.hour, alarm.minute)
    val open = PendingIntent.getActivity(
      this,
      (alarm.id + ":open").hashCode(),
      AlarmScheduler.launchIntent(this, alarm.id),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    return NotificationCompat.Builder(this, AlarmContract.CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
      .setContentTitle(alarm.title)
      .setContentText(time)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(open)
      .setFullScreenIntent(open, true)
      .addAction(0, "Kechiktirish", AlarmScheduler.pendingBroadcast(this, alarm.id, AlarmContract.ACTION_SNOOZE))
      .addAction(0, "To‘xtatish", AlarmScheduler.pendingBroadcast(this, alarm.id, AlarmContract.ACTION_DISMISS))
      .build()
  }

  private fun startSound() {
    ringtone?.stop()
    val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
      ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
    val next = if (uri == null) null else RingtoneManager.getRingtone(this, uri)
    if (next == null) {
      ringtone = null
      return
    }
    next.audioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_ALARM)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      next.isLooping = true
    }
    next.play()
    ringtone = next
  }

  private fun startVibration(enabled: Boolean) {
    vibrator?.cancel()
    if (!enabled) {
      vibrator = null
      return
    }
    val device = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      getSystemService(VibratorManager::class.java)?.defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Vibrator::class.java)
    }
    if (device == null || !device.hasVibrator()) {
      vibrator = null
      return
    }
    device.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 500, 400), 0))
    vibrator = device
  }

  private fun acquireWakeLock() {
    wakeLock?.let { lock ->
      if (lock.isHeld) {
        lock.release()
      }
    }
    val power = getSystemService(PowerManager::class.java) ?: return
    val lock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "timeflow:alarm")
    lock.acquire(10 * 60 * 1000L)
    wakeLock = lock
  }

  companion object {
    @Volatile
    var currentId: String? = null

    fun start(context: Context, id: String) {
      val intent = Intent(context, AlarmRingingService::class.java).apply {
        putExtra(AlarmContract.EXTRA_ID, id)
      }
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, AlarmRingingService::class.java))
    }
  }
}
