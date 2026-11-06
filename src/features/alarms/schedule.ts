import type { Alarm, AlarmStatus } from '../../types/alarm';

import { isoWeekday } from '../../utils/datetime';

export const SNOOZE_GRACE_MS = 15 * 60 * 1000;

type ScheduleInput = {
  hour: number;
  minute: number;
  repeatDays: number[];
  isEnabled: boolean;
};

function wallTime(base: Date, dayOffset: number, hour: number, minute: number): Date {
  const date = new Date(base.getTime());
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function normalizeRepeatDays(days: number[]): number[] {
  return [...new Set(days.filter((day) => day >= 1 && day <= 7))].sort((a, b) => a - b);
}

export function nextAlarmTrigger(input: ScheduleInput, from: Date): Date | null {
  if (!input.isEnabled) {
    return null;
  }
  const hour = input.hour;
  const minute = input.minute;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const repeatDays = normalizeRepeatDays(input.repeatDays);
  if (repeatDays.length === 0) {
    const today = wallTime(from, 0, hour, minute);
    if (today.getTime() > from.getTime()) {
      return today;
    }
    return wallTime(from, 1, hour, minute);
  }

  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = wallTime(from, offset, hour, minute);
    if (repeatDays.includes(isoWeekday(candidate)) && candidate.getTime() > from.getTime()) {
      return candidate;
    }
  }
  return null;
}

export function snoozeTrigger(from: Date, snoozeMinutes: number): Date {
  return new Date(from.getTime() + snoozeMinutes * 60 * 1000);
}

export function applySnooze(alarm: Alarm, now: Date): Alarm {
  const trigger = snoozeTrigger(now, alarm.snoozeMinutes);
  return {
    ...alarm,
    isEnabled: true,
    status: 'snoozed',
    nextTriggerAt: trigger.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function applyDismiss(alarm: Alarm, now: Date): Alarm {
  if (normalizeRepeatDays(alarm.repeatDays).length === 0) {
    return {
      ...alarm,
      isEnabled: false,
      status: 'dismissed',
      nextTriggerAt: null,
      updatedAt: now.toISOString(),
    };
  }
  const next = nextAlarmTrigger({ ...alarm, isEnabled: true }, now);
  return {
    ...alarm,
    isEnabled: true,
    status: 'scheduled',
    nextTriggerAt: next ? next.toISOString() : null,
    updatedAt: now.toISOString(),
  };
}

export function projectAlarm(
  alarm: Alarm,
  now: Date,
  canSchedule: boolean,
): Alarm {
  if (!alarm.isEnabled) {
    return {
      ...alarm,
      status: alarm.status === 'dismissed' ? 'dismissed' : 'disabled',
      nextTriggerAt: null,
    };
  }

  if (alarm.status === 'ringing') {
    return alarm;
  }

  if (alarm.status === 'snoozed' && alarm.nextTriggerAt && Date.parse(alarm.nextTriggerAt) > now.getTime()) {
    return {
      ...alarm,
      status: canSchedule ? 'snoozed' : 'permission_required',
    };
  }

  const next = nextAlarmTrigger(alarm, now);
  const status: AlarmStatus = canSchedule ? 'scheduled' : 'permission_required';
  return {
    ...alarm,
    status,
    nextTriggerAt: next ? next.toISOString() : null,
  };
}

export function triggersById(
  alarms: Array<{ id: string; hour: number; minute: number; repeatDays: number[]; isEnabled: boolean }>,
  from: Date,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const alarm of alarms) {
    const next = nextAlarmTrigger(alarm, from);
    result[alarm.id] = next ? next.toISOString() : null;
  }
  return result;
}

export function compareAlarms(left: Alarm, right: Alarm): number {
  const leftTime = left.nextTriggerAt ? Date.parse(left.nextTriggerAt) : Number.POSITIVE_INFINITY;
  const rightTime = right.nextTriggerAt ? Date.parse(right.nextTriggerAt) : Number.POSITIVE_INFINITY;
  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }
  return left.hour * 60 + left.minute - (right.hour * 60 + right.minute);
}
