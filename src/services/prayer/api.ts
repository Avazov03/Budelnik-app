import type { PrayerDay, PrayerTimings } from '@/types/prayer';

import { localDayKey, shiftDayKey } from '@/features/prayer/schedule';

type AladhanResponse = {
  code: number;
  data?: {
    timings: Record<string, string>;
    date: {
      readable: string;
      gregorian: { date: string };
      hijri: { date: string };
    };
  };
};

function toIsoDay(gregorian: string): string {
  // DD-MM-YYYY → YYYY-MM-DD
  const [day, month, year] = gregorian.split('-');
  return `${year}-${month}-${day}`;
}

function mapTimings(raw: Record<string, string>): PrayerTimings {
  return {
    fajr: raw.Fajr?.slice(0, 5) ?? '00:00',
    sunrise: raw.Sunrise?.slice(0, 5) ?? '00:00',
    dhuhr: raw.Dhuhr?.slice(0, 5) ?? '00:00',
    asr: raw.Asr?.slice(0, 5) ?? '00:00',
    maghrib: raw.Maghrib?.slice(0, 5) ?? '00:00',
    isha: raw.Isha?.slice(0, 5) ?? '00:00',
    midnight: raw.Midnight?.slice(0, 5) ?? '00:00',
  };
}

export async function fetchPrayerDay(params: {
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  day: string;
}): Promise<PrayerDay> {
  const [year, month, date] = params.day.split('-');
  const pathDate = `${date}-${month}-${year}`;
  const url =
    `https://api.aladhan.com/v1/timings/${pathDate}` +
    `?latitude=${params.latitude}&longitude=${params.longitude}` +
    `&method=${params.method}&school=${params.school}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TimeFlow/1.0',
    },
  });
  if (!response.ok) {
    throw new Error(`Namoz API ${response.status}`);
  }
  const json = (await response.json()) as AladhanResponse;
  if (json.code !== 200 || !json.data) {
    throw new Error('Namoz API javobi yaroqsiz.');
  }
  return {
    date: toIsoDay(json.data.date.gregorian.date),
    hijri: json.data.date.hijri.date,
    timings: mapTimings(json.data.timings),
    fetchedAt: new Date().toISOString(),
    source: 'network',
  };
}

export async function fetchPrayerWindow(params: {
  latitude: number;
  longitude: number;
  method: number;
  school: number;
  now?: Date;
}): Promise<{ today: PrayerDay; tomorrow: PrayerDay }> {
  const now = params.now ?? new Date();
  const todayKey = localDayKey(now);
  const tomorrowKey = shiftDayKey(todayKey, 1);
  const [today, tomorrow] = await Promise.all([
    fetchPrayerDay({ ...params, day: todayKey }),
    fetchPrayerDay({ ...params, day: tomorrowKey }),
  ]);
  return { today, tomorrow };
}
