package expo.modules.timeflowalarm

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TimeflowAlarmModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TimeflowAlarm")

    AsyncFunction("syncAlarms") { json: String ->
      AlarmScheduler.sync(requireContext(), json)
    }

    AsyncFunction("getSnapshot") {
      AlarmStore.readJson(requireContext())
    }

    AsyncFunction("snooze") { id: String ->
      val context = requireContext()
      AlarmScheduler.snooze(context, id)
      AlarmStore.readJson(context)
    }

    AsyncFunction("dismiss") { id: String ->
      val context = requireContext()
      AlarmScheduler.dismiss(context, id)
      AlarmStore.readJson(context)
    }

    Function("canScheduleExactAlarms") {
      AlarmScheduler.canScheduleExact(requireContext())
    }

    Function("canPostNotifications") {
      AlarmScheduler.canPostNotifications(requireContext())
    }

    Function("canUseFullScreenIntent") {
      AlarmScheduler.canUseFullScreenIntent(requireContext())
    }

    Function("canDrawOverlays") {
      Settings.canDrawOverlays(requireContext())
    }

    Function("openExactAlarmSettings") {
      val context = requireContext()
      val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
          data = Uri.parse("package:${context.packageName}")
        }
      } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = Uri.parse("package:${context.packageName}")
        }
      }
      startSettings(intent)
    }

    Function("openNotificationSettings") {
      val context = requireContext()
      val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
        putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
      }
      startSettings(intent)
    }

    Function("openFullScreenIntentSettings") {
      val context = requireContext()
      val intent = if (Build.VERSION.SDK_INT >= 34) {
        Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
          data = Uri.parse("package:${context.packageName}")
        }
      } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
          data = Uri.parse("package:${context.packageName}")
        }
      }
      startSettings(intent)
    }

    Function("openBatterySettings") {
      startSettings(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    }

    Function("openOverlaySettings") {
      val context = requireContext()
      startSettings(
        Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${context.packageName}")),
      )
    }

    Function("setRingingWindow") { enabled: Boolean ->
      val activity = appContext.currentActivity ?: return@Function
      activity.runOnUiThread {
        if (activity.isDestroyed) {
          return@runOnUiThread
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
          activity.setShowWhenLocked(enabled)
          activity.setTurnScreenOn(enabled)
        }
        val flags = android.view.WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        if (enabled) {
          activity.window?.addFlags(flags)
        } else {
          activity.window?.clearFlags(flags)
        }
      }
    }

    View(FaceGateView::class) {
      Events("onFace")
      Prop("running") { view: FaceGateView, running: Boolean ->
        view.setRunning(running)
      }
    }
  }

  private fun requireContext() = requireNotNull(appContext.reactContext?.applicationContext) {
    "TimeFlow native context yo‘q"
  }

  private fun startSettings(intent: Intent) {
    val context = appContext.reactContext ?: return
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      context.startActivity(intent)
    } catch (_: ActivityNotFoundException) {
      val fallback = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
        data = Uri.parse("package:${context.packageName}")
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      context.startActivity(fallback)
    }
  }
}
