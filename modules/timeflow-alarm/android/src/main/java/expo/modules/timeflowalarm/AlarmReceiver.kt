package expo.modules.timeflowalarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    val id = intent.getStringExtra(AlarmContract.EXTRA_ID) ?: return
    val appContext = context.applicationContext
    val pending = goAsync()
    try {
      when (action) {
        AlarmContract.ACTION_SNOOZE -> AlarmScheduler.snooze(appContext, id)
        AlarmContract.ACTION_DISMISS -> AlarmScheduler.dismiss(appContext, id)
        else -> AlarmScheduler.fire(appContext, id)
      }
    } finally {
      pending.finish()
    }
  }
}

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    if (
      action != Intent.ACTION_BOOT_COMPLETED &&
      action != Intent.ACTION_LOCKED_BOOT_COMPLETED &&
      action != Intent.ACTION_MY_PACKAGE_REPLACED
    ) {
      return
    }
    val pending = goAsync()
    try {
      AlarmScheduler.restoreAfterBoot(context.applicationContext)
    } catch (_: IllegalStateException) {
      // Credential storage is still locked during direct boot.
    } finally {
      pending.finish()
    }
  }
}
