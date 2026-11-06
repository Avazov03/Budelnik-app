import type { CalendarEvent } from '@/types/event';

const EVENTS_KEY = 'timeflow.events';

function readEvents(): CalendarEvent[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) {
    return [];
  }
  const parsed = JSON.parse(raw) as CalendarEvent[];
  return Array.isArray(parsed) ? parsed : [];
}

function writeEvents(events: CalendarEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export async function listEvents(): Promise<CalendarEvent[]> {
  return readEvents().sort((left, right) => left.startAt.localeCompare(right.startAt));
}

export async function upsertEvent(event: CalendarEvent): Promise<void> {
  const next = readEvents().filter((item) => item.id !== event.id);
  next.push(event);
  writeEvents(next);
}

export async function deleteEventById(id: string): Promise<void> {
  writeEvents(readEvents().filter((item) => item.id !== id));
}
