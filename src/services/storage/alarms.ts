import { ALARM_STATUSES, type Alarm, type AlarmStatus } from '@/types/alarm';

import { getDatabase } from '@/services/storage/db';

type AlarmRow = {
  id: string;
  title: string;
  hour: number;
  minute: number;
  is_enabled: number;
  repeat_days: string;
  snooze_minutes: number;
  sound_id: string;
  vibration_enabled: number;
  next_trigger_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function asStatus(value: string): AlarmStatus {
  if ((ALARM_STATUSES as readonly string[]).includes(value)) {
    return value as AlarmStatus;
  }
  return 'disabled';
}

function mapAlarm(row: AlarmRow): Alarm {
  const parsedDays = JSON.parse(row.repeat_days) as unknown;
  return {
    id: row.id,
    title: row.title,
    hour: row.hour,
    minute: row.minute,
    isEnabled: row.is_enabled === 1,
    repeatDays: Array.isArray(parsedDays) ? parsedDays.filter((day) => typeof day === 'number') : [],
    snoozeMinutes: row.snooze_minutes,
    soundId: row.sound_id,
    vibrationEnabled: row.vibration_enabled === 1,
    nextTriggerAt: row.next_trigger_at,
    status: asStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAlarms(): Promise<Alarm[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<AlarmRow>('SELECT * FROM alarms ORDER BY hour, minute, title');
  return rows.map(mapAlarm);
}

export async function upsertAlarm(alarm: Alarm): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO alarms (
      id, title, hour, minute, is_enabled, repeat_days, snooze_minutes, sound_id,
      vibration_enabled, next_trigger_at, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      hour = excluded.hour,
      minute = excluded.minute,
      is_enabled = excluded.is_enabled,
      repeat_days = excluded.repeat_days,
      snooze_minutes = excluded.snooze_minutes,
      sound_id = excluded.sound_id,
      vibration_enabled = excluded.vibration_enabled,
      next_trigger_at = excluded.next_trigger_at,
      status = excluded.status,
      updated_at = excluded.updated_at`,
    alarm.id,
    alarm.title,
    alarm.hour,
    alarm.minute,
    alarm.isEnabled ? 1 : 0,
    JSON.stringify(alarm.repeatDays),
    alarm.snoozeMinutes,
    alarm.soundId,
    alarm.vibrationEnabled ? 1 : 0,
    alarm.nextTriggerAt,
    alarm.status,
    alarm.createdAt,
    alarm.updatedAt,
  );
}

export async function deleteAlarmById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM alarms WHERE id = ?', id);
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
