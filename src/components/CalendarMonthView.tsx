import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { MONTHS, WEEKDAY_SHORT, formatShortDate, monthGrid, shiftMonth } from '@/utils/datetime';

export function CalendarMonthView({
  year,
  monthIndex,
  selected,
  marked,
  onSelect,
  onMonthChange,
}: {
  year: number;
  monthIndex: number;
  selected: string;
  marked: Set<string>;
  onSelect: (date: string) => void;
  onMonthChange: (year: number, monthIndex: number) => void;
}) {
  const { colors } = useAppTheme();
  const cells = monthGrid(year, monthIndex);
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Oldingi oy"
          onPress={() => onMonthChange(...(Object.values(shiftMonth(year, monthIndex, -1)) as [number, number]))}
          style={styles.navButton}
        >
          <AppText tone="display" style={[styles.navText, { color: colors.text }]}>
            ‹
          </AppText>
        </Pressable>
        <AppText tone="display" style={{ color: colors.text, fontSize: 20, textTransform: 'capitalize' }}>
          {MONTHS[monthIndex]} {year}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Keyingi oy"
          onPress={() => onMonthChange(...(Object.values(shiftMonth(year, monthIndex, 1)) as [number, number]))}
          style={styles.navButton}
        >
          <AppText tone="display" style={[styles.navText, { color: colors.text }]}>
            ›
          </AppText>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Bugungi sana"
        onPress={() => {
          onMonthChange(today.getFullYear(), today.getMonth());
          onSelect(todayIso);
        }}
      >
        <AppText tone="bodyMedium" style={{ color: colors.accent, textAlign: 'center' }}>
          Bugun, {formatShortDate(todayIso)}
        </AppText>
      </Pressable>
      <View style={styles.week}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <AppText key={day} tone="bodyMedium" style={[styles.weekday, { color: colors.textMuted }]}>
            {WEEKDAY_SHORT[day]}
          </AppText>
        ))}
      </View>
      <View style={[styles.hairline, { backgroundColor: colors.border }]} />
      <View style={styles.grid}>
        {cells.map((cell) => {
          const isSelected = cell.date === selected;
          const isToday = cell.date === todayIso;
          return (
            <Pressable
              key={cell.date}
              accessibilityRole="button"
              accessibilityLabel={cell.date}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(cell.date)}
              style={[styles.cell, isSelected ? { backgroundColor: colors.accent } : null]}
            >
              <AppText
                tone={isToday || isSelected ? 'bodyBold' : 'body'}
                style={{ color: isSelected ? colors.onAccent : cell.inMonth ? colors.text : colors.textMuted }}
              >
                {Number(cell.date.slice(-2))}
              </AppText>
              {marked.has(cell.date) ? (
                <View style={[styles.dot, { backgroundColor: isSelected ? colors.onAccent : colors.accent }]} />
              ) : (
                <View style={styles.dot} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 28, lineHeight: 30 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, letterSpacing: 0.4 },
  hairline: { height: StyleSheet.hairlineWidth, width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },
});
