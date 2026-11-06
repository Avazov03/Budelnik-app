import type { EventDraft, ValidEventInput } from '../../types/event';

import { parseLocalDateTime } from '../../utils/datetime';

export const REMINDER_OPTIONS = [0, 5, 10, 15, 30, 60] as const;

export function reminderFireAt(startAt: Date, offsetMinutes: number): Date {
  return new Date(startAt.getTime() - offsetMinutes * 60 * 1000);
}

export function canScheduleReminder(startAt: Date, offsetMinutes: number, enabled: boolean, now: Date): boolean {
  if (!enabled) {
    return false;
  }
  return reminderFireAt(startAt, offsetMinutes).getTime() > now.getTime();
}

export function emptyEventDraft(date: string): EventDraft {
  return {
    title: '',
    description: '',
    date,
    startTime: null,
    endTime: null,
    reminderEnabled: true,
    reminderOffsetMinutes: 15,
  };
}

export function validateEventDraft(
  draft: EventDraft,
  now: Date,
): { ok: true; value: ValidEventInput; warning?: string } | { ok: false; error: string } {
  const title = draft.title.trim();
  if (!title) {
    return { ok: false, error: 'Tadbir nomini yozing.' };
  }
  if (!draft.startTime) {
    return { ok: false, error: 'Boshlanish vaqtini tanlang.' };
  }
  const startAt = parseLocalDateTime(draft.date, draft.startTime);
  if (!startAt) {
    return { ok: false, error: 'Sana yoki boshlanish vaqti noto‘g‘ri.' };
  }

  let endAt: Date | null = null;
  if (draft.endTime) {
    endAt = parseLocalDateTime(draft.date, draft.endTime);
    if (!endAt) {
      return { ok: false, error: 'Tugash vaqti noto‘g‘ri.' };
    }
    if (endAt.getTime() <= startAt.getTime()) {
      return { ok: false, error: 'Tugash vaqti boshlanishidan keyin bo‘lishi kerak.' };
    }
  }

  if (!REMINDER_OPTIONS.includes(draft.reminderOffsetMinutes as (typeof REMINDER_OPTIONS)[number])) {
    return { ok: false, error: 'Eslatma muddati noto‘g‘ri.' };
  }

  const description = draft.description.trim();
  const warning =
    draft.reminderEnabled && !canScheduleReminder(startAt, draft.reminderOffsetMinutes, true, now)
      ? 'Eslatma vaqti o‘tib ketgan. Eslatma rejalashtirilmaydi.'
      : undefined;

  return {
    ok: true,
    value: {
      title: title.slice(0, 80),
      description: description ? description.slice(0, 500) : null,
      startAt,
      endAt,
      reminderEnabled: draft.reminderEnabled,
      reminderOffsetMinutes: draft.reminderOffsetMinutes,
    },
    warning,
  };
}
