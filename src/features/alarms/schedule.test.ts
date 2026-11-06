import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyDismiss, applySnooze, nextAlarmTrigger, triggersById } from './schedule.ts';
import { emptyAlarmDraft, validateAlarmDraft } from './validation.ts';

import type { Alarm } from '../../types/alarm.ts';

function at(year: number, month: number, day: number, hour: number, minute: number): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function sample(overrides: Partial<Alarm> = {}): Alarm {
  return {
    id: 'a',
    title: 'Budilnik',
    hour: 7,
    minute: 0,
    isEnabled: true,
    repeatDays: [],
    snoozeMinutes: 5,
    soundId: 'default',
    vibrationEnabled: true,
    nextTriggerAt: null,
    status: 'scheduled',
    createdAt: '2026-10-26T00:00:00.000Z',
    updatedAt: '2026-10-26T00:00:00.000Z',
    ...overrides,
  };
}

describe('nextAlarmTrigger', () => {
  it('schedules a one-shot alarm later the same day', () => {
    const next = nextAlarmTrigger(
      { hour: 11, minute: 30, repeatDays: [], isEnabled: true },
      at(2026, 10, 28, 10, 0),
    );
    assert.ok(next);
    assert.equal(next.getDate(), 28);
    assert.equal(next.getHours(), 11);
    assert.equal(next.getMinutes(), 30);
  });

  it('moves a one-shot alarm to the next day after the time has passed', () => {
    const next = nextAlarmTrigger(
      { hour: 0, minute: 10, repeatDays: [], isEnabled: true },
      at(2026, 10, 28, 0, 30),
    );
    assert.ok(next);
    assert.equal(next.getDate(), 29);
    assert.equal(next.getHours(), 0);
    assert.equal(next.getMinutes(), 10);
  });

  it('keeps the requested hour across the computed local time', () => {
    const next = nextAlarmTrigger(
      { hour: 7, minute: 0, repeatDays: [1, 2, 3, 4, 5], isEnabled: true },
      at(2026, 10, 26, 8, 0),
    );
    assert.ok(next);
    assert.equal(next.getHours(), 7);
    assert.equal(next.getMinutes(), 0);
  });

  it('finds the next selected weekday after the weekend', () => {
    const next = nextAlarmTrigger(
      { hour: 8, minute: 15, repeatDays: [1], isEnabled: true },
      at(2026, 10, 31, 12, 0),
    );
    assert.ok(next);
    assert.equal(next.getFullYear(), 2026);
    assert.equal(next.getMonth(), 10);
    assert.equal(next.getDate(), 2);
    assert.equal(next.getHours(), 8);
  });

  it('uses today when the weekday matches and the time is still ahead', () => {
    const next = nextAlarmTrigger(
      { hour: 18, minute: 0, repeatDays: [1], isEnabled: true },
      at(2026, 10, 26, 9, 0),
    );
    assert.ok(next);
    assert.equal(next.getDate(), 26);
    assert.equal(next.getHours(), 18);
  });

  it('skips an earlier time on the same weekday', () => {
    const next = nextAlarmTrigger(
      { hour: 9, minute: 0, repeatDays: [3], isEnabled: true },
      at(2026, 10, 28, 10, 0),
    );
    assert.ok(next);
    assert.equal(next.getDate(), 4);
    assert.equal(next.getMonth(), 10);
  });

  it('returns null when the alarm is disabled', () => {
    const next = nextAlarmTrigger(
      { hour: 7, minute: 0, repeatDays: [1, 2, 3, 4, 5], isEnabled: false },
      at(2026, 10, 26, 6, 0),
    );
    assert.equal(next, null);
  });
});

describe('snooze and dismiss', () => {
  it('adds the snooze duration to the current time', () => {
    const now = at(2026, 10, 26, 7, 0);
    const next = applySnooze(sample({ snoozeMinutes: 5 }), now);
    assert.equal(next.status, 'snoozed');
    assert.equal(new Date(next.nextTriggerAt ?? '').getTime(), now.getTime() + 5 * 60 * 1000);
  });

  it('does not schedule a one-shot alarm again after dismiss', () => {
    const next = applyDismiss(sample({ repeatDays: [] }), at(2026, 10, 26, 7, 1));
    assert.equal(next.isEnabled, false);
    assert.equal(next.status, 'dismissed');
    assert.equal(next.nextTriggerAt, null);
  });

  it('schedules the next weekday after a repeating alarm is dismissed', () => {
    const next = applyDismiss(sample({ hour: 7, minute: 0, repeatDays: [1] }), at(2026, 10, 26, 7, 1));
    assert.equal(next.isEnabled, true);
    assert.equal(next.status, 'scheduled');
    assert.equal(new Date(next.nextTriggerAt ?? '').getDate(), 2);
    assert.equal(new Date(next.nextTriggerAt ?? '').getHours(), 7);
  });
});

describe('same clock time', () => {
  it('keeps a trigger for every alarm id', () => {
    const triggers = triggersById(
      [
        { id: 'one', hour: 7, minute: 0, repeatDays: [], isEnabled: true },
        { id: 'two', hour: 7, minute: 0, repeatDays: [], isEnabled: true },
      ],
      at(2026, 10, 26, 6, 0),
    );
    assert.equal(triggers.one, triggers.two);
    assert.ok(triggers.one);
    assert.notEqual(Object.keys(triggers).length, 1);
  });
});

describe('validateAlarmDraft', () => {
  it('requires a selected time', () => {
    const result = validateAlarmDraft(emptyAlarmDraft());
    assert.equal(result.ok, false);
  });

  it('uses the default title and one-shot repeat when those fields are empty', () => {
    const result = validateAlarmDraft({ ...emptyAlarmDraft(), hour: 6, minute: 45 });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.title, 'Budilnik');
      assert.deepEqual(result.value.repeatDays, []);
      assert.equal(result.value.snoozeMinutes, 5);
      assert.equal(result.value.isEnabled, true);
      assert.equal(result.value.vibrationEnabled, true);
    }
  });
});
