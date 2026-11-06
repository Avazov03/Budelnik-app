export type TaskKind = 'left' | 'right' | 'blink' | 'smile';

export type FaceSample = {
  faces: number;
  yaw: number;
  roll: number;
  brightness: number;
  centerX: number;
  centerY: number;
  faceRatio: number;
  leftEye: number;
  rightEye: number;
  smile: number;
};

export type Challenge = {
  phase: 'align' | 'task' | 'done';
  task: TaskKind | null;
  since: number | null;
  sawOpenEyes: boolean;
};

export type ChallengeFrame = {
  challenge: Challenge;
  hint: string;
  ok: boolean;
  progress: number;
};

const STRAIGHT_YAW = 12;
const TURN_YAW = 18;
const ROLL = 15;
const DARK = 25;
const ALIGN_MS = 1200;
const HOLD_MS = 400;
const BLINK_MS = 280;
const BLINK_CLOSED = 0.3;
const EYE_OPEN = 0.55;
const SMILE = 0.65;

const TASK_HINT: Record<TaskKind, string> = {
  left: 'Boshingizni sekin chapga buring',
  right: 'Boshingizni sekin o‘ngga buring',
  blink: 'Ko‘zlaringizni yumib turing',
  smile: 'Yengil jilmaying',
};

export function beginChallenge(): Challenge {
  return { phase: 'align', task: null, since: null, sawOpenEyes: false };
}

export function pickTask(sample: FaceSample, random: () => number): TaskKind {
  const pool: TaskKind[] = ['left', 'right'];
  if (sample.leftEye >= 0 && sample.rightEye >= 0) {
    pool.push('blink');
  }
  if (sample.smile >= 0) {
    pool.push('smile');
  }
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
  return pool[index];
}

function alignProblem(sample: FaceSample): string | null {
  if (sample.brightness < DARK) {
    return 'Yorug‘roq joyga o‘ting';
  }
  if (sample.faces <= 0) {
    return 'Yuzingizni ovalga joylang';
  }
  if (sample.faces > 1) {
    return 'Kadrda faqat siz bo‘ling';
  }
  if (Math.abs(sample.roll) > ROLL) {
    return 'Boshingizni tik tuting';
  }
  if (sample.faceRatio < 0.22) {
    return 'Yaqinroq keling';
  }
  if (sample.faceRatio > 0.72) {
    return 'Biroz uzoqlashing';
  }
  if (Math.abs(sample.centerX - 0.5) > 0.16 || Math.abs(sample.centerY - 0.48) > 0.16) {
    return 'Yuzingizni oval markaziga keltiring';
  }
  if (Math.abs(sample.yaw) > STRAIGHT_YAW) {
    return 'To‘g‘ri kameraga qarang';
  }
  return null;
}

function taskProblem(sample: FaceSample): string | null {
  if (sample.brightness < DARK) {
    return 'Yorug‘roq joyga o‘ting';
  }
  if (sample.faces <= 0) {
    return 'Yuzingizni ovalga joylang';
  }
  if (sample.faces > 1) {
    return 'Kadrda faqat siz bo‘ling';
  }
  return null;
}

function taskMet(task: TaskKind, sample: FaceSample, sawOpenEyes: boolean): boolean {
  if (task === 'left') {
    return sample.yaw > TURN_YAW;
  }
  if (task === 'right') {
    return sample.yaw < -TURN_YAW;
  }
  if (task === 'smile') {
    return sample.smile >= SMILE && Math.abs(sample.yaw) < 25;
  }
  return (
    sawOpenEyes &&
    sample.leftEye >= 0 &&
    sample.rightEye >= 0 &&
    sample.leftEye < BLINK_CLOSED &&
    sample.rightEye < BLINK_CLOSED
  );
}

export function stepChallenge(
  challenge: Challenge,
  sample: FaceSample,
  now: number,
  random: () => number = Math.random,
): ChallengeFrame {
  if (challenge.phase === 'done') {
    return { challenge, hint: 'Signal to‘xtatilmoqda', ok: true, progress: 1 };
  }

  const eyesOpen = sample.leftEye > EYE_OPEN && sample.rightEye > EYE_OPEN;
  const base = eyesOpen ? { ...challenge, sawOpenEyes: true } : challenge;

  if (base.phase === 'align') {
    const problem = alignProblem(sample);
    if (problem) {
      return { challenge: { ...base, since: null }, hint: problem, ok: false, progress: 0 };
    }
    const since = base.since ?? now;
    const progress = Math.min(1, (now - since) / ALIGN_MS);
    if (now - since < ALIGN_MS) {
      return { challenge: { ...base, since }, hint: 'Qimirlamang…', ok: true, progress };
    }
    const task = base.task ?? pickTask(sample, random);
    return {
      challenge: { ...base, phase: 'task', task, since: null },
      hint: TASK_HINT[task],
      ok: true,
      progress: 0,
    };
  }

  const task = base.task ?? pickTask(sample, random);
  const problem = taskProblem(sample);
  if (problem) {
    return { challenge: { ...base, task, since: null }, hint: problem, ok: false, progress: 0 };
  }
  if (!taskMet(task, sample, base.sawOpenEyes)) {
    return { challenge: { ...base, task, since: null }, hint: TASK_HINT[task], ok: false, progress: 0 };
  }
  const hold = task === 'blink' ? BLINK_MS : HOLD_MS;
  const since = base.since ?? now;
  const progress = Math.min(1, (now - since) / hold);
  if (now - since < hold) {
    return { challenge: { ...base, task, since }, hint: 'Yaxshi', ok: true, progress };
  }
  return {
    challenge: { ...base, task, phase: 'done', since },
    hint: 'Bo‘ldi',
    ok: true,
    progress: 1,
  };
}
