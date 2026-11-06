import {
  DEFAULT_PRAYER_SETTINGS,
  PRAYER_KEYS,
  type PrayerCityId,
  type PrayerDay,
  type PrayerKey,
  type PrayerQaza,
  type PrayerSettings,
} from '@/types/prayer';

import { getSetting, setSetting } from '@/services/storage/alarms';
import { createId } from '@/utils/id';

const SETTINGS_KEY = 'prayer.settings';
const TODAY_KEY = 'prayer.today';
const TOMORROW_KEY = 'prayer.tomorrow';
const QAZA_KEY = 'prayer.qaza';

function asPrayerKey(value: string): PrayerKey | null {
  return (PRAYER_KEYS as readonly string[]).includes(value) ? (value as PrayerKey) : null;
}

function parseSettings(raw: string | null): PrayerSettings {
  if (!raw) {
    return { ...DEFAULT_PRAYER_SETTINGS, offsets: { ...DEFAULT_PRAYER_SETTINGS.offsets }, wake: { ...DEFAULT_PRAYER_SETTINGS.wake } };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PrayerSettings>;
    const wakePrayer = asPrayerKey(String(parsed.wake?.prayer ?? 'fajr')) ?? 'fajr';
    return {
      locationMode: parsed.locationMode === 'gps' ? 'gps' : 'city',
      cityId: (parsed.cityId as PrayerCityId) || DEFAULT_PRAYER_SETTINGS.cityId,
      latitude: typeof parsed.latitude === 'number' ? parsed.latitude : DEFAULT_PRAYER_SETTINGS.latitude,
      longitude: typeof parsed.longitude === 'number' ? parsed.longitude : DEFAULT_PRAYER_SETTINGS.longitude,
      locationLabel: typeof parsed.locationLabel === 'string' ? parsed.locationLabel : DEFAULT_PRAYER_SETTINGS.locationLabel,
      method: typeof parsed.method === 'number' ? parsed.method : 3,
      school: typeof parsed.school === 'number' ? parsed.school : 1,
      offsets: {
        fajr: Number(parsed.offsets?.fajr ?? 0),
        sunrise: Number(parsed.offsets?.sunrise ?? 0),
        dhuhr: Number(parsed.offsets?.dhuhr ?? 0),
        asr: Number(parsed.offsets?.asr ?? 0),
        maghrib: Number(parsed.offsets?.maghrib ?? 0),
        isha: Number(parsed.offsets?.isha ?? 0),
      },
      wake: {
        prayer: wakePrayer,
        minutesBeforeEnd: Math.max(0, Number(parsed.wake?.minutesBeforeEnd ?? 30)),
        enabled: parsed.wake?.enabled !== false,
      },
    };
  } catch {
    return { ...DEFAULT_PRAYER_SETTINGS, offsets: { ...DEFAULT_PRAYER_SETTINGS.offsets }, wake: { ...DEFAULT_PRAYER_SETTINGS.wake } };
  }
}

function parseDay(raw: string | null): PrayerDay | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as PrayerDay;
    if (!parsed?.date || !parsed.timings) {
      return null;
    }
    return { ...parsed, source: 'cache' };
  } catch {
    return null;
  }
}

function readQaza(): PrayerQaza[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(QAZA_KEY) ?? '[]') as PrayerQaza[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQaza(items: PrayerQaza[]): void {
  localStorage.setItem(QAZA_KEY, JSON.stringify(items));
}

export async function ensurePrayerSchema(): Promise<void> {}

export async function readPrayerSettings(): Promise<PrayerSettings> {
  return parseSettings(await getSetting(SETTINGS_KEY));
}

export async function writePrayerSettings(settings: PrayerSettings): Promise<void> {
  await setSetting(SETTINGS_KEY, JSON.stringify(settings));
}

export async function readCachedPrayerDays(): Promise<{ today: PrayerDay | null; tomorrow: PrayerDay | null }> {
  return {
    today: parseDay(await getSetting(TODAY_KEY)),
    tomorrow: parseDay(await getSetting(TOMORROW_KEY)),
  };
}

export async function writeCachedPrayerDays(today: PrayerDay, tomorrow: PrayerDay): Promise<void> {
  await setSetting(TODAY_KEY, JSON.stringify(today));
  await setSetting(TOMORROW_KEY, JSON.stringify(tomorrow));
}

export async function listOpenQaza(): Promise<PrayerQaza[]> {
  return readQaza()
    .filter((item) => !item.resolvedAt)
    .sort((left, right) => right.day.localeCompare(left.day) || left.prayer.localeCompare(right.prayer));
}

export async function addQaza(day: string, prayer: PrayerKey, now = new Date()): Promise<void> {
  const items = readQaza();
  if (items.some((item) => item.day === day && item.prayer === prayer && !item.resolvedAt)) {
    return;
  }
  items.push({ id: createId(), day, prayer, createdAt: now.toISOString(), resolvedAt: null });
  writeQaza(items);
}

export async function resolveQaza(id: string, now = new Date()): Promise<void> {
  writeQaza(
    readQaza().map((item) => (item.id === id ? { ...item, resolvedAt: now.toISOString() } : item)),
  );
}

export async function markPrayed(day: string, prayer: PrayerKey): Promise<void> {
  await setSetting(`prayer.done.${day}.${prayer}`, '1');
}

export async function wasPrayed(day: string, prayer: PrayerKey): Promise<boolean> {
  return (await getSetting(`prayer.done.${day}.${prayer}`)) === '1';
}
