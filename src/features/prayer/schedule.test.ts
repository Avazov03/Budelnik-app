import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyOffset, nextWakeTrigger, prayerWindowEnd, wakeTriggerForDay } from './schedule.ts';
import type { PrayerDay } from '../../types/prayer.ts';

const day: PrayerDay = {
  date: '2026-11-06',
  hijri: '26-05-1448',
  fetchedAt: '2026-11-06T00:00:00.000Z',
  source: 'network',
  timings: {
    fajr: '05:26',
    sunrise: '07:00',
    dhuhr: '12:07',
    asr: '15:32',
    maghrib: '17:13',
    isha: '18:42',
    midnight: '00:06',
  },
};

describe('prayer schedule', () => {
  it('ends fajr at sunrise', () => {
    assert.equal(prayerWindowEnd('fajr', day.timings), '07:00');
  });

  it('rings 30 minutes before fajr ends', () => {
    const trigger = wakeTriggerForDay(
      day,
      { prayer: 'fajr', minutesBeforeEnd: 30, enabled: true },
      { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    );
    assert.ok(trigger);
    assert.equal(trigger.getHours(), 6);
    assert.equal(trigger.getMinutes(), 30);
  });

  it('applies mosque minute offsets before wake math', () => {
    assert.equal(applyOffset('07:00', -5), '06:55');
    const trigger = wakeTriggerForDay(
      day,
      { prayer: 'fajr', minutesBeforeEnd: 30, enabled: true },
      { fajr: 0, sunrise: -5, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    );
    assert.ok(trigger);
    assert.equal(trigger.getHours(), 6);
    assert.equal(trigger.getMinutes(), 25);
  });

  it('picks the next future wake across today and tomorrow', () => {
    const tomorrow: PrayerDay = { ...day, date: '2026-11-07' };
    const now = new Date(2026, 10, 6, 8, 0, 0, 0);
    const next = nextWakeTrigger(
      day,
      tomorrow,
      { prayer: 'fajr', minutesBeforeEnd: 30, enabled: true },
      { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      now,
    );
    assert.ok(next);
    assert.equal(next.getDate(), 7);
    assert.equal(next.getHours(), 6);
    assert.equal(next.getMinutes(), 30);
  });
});
