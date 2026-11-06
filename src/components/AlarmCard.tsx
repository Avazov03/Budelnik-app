import { Pressable, StyleSheet, Switch, View } from 'react-native';

import type { Alarm, AlarmStatus } from '@/types/alarm';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { formatCountdown, formatRepeatDays, formatTime } from '@/utils/datetime';

const STATUS_LABEL: Record<AlarmStatus, string> = {
  scheduled: 'Rejalashtirilgan',
  ringing: 'Jiringlayapti',
  snoozed: 'Kechiktirilgan',
  dismissed: 'To‘xtatilgan',
  disabled: 'O‘chirilgan',
  permission_required: 'Ruxsat kerak',
};

export function AlarmCard({
  alarm,
  now,
  onPress,
  onToggle,
}: {
  alarm: Alarm;
  now: Date;
  onPress: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${alarm.title} tahrirlash`} onPress={onPress} style={styles.main}>
        <AppText tone="displayBold" style={[styles.time, { color: colors.text }]}>
          {formatTime(alarm.hour, alarm.minute)}
        </AppText>
        <AppText tone="bodyMedium" style={{ color: colors.text, fontSize: 16 }}>
          {alarm.title}
        </AppText>
        <AppText tone="body" style={[styles.meta, { color: colors.textMuted }]}>
          {formatRepeatDays(alarm.repeatDays)} · {STATUS_LABEL[alarm.status]}
        </AppText>
        {alarm.nextTriggerAt ? (
          <AppText tone="body" style={[styles.meta, { color: colors.accent }]}>
            Keyingisi {formatCountdown(alarm.nextTriggerAt, now)}dan keyin
          </AppText>
        ) : null}
      </Pressable>
      <Switch
        accessibilityLabel={`${alarm.title} holati`}
        value={alarm.isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  main: { flex: 1, gap: 2 },
  time: { fontSize: 40, letterSpacing: -1, fontVariant: ['tabular-nums'], lineHeight: 44 },
  meta: { fontSize: 13, marginTop: 2 },
});
