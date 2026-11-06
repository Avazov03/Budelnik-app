import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Text, useColorScheme, type TextProps, type TextStyle } from 'react-native';

import { useAppData } from '@/data/AppData';
import { fonts, palette, type ThemeColors } from '@/theme/tokens';

type ThemeValue = {
  mode: 'light' | 'dark';
  colors: ThemeColors;
  fonts: typeof fonts;
  fontsReady: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const { theme } = useAppData();
  const [fontsReady] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });
  const mode = theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : theme;
  const value = useMemo<ThemeValue>(
    () => ({ mode, colors: palette[mode], fonts, fontsReady }),
    [fontsReady, mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeValue {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('ThemeProvider topilmadi.');
  }
  return value;
}

type Tone = 'display' | 'displayBold' | 'displayLight' | 'body' | 'bodyMedium' | 'bodyBold';

export function AppText({
  tone = 'body',
  style,
  ...props
}: TextProps & { tone?: Tone }) {
  const { fonts: typefaces, fontsReady } = useAppTheme();
  const fontFamily = fontsReady ? typefaces[tone] : undefined;
  return <Text {...props} style={[{ fontFamily }, style as TextStyle]} />;
}
