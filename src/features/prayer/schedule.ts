import type { PrayerDay, PrayerKey, PrayerOffsets, PrayerTimings, PrayerWakeRule } from '@/types/prayer';

const CLOCK = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

export function parseClock(value: string, day: string): Date | null {
  const match = CLOCK.exec(value.trim());
  if (!match) {
    return null;
  }
  const [year, month, date] = day.split('-').map((part) => Number(part));
  if (!year || !month || !date) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }
  return new Date(year, month - 1, date, hour, minute, 0, 0);
}

export function applyOffset(clock: string, minutes: number): string {
  const match = CLOCK.exec(clock.trim());
  if (!match) {
    return clock;
  }
  const total = Number(match[1]) * 60 + Number(match[2]) + minutes;
  const normalized = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function withOffsets(timings: PrayerTimings, offsets: PrayerOffsets): PrayerTimings {
  return {
    fajr: applyOffset(timings.fajr, offsets.fajr),
    sunrise: applyOffset(timings.sunrise, offsets.sunrise),
    dhuhr: applyOffset(timings.dhuhr, offsets.dhuhr),
    asr: applyOffset(timings.asr, offsets.asr),
    maghrib: applyOffset(timings.maghrib, offsets.maghrib),
    isha: applyOffset(timings.isha, offsets.isha),
    midnight: timings.midnight,
  };
}

/** Prayer window ends when the next marker begins. */
export function prayerWindowEnd(prayer: PrayerKey, timings: PrayerTimings): string {
  switch (prayer) {
    case 'fajr':
      return timings.sunrise;
    case 'dhuhr':
      return timings.asr;
    case 'asr':
      return timings.maghrib;
    case 'maghrib':
      return timings.isha;
    case 'isha':
      return timings.midnight || timings.fajr;
  }
}

export function prayerWindowStart(prayer: PrayerKey, timings: PrayerTimings): string {
  return timings[prayer];
}

export function wakeTriggerForDay(
  day: PrayerDay,
  wake: PrayerWakeRule,
  offsets: PrayerOffsets,
): Date | null {
  if (!wake.enabled) {
    return null;
  }
  const timings = withOffsets(day.timings, offsets);
  const endClock = prayerWindowEnd(wake.prayer, timings);
  const end = parseClock(endClock, day.date);
  if (!end) {
    return null;
  }
  return new Date(end.getTime() - Math.max(0, wake.minutesBeforeEnd) * 60_000);
}

export function nextWakeTrigger(
  today: PrayerDay | null,
  tomorrow: PrayerDay | null,
  wake: PrayerWakeRule,
  offsets: PrayerOffsets,
  now: Date,
): Date | null {
  const candidates = [today, tomorrow]
    .filter((day): day is PrayerDay => Boolean(day))
    .map((day) => wakeTriggerForDay(day, wake, offsets))
    .filter((value): value is Date => Boolean(value))
    .filter((value) => value.getTime() > now.getTime())
    .sort((left, right) => left.getTime() - right.getTime());
  return candidates[0] ?? null;
}

export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function shiftDayKey(day: string, delta: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const next = new Date(year, month - 1, date + delta);
  return localDayKey(next);
}
