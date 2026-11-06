import { DEFAULT_PRAYER_SETTINGS, type PrayerSnapshot } from '@/types/prayer';

export const EMPTY_PRAYER: PrayerSnapshot = {
  settings: {
    ...DEFAULT_PRAYER_SETTINGS,
    offsets: { ...DEFAULT_PRAYER_SETTINGS.offsets },
    wake: { ...DEFAULT_PRAYER_SETTINGS.wake },
  },
  today: null,
  tomorrow: null,
  qaza: [],
  nextWakeAt: null,
  notice: null,
};
