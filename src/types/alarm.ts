export const ALARM_STATUSES = [
  'scheduled',
  'ringing',
  'snoozed',
  'dismissed',
  'disabled',
  'permission_required',
] as const;

export type AlarmStatus = (typeof ALARM_STATUSES)[number];

export type Alarm = {
  id: string;
  title: string;
  hour: number;
  minute: number;
  isEnabled: boolean;
  repeatDays: number[];
  snoozeMinutes: number;
  soundId: string;
  vibrationEnabled: boolean;
  nextTriggerAt: string | null;
  status: AlarmStatus;
  createdAt: string;
  updatedAt: string;
};

export type AlarmDraft = {
  title: string;
  hour: number | null;
  minute: number | null;
  repeatDays: number[];
  isEnabled: boolean;
  snoozeMinutes: number;
  soundId: string;
  vibrationEnabled: boolean;
};

export type ValidAlarmInput = {
  title: string;
  hour: number;
  minute: number;
  repeatDays: number[];
  isEnabled: boolean;
  snoozeMinutes: number;
  soundId: string;
  vibrationEnabled: boolean;
};

export type NativeAlarmRecord = {
  id: string;
  title: string;
  hour: number;
  minute: number;
  repeatDays: number[];
  snoozeMinutes: number;
  soundId: string;
  vibrationEnabled: boolean;
  triggerAt: number;
  enabled: boolean;
  status: AlarmStatus;
  updatedAt: number;
};
