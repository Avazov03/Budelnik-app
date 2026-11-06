import type { CalendarEvent } from '@/types/event';

import { getDatabase } from '@/services/storage/db';

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  reminder_enabled: number;
  reminder_offset_minutes: number;
  created_at: string;
  updated_at: string;
};

function mapEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    reminderEnabled: row.reminder_enabled === 1,
    reminderOffsetMinutes: row.reminder_offset_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listEvents(): Promise<CalendarEvent[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EventRow>('SELECT * FROM events ORDER BY start_at');
  return rows.map(mapEvent);
}

export async function upsertEvent(event: CalendarEvent): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO events (
      id, title, description, start_at, end_at, reminder_enabled, reminder_offset_minutes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      start_at = excluded.start_at,
      end_at = excluded.end_at,
      reminder_enabled = excluded.reminder_enabled,
      reminder_offset_minutes = excluded.reminder_offset_minutes,
      updated_at = excluded.updated_at`,
    event.id,
    event.title,
    event.description,
    event.startAt,
    event.endAt,
    event.reminderEnabled ? 1 : 0,
    event.reminderOffsetMinutes,
    event.createdAt,
    event.updatedAt,
  );
}

export async function deleteEventById(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE id = ?', id);
}
