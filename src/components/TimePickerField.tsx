import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/Buttons';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { formatTime } from '@/utils/datetime';

export function TimePickerField({
  label,
  hour,
  minute,
  onChange,
}: {
  label: string;
  hour: number | null;
  minute: number | null;
  onChange: (hour: number, minute: number) => void;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [draftHour, setDraftHour] = useState(hour ?? new Date().getHours());
  const [draftMinute, setDraftMinute] = useState(minute ?? 0);

  const openPicker = () => {
    setDraftHour(hour ?? new Date().getHours());
    setDraftMinute(minute ?? new Date().getMinutes());
    setOpen(true);
  };

  return (
    <View style={styles.wrap}>
      <AppText tone="bodyMedium" style={[styles.label, { color: colors.textMuted }]}>
        {label}
      </AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={openPicker}
        style={[styles.field, { borderColor: colors.border }]}
      >
        <AppText tone="displayBold" style={[styles.value, { color: hour === null ? colors.textMuted : colors.text }]}>
          {hour === null || minute === null ? 'Vaqtni tanlang' : formatTime(hour, minute)}
        </AppText>
      </Pressable>
      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <AppText tone="display" style={{ color: colors.text, fontSize: 22 }}>
              {label}
            </AppText>
            <View style={styles.stepperRow}>
              <Stepper label="Soatni kamaytirish" text="−" onPress={() => setDraftHour((value) => (value + 23) % 24)} />
              <AppText tone="displayBold" style={[styles.clock, { color: colors.text }]}>
                {formatTime(draftHour, draftMinute)}
              </AppText>
              <Stepper label="Soatni oshirish" text="+" onPress={() => setDraftHour((value) => (value + 1) % 24)} />
            </View>
            <View style={styles.stepperRow}>
              <Stepper label="Daqiqani kamaytirish" text="−" onPress={() => setDraftMinute((value) => (value + 59) % 60)} />
              <AppText tone="body" style={{ color: colors.textMuted }}>
                Soat va daqiqa
              </AppText>
              <Stepper label="Daqiqani oshirish" text="+" onPress={() => setDraftMinute((value) => (value + 1) % 60)} />
            </View>
            <PrimaryButton
              label="Tayyor"
              onPress={() => {
                onChange(draftHour, draftMinute);
                setOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Stepper({ label, text, onPress }: { label: string; text: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.stepper, { borderColor: colors.border }]}
    >
      <AppText tone="display" style={[styles.stepperText, { color: colors.text }]}>
        {text}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 13, letterSpacing: 0.8, textTransform: 'uppercase' },
  field: { minHeight: 64, borderBottomWidth: 1, justifyContent: 'center', paddingHorizontal: 0 },
  value: { fontSize: 40, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(8,12,10,0.55)' },
  sheet: { borderTopWidth: StyleSheet.hairlineWidth, padding: 22, gap: 16 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  clock: { fontSize: 48, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  stepper: { width: 56, height: 56, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 28, lineHeight: 32 },
});
