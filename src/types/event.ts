export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type EventDraft = {
  title: string;
  description: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number;
};

export type ValidEventInput = {
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number;
};
