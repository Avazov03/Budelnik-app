import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { WEEKDAY_SHORT } from '@/utils/datetime';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export function WeekdaySelector({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const selected = value.includes(day);
        return (
          <Pressable
            key={day}
            accessibilityRole="button"
            accessibilityLabel={WEEKDAY_SHORT[day]}
            accessibilityState={{ selected }}
            onPress={() => onChange(selected ? value.filter((item) => item !== day) : [...value, day])}
            style={[
              styles.day,
              {
                backgroundColor: selected ? colors.accent : 'transparent',
                borderColor: selected ? colors.accent : colors.border,
              },
            ]}
          >
            <AppText tone="bodyBold" style={{ color: selected ? colors.onAccent : colors.text, fontSize: 12 }}>
              {WEEKDAY_SHORT[day]}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, minHeight: 44, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
