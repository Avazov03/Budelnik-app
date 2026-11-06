import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import type { EventDraft } from '@/types/event';

import { PrimaryButton } from '@/components/Buttons';
import { TimePickerField } from '@/components/TimePickerField';
import { REMINDER_OPTIONS, validateEventDraft } from '@/features/calendar/rules';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatShortDate, parseIsoDate } from '@/utils/datetime';

export function EventForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  initial: EventDraft;
  submitLabel: string;
  onSubmit: (draft: EventDraft) => Promise<void>;
  onDelete?: () => void;
}) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEnd, setShowEnd] = useState(Boolean(initial.endTime));

  const shiftDate = (delta: number) => {
    const parsed = parseIsoDate(draft.date);
    if (!parsed) {
      return;
    }
    parsed.setDate(parsed.getDate() + delta);
    const next = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    setDraft((current) => ({ ...current, date: next }));
  };

  const save = async () => {
    const result = validateEventDraft(draft, new Date());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaving(true);
    setError(result.warning ?? null);
    try {
      await onSubmit(draft);
    } catch {
      setError('Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  const start = splitTime(draft.startTime);
  const end = splitTime(draft.endTime);

  return (
    <View style={styles.form}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Nomi</Text>
      <TextInput
        value={draft.title}
        onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
        placeholder="Tadbir nomi"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />
      <Text style={[styles.label, { color: colors.textMuted }]}>Sana</Text>
      <View style={styles.dateRow}>
        <PrimaryButton label="‹" tone="ghost" onPress={() => shiftDate(-1)} />
        <Text style={[styles.date, { color: colors.text }]}>{formatShortDate(draft.date)}</Text>
        <PrimaryButton label="›" tone="ghost" onPress={() => shiftDate(1)} />
      </View>
      <TimePickerField
        label="Boshlanish"
        hour={start.hour}
        minute={start.minute}
        onChange={(hour, minute) => setDraft((current) => ({ ...current, startTime: pad(hour, minute) }))}
      />
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>Tugash vaqti</Text>
        <Switch
          value={showEnd}
          onValueChange={(value) => {
            setShowEnd(value);
            if (!value) {
              setDraft((current) => ({ ...current, endTime: null }));
            }
          }}
          trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        />
      </View>
      {showEnd ? (
        <TimePickerField
          label="Tugash"
          hour={end.hour}
          minute={end.minute}
          onChange={(hour, minute) => setDraft((current) => ({ ...current, endTime: pad(hour, minute) }))}
        />
      ) : null}
      <Text style={[styles.label, { color: colors.textMuted }]}>Izoh</Text>
      <TextInput
        value={draft.description}
        onChangeText={(description) => setDraft((current) => ({ ...current, description }))}
        placeholder="Ixtiyoriy"
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, styles.multiline, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>Eslatma</Text>
        <Switch
          value={draft.reminderEnabled}
          onValueChange={(reminderEnabled) => setDraft((current) => ({ ...current, reminderEnabled }))}
          trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        />
      </View>
      {draft.reminderEnabled ? (
        <View style={styles.chips}>
          {REMINDER_OPTIONS.map((minutes) => (
            <PrimaryButton
              key={minutes}
              label={minutes === 0 ? 'O‘z vaqtida' : `${minutes} daq`}
              tone={draft.reminderOffsetMinutes === minutes ? 'accent' : 'ghost'}
              onPress={() => setDraft((current) => ({ ...current, reminderOffsetMinutes: minutes }))}
            />
          ))}
        </View>
      ) : null}
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      <PrimaryButton label={submitLabel} onPress={() => { save().catch(() => undefined); }} disabled={saving} />
      {onDelete ? <PrimaryButton label="O‘chirish" tone="danger" onPress={onDelete} /> : null}
    </View>
  );
}

function splitTime(value: string | null): { hour: number | null; minute: number | null } {
  if (!value) {
    return { hour: null, minute: null };
  }
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
}

function pad(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  label: { fontSize: 13, fontWeight: '600' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, fontSize: 16 },
  multiline: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  date: { fontSize: 18, fontWeight: '700' },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
