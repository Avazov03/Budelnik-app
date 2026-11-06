import { Pressable, StyleSheet, View } from 'react-native';

import type { CalendarEvent } from '@/types/event';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { formatClock } from '@/utils/datetime';

export function EventCard({ event, onPress }: { event: CalendarEvent; onPress: () => void }) {
  const { colors } = useAppTheme();
  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;
  const time = end ? `${formatClock(start)}–${formatClock(end)}` : formatClock(start);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={event.title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.mark, { backgroundColor: colors.accent }]} />
      <View style={styles.body}>
        <AppText tone="bodyMedium" style={{ color: colors.text, fontSize: 16 }}>
          {event.title}
        </AppText>
        <AppText tone="body" style={{ color: colors.textMuted, fontSize: 13 }}>
          {time}
          {event.reminderEnabled ? ` · ${event.reminderOffsetMinutes} daq oldin` : ''}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  mark: { width: 2, height: 28 },
  body: { flex: 1, gap: 2 },
});
