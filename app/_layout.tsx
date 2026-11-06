import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import { AppDataProvider } from '@/data/AppData';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [dataReady, setDataReady] = useState(false);

  return (
    <AppDataProvider onReady={() => setDataReady(true)}>
      <AppThemeProvider>
        <RootNavigator dataReady={dataReady} />
      </AppThemeProvider>
    </AppDataProvider>
  );
}

function RootNavigator({ dataReady }: { dataReady: boolean }) {
  const { colors, mode, fontsReady } = useAppTheme();

  useEffect(() => {
    if (dataReady && fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [dataReady, fontsReady]);

  const base = mode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: 'SourceSans3_600SemiBold' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="alarm/ringing" options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}
