import type { AlarmDraft, ValidAlarmInput } from '../../types/alarm';

import { normalizeRepeatDays } from './schedule';

const SNOOZE_OPTIONS = [1, 5, 10, 15, 30];

export function emptyAlarmDraft(): AlarmDraft {
  return {
    title: '',
    hour: null,
    minute: null,
    repeatDays: [],
    isEnabled: true,
    snoozeMinutes: 5,
    soundId: 'default',
    vibrationEnabled: true,
  };
}

export function validateAlarmDraft(draft: AlarmDraft): { ok: true; value: ValidAlarmInput } | { ok: false; error: string } {
  if (draft.hour === null || draft.minute === null) {
    return { ok: false, error: 'Vaqtni tanlang.' };
  }
  if (draft.hour < 0 || draft.hour > 23 || draft.minute < 0 || draft.minute > 59) {
    return { ok: false, error: 'Vaqt noto‘g‘ri.' };
  }
  if (!SNOOZE_OPTIONS.includes(draft.snoozeMinutes)) {
    return { ok: false, error: 'Kechiktirish muddati noto‘g‘ri.' };
  }

  const title = draft.title.trim() || 'Budilnik';
  return {
    ok: true,
    value: {
      title: title.slice(0, 80),
      hour: draft.hour,
      minute: draft.minute,
      repeatDays: normalizeRepeatDays(draft.repeatDays),
      isEnabled: draft.isEnabled,
      snoozeMinutes: draft.snoozeMinutes,
      soundId: 'default',
      vibrationEnabled: draft.vibrationEnabled,
    },
  };
}
