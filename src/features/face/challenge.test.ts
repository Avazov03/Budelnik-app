import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { beginChallenge, stepChallenge, type FaceSample } from './challenge.ts';

function face(overrides: Partial<FaceSample> = {}): FaceSample {
  return {
    faces: 1,
    yaw: 0,
    roll: 0,
    brightness: 120,
    centerX: 0.5,
    centerY: 0.48,
    faceRatio: 0.4,
    leftEye: 0.9,
    rightEye: 0.9,
    smile: 0.05,
    ...overrides,
  };
}

describe('face challenge', () => {
  it('refuses to start the hold when the face is missing', () => {
    const frame = stepChallenge(beginChallenge(), face({ faces: 0 }), 1000, () => 0);
    assert.equal(frame.hint, 'Yuzingizni ovalga joylang');
    assert.equal(frame.challenge.phase, 'align');
    assert.equal(frame.progress, 0);
  });

  it('keeps the person still, then gives one random task', () => {
    const started = stepChallenge(beginChallenge(), face(), 0, () => 0);
    assert.equal(started.hint, 'Qimirlamang…');
    const ready = stepChallenge(started.challenge, face(), 1200, () => 0);
    assert.equal(ready.challenge.phase, 'task');
    assert.equal(ready.challenge.task, 'left');
    assert.equal(ready.hint, 'Boshingizni sekin chapga buring');
  });

  it('stops only after the smile is held', () => {
    const aligned = stepChallenge(beginChallenge(), face(), 0, () => 0.99);
    const tasked = stepChallenge(aligned.challenge, face(), 1200, () => 0.99);
    assert.equal(tasked.challenge.task, 'smile');
    const turning = stepChallenge(tasked.challenge, face({ smile: 0.8 }), 2000, () => 0);
    assert.equal(turning.challenge.phase, 'task');
    const done = stepChallenge(turning.challenge, face({ smile: 0.8 }), 2400, () => 0);
    assert.equal(done.challenge.phase, 'done');
  });

  it('does not count a blink unless the eyes were open first', () => {
    const closed = face({ leftEye: 0.1, rightEye: 0.1, smile: -1 });
    const started = stepChallenge(beginChallenge(), closed, 0, () => 0.9);
    const tasked = stepChallenge(started.challenge, closed, 1200, () => 0.9);
    assert.equal(tasked.challenge.task, 'blink');
    const held = stepChallenge(tasked.challenge, closed, 2000, () => 0);
    const still = stepChallenge(held.challenge, closed, 2500, () => 0);
    assert.equal(still.challenge.phase, 'task');
  });
});
