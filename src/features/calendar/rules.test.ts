import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { canScheduleReminder, emptyEventDraft, reminderFireAt, validateEventDraft } from './rules.ts';

import { monthGrid } from '../../utils/datetime.ts';

describe('calendar rules', () => {
  it('rejects an end time that is not after the start', () => {
    const result = validateEventDraft(
      {
        ...emptyEventDraft('2026-11-02'),
        title: 'Ingliz tili darsi',
        startTime: '18:00',
        endTime: '17:00',
      },
      new Date(2026, 10, 1, 12, 0, 0, 0),
    );
    assert.equal(result.ok, false);
  });

  it('accepts the sample lesson and a 15 minute reminder', () => {
    const result = validateEventDraft(
      {
        ...emptyEventDraft('2026-11-02'),
        title: 'Ingliz tili darsi',
        startTime: '18:00',
        endTime: '19:00',
        reminderEnabled: true,
        reminderOffsetMinutes: 15,
      },
      new Date(2026, 10, 1, 12, 0, 0, 0),
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.value.startAt.getHours(), 18);
      assert.equal(result.value.endAt?.getHours(), 19);
      assert.equal(canScheduleReminder(result.value.startAt, 15, true, new Date(2026, 10, 1, 12, 0, 0, 0)), true);
    }
  });

  it('does not schedule a reminder that is already in the past', () => {
    const start = new Date(2026, 10, 2, 18, 0, 0, 0);
    const now = new Date(2026, 10, 2, 17, 50, 0, 0);
    assert.equal(canScheduleReminder(start, 15, true, now), false);
    assert.equal(reminderFireAt(start, 15).getMinutes(), 45);
  });

  it('does not schedule a reminder after it is turned off', () => {
    const start = new Date(2026, 10, 2, 18, 0, 0, 0);
    assert.equal(canScheduleReminder(start, 15, false, new Date(2026, 10, 1, 12, 0, 0, 0)), false);
  });

  it('starts October 2026 on Thursday with Monday as the first column', () => {
    const cells = monthGrid(2026, 9);
    assert.equal(cells[0].inMonth, false);
    assert.equal(cells[3].date, '2026-10-01');
    assert.equal(cells[3].inMonth, true);
  });
});
