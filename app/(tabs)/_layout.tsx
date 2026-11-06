import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';

function TabLabel({ label, color }: { label: string; color: ColorValue }) {
  return (
    <AppText tone="bodyMedium" style={{ color, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' }}>
      {label}
    </AppText>
  );
}

export default function TabLayout() {
  const { colors } = useAppTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          minHeight: 62,
          paddingTop: 8,
        },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Asosiy',
          tabBarLabel: ({ color }) => <TabLabel label="Asosiy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'Budilnik',
          tabBarLabel: ({ color }) => <TabLabel label="Budilnik" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Namoz',
          tabBarLabel: ({ color }) => <TabLabel label="Namoz" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalendar',
          tabBarLabel: ({ color }) => <TabLabel label="Sana" color={color} />,
        }}
      />
    </Tabs>
  );
}
