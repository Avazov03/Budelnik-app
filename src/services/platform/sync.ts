import type { Alarm, AlarmStatus, NativeAlarmRecord } from '@/types/alarm';
import type { CalendarEvent } from '@/types/event';
import type { ValidAlarmInput } from '@/types/alarm';
import type { ValidEventInput } from '@/types/event';
import type { PrayerSnapshot } from '@/types/prayer';

import { applyDismiss, applySnooze, projectAlarm } from '@/features/alarms/schedule';
import { cancelEventReminder, syncAllEventReminders, syncEventReminder } from '@/services/notifications/reminders';
import {
  getTimeflowAlarm,
  parseSyncResult,
  readNativeSnapshot,
  type NativeSyncResult,
} from '@/services/native-alarm';
import { refreshPrayer } from '@/services/prayer/sync';
import { deleteAlarmById, getSetting, listAlarms, setSetting, upsertAlarm } from '@/services/storage/alarms';
import { deleteEventById, listEvents, upsertEvent } from '@/services/storage/events';
import { createId } from '@/utils/id';
import { timeZoneName } from '@/utils/datetime';

export type ThemePreference = 'system' | 'light' | 'dark';

export type PlatformSnapshot = {
  nativeAvailable: boolean;
  exactAlarm: boolean;
  notifications: boolean;
  fullScreenIntent: boolean;
  overlay: boolean;
};

export type AppSnapshot = {
  alarms: Alarm[];
  events: CalendarEvent[];
  theme: ThemePreference;
  platform: PlatformSnapshot;
  prayer: PrayerSnapshot;
  notice: string | null;
};

const EMPTY_PLATFORM: PlatformSnapshot = {
  nativeAvailable: false,
  exactAlarm: false,
  notifications: false,
  fullScreenIntent: false,
  overlay: false,
};

function asTheme(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return 'system';
}

function asStatus(value: string): AlarmStatus {
  if (
    value === 'scheduled' ||
    value === 'ringing' ||
    value === 'snoozed' ||
    value === 'dismissed' ||
    value === 'disabled' ||
    value === 'permission_required'
  ) {
    return value;
  }
  return 'scheduled';
}

export async function readPlatform(): Promise<PlatformSnapshot> {
  const native = getTimeflowAlarm();
  if (!native) {
    return EMPTY_PLATFORM;
  }
  return {
    nativeAvailable: true,
    exactAlarm: native.canScheduleExactAlarms(),
    notifications: native.canPostNotifications(),
    fullScreenIntent: native.canUseFullScreenIntent(),
    overlay: native.canDrawOverlays(),
  };
}

function canSchedule(platform: PlatformSnapshot): boolean {
  return platform.nativeAvailable && platform.exactAlarm;
}

function mergeNative(alarms: Alarm[], snapshot: NativeAlarmRecord[]): Alarm[] {
  const remoteById = new Map(snapshot.map((item) => [item.id, item]));
  return alarms.map((alarm) => {
    const remote = remoteById.get(alarm.id);
    if (!remote || remote.updatedAt <= Date.parse(alarm.updatedAt)) {
      return alarm;
    }
    return {
      ...alarm,
      isEnabled: remote.enabled,
      status: asStatus(remote.status),
      nextTriggerAt: remote.triggerAt > 0 ? new Date(remote.triggerAt).toISOString() : null,
      updatedAt: new Date(remote.updatedAt).toISOString(),
    };
  });
}

function toNative(alarm: Alarm): NativeAlarmRecord {
  return {
    id: alarm.id,
    title: alarm.title,
    hour: alarm.hour,
    minute: alarm.minute,
    repeatDays: alarm.repeatDays,
    snoozeMinutes: alarm.snoozeMinutes,
    soundId: alarm.soundId,
    vibrationEnabled: alarm.vibrationEnabled,
    triggerAt: alarm.nextTriggerAt ? Date.parse(alarm.nextTriggerAt) : 0,
    enabled: alarm.isEnabled && alarm.status !== 'dismissed' && alarm.status !== 'disabled',
    status: alarm.status,
    updatedAt: Date.parse(alarm.updatedAt),
  };
}

async function persistAlarms(alarms: Alarm[]): Promise<void> {
  for (const alarm of alarms) {
    await upsertAlarm(alarm);
  }
}

async function pushNative(alarms: Alarm[]): Promise<NativeSyncResult | null> {
  const native = getTimeflowAlarm();
  if (!native) {
    return null;
  }
  const payload = alarms.map(toNative);
  const raw = await native.syncAlarms(JSON.stringify(payload));
  return parseSyncResult(raw);
}

