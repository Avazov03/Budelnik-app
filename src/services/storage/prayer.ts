import {
  DEFAULT_PRAYER_SETTINGS,
  PRAYER_KEYS,
  type PrayerCityId,
  type PrayerDay,
  type PrayerKey,
  type PrayerQaza,
  type PrayerSettings,
} from '@/types/prayer';

import { getDatabase } from '@/services/storage/db';
import { getSetting, setSetting } from '@/services/storage/alarms';
import { createId } from '@/utils/id';

const SETTINGS_KEY = 'prayer.settings';
const TODAY_KEY = 'prayer.today';
const TOMORROW_KEY = 'prayer.tomorrow';

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

export async function ensurePrayerSchema(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS prayer_qaza (
      id TEXT PRIMARY KEY NOT NULL,
      day TEXT NOT NULL,
      prayer_key TEXT NOT NULL,
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS prayer_qaza_open_unique
      ON prayer_qaza(day, prayer_key)
      WHERE resolved_at IS NULL;
  `);
}

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
  await ensurePrayerSchema();
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    day: string;
    prayer_key: string;
    created_at: string;
    resolved_at: string | null;
  }>('SELECT * FROM prayer_qaza WHERE resolved_at IS NULL ORDER BY day DESC, prayer_key ASC');
  return rows
    .map((row) => {
      const prayer = asPrayerKey(row.prayer_key);
      if (!prayer) {
        return null;
      }
      return {
        id: row.id,
        day: row.day,
        prayer,
        createdAt: row.created_at,
        resolvedAt: row.resolved_at,
      };
    })
    .filter((item): item is PrayerQaza => Boolean(item));
}

export async function addQaza(day: string, prayer: PrayerKey, now = new Date()): Promise<void> {
  await ensurePrayerSchema();
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM prayer_qaza WHERE day = ? AND prayer_key = ? AND resolved_at IS NULL',
    day,
    prayer,
  );
  if (existing) {
    return;
  }
  await db.runAsync(
    'INSERT INTO prayer_qaza (id, day, prayer_key, created_at, resolved_at) VALUES (?, ?, ?, ?, NULL)',
    createId(),
    day,
    prayer,
    now.toISOString(),
  );
}

export async function resolveQaza(id: string, now = new Date()): Promise<void> {
  await ensurePrayerSchema();
  const db = await getDatabase();
  await db.runAsync('UPDATE prayer_qaza SET resolved_at = ? WHERE id = ?', now.toISOString(), id);
}

export async function markPrayed(day: string, prayer: PrayerKey): Promise<void> {
  await setSetting(`prayer.done.${day}.${prayer}`, '1');
}

export async function wasPrayed(day: string, prayer: PrayerKey): Promise<boolean> {
  return (await getSetting(`prayer.done.${day}.${prayer}`)) === '1';
}
