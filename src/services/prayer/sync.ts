import type { Alarm } from '@/types/alarm';
import {
  DEFAULT_PRAYER_SETTINGS,
  PRAYER_LABELS,
  type PrayerDay,
  type PrayerKey,
  type PrayerSettings,
  type PrayerSnapshot,
} from '@/types/prayer';

import { cityById } from '@/features/prayer/cities';
import { localDayKey, nextWakeTrigger, parseClock, prayerWindowEnd, shiftDayKey, withOffsets } from '@/features/prayer/schedule';
import { fetchPrayerWindow } from '@/services/prayer/api';
import { upsertAlarm, deleteAlarmById, listAlarms } from '@/services/storage/alarms';
import {
  addQaza,
  listOpenQaza,
  markPrayed,
  readCachedPrayerDays,
  readPrayerSettings,
  resolveQaza,
  wasPrayed,
  writeCachedPrayerDays,
  writePrayerSettings,
} from '@/services/storage/prayer';

export const PRAYER_WAKE_ALARM_ID = 'prayer:wake';

function coordsOf(settings: PrayerSettings): { latitude: number; longitude: number; label: string } {
  if (
    settings.locationMode === 'gps' &&
    typeof settings.latitude === 'number' &&
    typeof settings.longitude === 'number'
  ) {
    return {
      latitude: settings.latitude,
      longitude: settings.longitude,
      label: settings.locationLabel || 'GPS joy',
    };
  }
  const city = cityById(settings.cityId);
  return { latitude: city.latitude, longitude: city.longitude, label: city.label };
}

function isStale(day: PrayerDay | null, expectedDate: string, now: Date): boolean {
  if (!day || day.date !== expectedDate) {
    return true;
  }
  const age = now.getTime() - Date.parse(day.fetchedAt);
  return Number.isNaN(age) || age > 12 * 60 * 60 * 1000;
}

async function syncWakeAlarm(
  settings: PrayerSettings,
  today: PrayerDay | null,
  tomorrow: PrayerDay | null,
  now: Date,
): Promise<string | null> {
  const next = nextWakeTrigger(today, tomorrow, settings.wake, settings.offsets, now);
  if (!settings.wake.enabled || !next) {
    const existing = (await listAlarms()).find((alarm) => alarm.id === PRAYER_WAKE_ALARM_ID);
    if (existing) {
      await deleteAlarmById(PRAYER_WAKE_ALARM_ID);
    }
    return null;
  }

  const title = `${PRAYER_LABELS[settings.wake.prayer]} · tugashiga ${settings.wake.minutesBeforeEnd} daq`;
  const alarm: Alarm = {
    id: PRAYER_WAKE_ALARM_ID,
    title,
    hour: next.getHours(),
    minute: next.getMinutes(),
    isEnabled: true,
    repeatDays: [],
    snoozeMinutes: 5,
    soundId: 'default',
    vibrationEnabled: true,
    nextTriggerAt: next.toISOString(),
    status: 'scheduled',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await upsertAlarm(alarm);
  return next.toISOString();
}

async function collectMissedQaza(settings: PrayerSettings, today: PrayerDay | null, now: Date): Promise<void> {
  if (!today || !settings.wake.enabled) {
    return;
  }
  const prayer = settings.wake.prayer;
  const timings = withOffsets(today.timings, settings.offsets);
  const end = parseClock(prayerWindowEnd(prayer, timings), today.date);
  if (!end || end.getTime() > now.getTime()) {
    return;
  }
  if (await wasPrayed(today.date, prayer)) {
    return;
  }
  await addQaza(today.date, prayer, now);
}

export async function refreshPrayer(now = new Date()): Promise<PrayerSnapshot> {
  const settings = await readPrayerSettings();
  const place = coordsOf(settings);
  const cached = await readCachedPrayerDays();
  const todayKey = localDayKey(now);
  let today = cached.today;
  let tomorrow = cached.tomorrow;
  let notice: string | null = null;

  const needsNetwork = isStale(today, todayKey, now) || isStale(tomorrow, shiftDayKey(todayKey, 1), now);

  if (needsNetwork) {
    try {
      const fresh = await fetchPrayerWindow({
        latitude: place.latitude,
        longitude: place.longitude,
        method: settings.method,
        school: settings.school,
        now,
      });
      today = fresh.today;
      tomorrow = fresh.tomorrow;
      await writeCachedPrayerDays(today, tomorrow);
    } catch {
      notice = today
        ? 'Internet yo‘q. Oxirgi yuklangan namoz jadvali ko‘rsatilmoqda.'
        : 'Namoz vaqtlari yuklanmadi. Internetni yoqing.';
    }
  }

  await collectMissedQaza(settings, today, now);
  const nextWakeAt = await syncWakeAlarm(settings, today, tomorrow, now);
  const qaza = await listOpenQaza();

  return {
    settings: {
      ...settings,
      latitude: place.latitude,
      longitude: place.longitude,
      locationLabel: place.label,
    },
    today,
    tomorrow,
    qaza,
    nextWakeAt,
    notice,
  };
}

export async function savePrayerSettings(next: PrayerSettings, now = new Date()): Promise<PrayerSnapshot> {
  const city = cityById(next.cityId);
  const normalized: PrayerSettings = {
    ...DEFAULT_PRAYER_SETTINGS,
    ...next,
    offsets: { ...DEFAULT_PRAYER_SETTINGS.offsets, ...next.offsets },
    wake: { ...DEFAULT_PRAYER_SETTINGS.wake, ...next.wake },
    latitude: next.locationMode === 'city' ? city.latitude : next.latitude,
    longitude: next.locationMode === 'city' ? city.longitude : next.longitude,
    locationLabel: next.locationMode === 'city' ? city.label : next.locationLabel || 'GPS joy',
  };
  await writePrayerSettings(normalized);
  return refreshPrayer(now);
}

export async function markPrayerDone(day: string, prayer: PrayerKey, now = new Date()): Promise<PrayerSnapshot> {
  await markPrayed(day, prayer);
  const open = await listOpenQaza();
  const match = open.find((item) => item.day === day && item.prayer === prayer);
  if (match) {
    await resolveQaza(match.id, now);
  }
  return refreshPrayer(now);
}

export async function resolvePrayerQaza(id: string, now = new Date()): Promise<PrayerSnapshot> {
  await resolveQaza(id, now);
  return refreshPrayer(now);
}

export async function addManualQaza(day: string, prayer: PrayerKey, now = new Date()): Promise<PrayerSnapshot> {
  await addQaza(day, prayer, now);
  return refreshPrayer(now);
}
