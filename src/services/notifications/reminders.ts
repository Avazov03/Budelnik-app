import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import type { CalendarEvent } from '@/types/event';

import { canScheduleReminder } from '@/features/calendar/rules';

const CHANNEL_ID = 'timeflow-events';

let configured = false;

export async function configureEventNotifications(): Promise<void> {
  if (configured || Platform.OS === 'web') {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Tadbir eslatmalari',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  configured = true;
}

export async function notificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(eventId).catch(() => undefined);
}

export async function syncEventReminder(
  event: CalendarEvent,
  now: Date,
): Promise<{ scheduled: boolean; message?: string }> {
  await cancelEventReminder(event.id);
  if (!event.reminderEnabled) {
    return { scheduled: false };
  }
  const startAt = new Date(event.startAt);
  if (!canScheduleReminder(startAt, event.reminderOffsetMinutes, true, now)) {
    return { scheduled: false };
  }
  if (Platform.OS === 'web') {
    return { scheduled: false };
  }

  await configureEventNotifications();
  const granted = await notificationPermissionGranted();
  if (!granted) {
    return { scheduled: false, message: 'Bildirishnoma ruxsati yo‘q. Eslatma rejalashtirilmadi.' };
  }

  const when = new Date(startAt.getTime() - event.reminderOffsetMinutes * 60 * 1000);
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: event.id,
      content: {
        title: event.title,
        body:
          event.reminderOffsetMinutes === 0
            ? 'Tadbir boshlandi.'
            : `Boshlanishiga ${event.reminderOffsetMinutes} daqiqa qoldi.`,
        data: { eventId: event.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: CHANNEL_ID,
      },
    });
    return { scheduled: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'noma’lum xatolik';
    return { scheduled: false, message: `Eslatma rejalashtirilmadi: ${detail}` };
  }
}

export async function syncAllEventReminders(events: CalendarEvent[], now: Date): Promise<string | null> {
  const messages: string[] = [];
  for (const event of events) {
    const result = await syncEventReminder(event, now);
    if (result.message) {
      messages.push(`${event.title}: ${result.message}`);
    }
  }
  return messages.length > 0 ? messages.join('\n') : null;
}
