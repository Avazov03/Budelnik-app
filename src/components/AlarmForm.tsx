import { useState } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import type { AlarmDraft } from '@/types/alarm';

import { PrimaryButton } from '@/components/Buttons';
import { TimePickerField } from '@/components/TimePickerField';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { validateAlarmDraft } from '@/features/alarms/validation';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';

const SNOOZE = [1, 5, 10, 15, 30];

export function AlarmForm({
  initial,
  submitLabel,
  onSubmit,
  onDelete,
}: {
  initial: AlarmDraft;
  submitLabel: string;
  onSubmit: (draft: AlarmDraft) => Promise<void>;
  onDelete?: () => void;
}) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const result = validateAlarmDraft(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...draft, title: result.value.title });
    } catch {
      setError('Saqlashda xatolik yuz berdi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.form}>
      <TimePickerField
        label="Vaqt"
        hour={draft.hour}
        minute={draft.minute}
        onChange={(hour, minute) => setDraft((current) => ({ ...current, hour, minute }))}
      />
      <AppText tone="bodyMedium" style={[styles.label, { color: colors.textMuted }]}>
        Nomi
      </AppText>
      <TextInput
        value={draft.title}
        onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
        placeholder="Budilnik"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <AppText tone="bodyMedium" style={[styles.label, { color: colors.textMuted }]}>
        Takrorlanish
      </AppText>
      <WeekdaySelector value={draft.repeatDays} onChange={(repeatDays) => setDraft((current) => ({ ...current, repeatDays }))} />
      <AppText tone="body" style={[styles.hint, { color: colors.textMuted }]}>
        Kun tanlanmasa, budilnik bir martalik bo‘ladi.
      </AppText>
      <AppText tone="bodyMedium" style={[styles.label, { color: colors.textMuted }]}>
        Kechiktirish
      </AppText>
      <View style={styles.chips}>
        {SNOOZE.map((minutes) => {
          const selected = draft.snoozeMinutes === minutes;
          return (
            <PrimaryButton
              key={minutes}
              label={`${minutes} daq`}
              tone={selected ? 'accent' : 'ghost'}
              onPress={() => setDraft((current) => ({ ...current, snoozeMinutes: minutes }))}
            />
          );
        })}
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <AppText tone="body" style={[styles.rowLabel, { color: colors.text }]}>
          Yoqilgan
        </AppText>
        <Switch
          value={draft.isEnabled}
          onValueChange={(isEnabled) => setDraft((current) => ({ ...current, isEnabled }))}
          trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        />
      </View>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <AppText tone="body" style={[styles.rowLabel, { color: colors.text }]}>
          Vibratsiya
        </AppText>
        <Switch
          value={draft.vibrationEnabled}
          onValueChange={(vibrationEnabled) => setDraft((current) => ({ ...current, vibrationEnabled }))}
          trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        />
      </View>
      <View style={[styles.sound, { borderColor: colors.border }]}>
        <AppText tone="bodyMedium" style={{ color: colors.text }}>
          Signal tovushi
        </AppText>
        <AppText tone="body" style={{ color: colors.textMuted }}>
          Standart signal
        </AppText>
      </View>
      {error ? (
        <AppText tone="body" style={{ color: colors.danger }}>
          {error}
        </AppText>
      ) : null}
      <PrimaryButton
        label={submitLabel}
        onPress={() => {
          save().catch(() => undefined);
        }}
        disabled={saving}
      />
      {onDelete ? <PrimaryButton label="O‘chirish" tone="danger" onPress={onDelete} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12 },
  label: { fontSize: 13, letterSpacing: 0.8, textTransform: 'uppercase' },
  hint: { fontSize: 13, lineHeight: 20 },
  input: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderRadius: 0,
    paddingHorizontal: 0,
    fontSize: 16,
    fontFamily: 'SourceSans3_400Regular',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 16 },
  sound: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 14, gap: 4 },
});
