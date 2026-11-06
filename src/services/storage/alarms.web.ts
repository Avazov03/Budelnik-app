import type { Alarm } from '@/types/alarm';

const ALARMS_KEY = 'timeflow.alarms';
const SETTING_PREFIX = 'timeflow.setting.';

function readAlarms(): Alarm[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  const raw = localStorage.getItem(ALARMS_KEY);
  if (!raw) {
    return [];
  }
  const parsed = JSON.parse(raw) as Alarm[];
  return Array.isArray(parsed) ? parsed : [];
}

function writeAlarms(alarms: Alarm[]): void {
  localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function listAlarms(): Promise<Alarm[]> {
  return readAlarms().sort((left, right) => left.hour - right.hour || left.minute - right.minute || left.title.localeCompare(right.title));
}

export async function upsertAlarm(alarm: Alarm): Promise<void> {
  const next = readAlarms().filter((item) => item.id !== alarm.id);
  next.push(alarm);
  writeAlarms(next);
}

export async function deleteAlarmById(id: string): Promise<void> {
  writeAlarms(readAlarms().filter((item) => item.id !== id));
}

export async function getSetting(key: string): Promise<string | null> {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(`${SETTING_PREFIX}${key}`);
}

export async function setSetting(key: string, value: string): Promise<void> {
  localStorage.setItem(`${SETTING_PREFIX}${key}`, value);
}