export async function refreshAll(now = new Date()): Promise<AppSnapshot> {
  const platform = await readPlatform();
  const prayer = await refreshPrayer(now);
  const stored = mergeNative(await listAlarms(), await readNativeSnapshot());
  const alarms = stored.map((alarm) => projectAlarm(alarm, now, canSchedule(platform)));
  await persistAlarms(alarms);
  const nativeResult = await pushNative(alarms);
  const events = await listEvents();
  const reminderNotice = await syncAllEventReminders(events, now);
  await setSetting('timeZone', timeZoneName());
  const theme = asTheme(await getSetting('theme'));
  return {
    alarms,
    events,
    theme,
    platform,
    prayer,
    notice: unexpectedNativeFailure(nativeResult) ?? prayer.notice ?? reminderNotice,
  };
}

function unexpectedNativeFailure(result: NativeSyncResult | null): string | null {
  if (result && !result.ok && result.reason === 'native') {
    return 'Budilnik tizimga yozilmadi.';
  }
  return null;
}

export async function saveAlarm(input: ValidAlarmInput, existingId?: string, now = new Date()): Promise<AppSnapshot> {
  const current = existingId ? (await listAlarms()).find((alarm) => alarm.id === existingId) : undefined;
  const base: Alarm = {
    id: current?.id ?? createId(),
    title: input.title,
    hour: input.hour,
    minute: input.minute,
    isEnabled: input.isEnabled,
    repeatDays: input.repeatDays,
    snoozeMinutes: input.snoozeMinutes,
    soundId: input.soundId,
    vibrationEnabled: input.vibrationEnabled,
    nextTriggerAt: null,
    status: input.isEnabled ? 'scheduled' : 'disabled',
    createdAt: current?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await upsertAlarm(base);
  return refreshAll(now);
}

export async function removeAlarm(id: string, now = new Date()): Promise<AppSnapshot> {
  await deleteAlarmById(id);
  const native = getTimeflowAlarm();
  if (native) {
    const remaining = await listAlarms();
    await native.syncAlarms(JSON.stringify(remaining.map(toNative)));
  }
  return refreshAll(now);
}

export async function setAlarmEnabled(id: string, enabled: boolean, now = new Date()): Promise<AppSnapshot> {
  const alarm = (await listAlarms()).find((item) => item.id === id);
  if (!alarm) {
    throw new Error('Budilnik topilmadi.');
  }
  await upsertAlarm({
    ...alarm,
    isEnabled: enabled,
    status: enabled ? 'scheduled' : 'disabled',
    updatedAt: now.toISOString(),
  });
  return refreshAll(now);
}

export async function snoozeAlarm(id: string, now = new Date()): Promise<AppSnapshot> {
  const native = getTimeflowAlarm();
  if (native) {
    await native.snooze(id);
    return refreshAll(now);
  }
  const alarm = (await listAlarms()).find((item) => item.id === id);
  if (!alarm) {
    throw new Error('Budilnik topilmadi.');
  }
  await upsertAlarm(applySnooze(alarm, now));
  return refreshAll(now);
}

export async function dismissAlarm(id: string, now = new Date()): Promise<AppSnapshot> {
  const native = getTimeflowAlarm();
  if (native) {
    await native.dismiss(id);
    return refreshAll(now);
  }
  const alarm = (await listAlarms()).find((item) => item.id === id);
  if (!alarm) {
    throw new Error('Budilnik topilmadi.');
  }
  await upsertAlarm(applyDismiss(alarm, now));
  return refreshAll(now);
}

export async function saveEventRecord(input: ValidEventInput, existingId?: string, now = new Date()): Promise<{ snapshot: AppSnapshot; warning?: string }> {
  const current = existingId ? (await listEvents()).find((event) => event.id === existingId) : undefined;
  const event: CalendarEvent = {
    id: current?.id ?? createId(),
    title: input.title,
    description: input.description,
    startAt: input.startAt.toISOString(),
    endAt: input.endAt ? input.endAt.toISOString() : null,
    reminderEnabled: input.reminderEnabled,
    reminderOffsetMinutes: input.reminderOffsetMinutes,
    createdAt: current?.createdAt ?? now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await upsertEvent(event);
  const reminder = await syncEventReminder(event, now);
  const snapshot = await refreshAll(now);
  return { snapshot, warning: reminder.message };
}

export async function removeEvent(id: string, now = new Date()): Promise<AppSnapshot> {
  await cancelEventReminder(id);
  await deleteEventById(id);
  return refreshAll(now);
}

export async function saveTheme(theme: ThemePreference): Promise<void> {
  await setSetting('theme', theme);
}
