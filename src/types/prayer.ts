export const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type PrayerTimings = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  midnight: string;
};

export type PrayerDay = {
  date: string;
  hijri: string;
  timings: PrayerTimings;
  fetchedAt: string;
  source: 'network' | 'cache';
};

export type PrayerOffsets = {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export type PrayerLocationMode = 'city' | 'gps';

export type PrayerCityId =
  | 'tashkent'
  | 'samarkand'
  | 'bukhara'
  | 'andijan'
  | 'fergana'
  | 'namangan'
  | 'nukus'
  | 'karshi'
  | 'termiz'
  | 'jizzakh'
  | 'navoi'
  | 'gulistan'
  | 'urgench';

export type PrayerWakeRule = {
  prayer: PrayerKey;
  minutesBeforeEnd: number;
  enabled: boolean;
};

export type PrayerSettings = {
  locationMode: PrayerLocationMode;
  cityId: PrayerCityId;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  method: number;
  school: number;
  offsets: PrayerOffsets;
  wake: PrayerWakeRule;
};

export type PrayerQaza = {
  id: string;
  day: string;
  prayer: PrayerKey;
  createdAt: string;
  resolvedAt: string | null;
};

export type PrayerSnapshot = {
  settings: PrayerSettings;
  today: PrayerDay | null;
  tomorrow: PrayerDay | null;
  qaza: PrayerQaza[];
  nextWakeAt: string | null;
  notice: string | null;
};

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Bomdod',
  dhuhr: 'Peshin',
  asr: 'Asr',
  maghrib: 'Shom',
  isha: 'Xufton',
};

export const DEFAULT_OFFSETS: PrayerOffsets = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  locationMode: 'city',
  cityId: 'tashkent',
  latitude: 41.2995,
  longitude: 69.2401,
  locationLabel: 'Toshkent',
  method: 3,
  school: 1,
  offsets: { ...DEFAULT_OFFSETS },
  wake: {
    prayer: 'fajr',
    minutesBeforeEnd: 30,
    enabled: true,
  },
};
