export const palette = {
  light: {
    background: '#E7EAE4',
    surface: '#F3F5F1',
    surfaceMuted: '#D7DBD4',
    text: '#101714',
    textMuted: '#5A635C',
    accent: '#0C4F40',
    onAccent: '#F2F7F4',
    border: '#BFC6BE',
    danger: '#8F2F2A',
    dangerSurface: '#F3E4E2',
    warningSurface: '#EFE6D6',
    warning: '#6E5318',
  },
  dark: {
    background: '#0C100E',
    surface: '#161B18',
    surfaceMuted: '#232925',
    text: '#E6EBE6',
    textMuted: '#939C95',
    accent: '#4EAA8C',
    onAccent: '#07140F',
    border: '#2C3430',
    danger: '#E3A39D',
    dangerSurface: '#2B1C1A',
    warningSurface: '#2A2418',
    warning: '#D2BD86',
  },
} as const;

export type ThemeColors = (typeof palette)['light'] | (typeof palette)['dark'];

export const fonts = {
  display: 'BricolageGrotesque_600SemiBold',
  displayBold: 'BricolageGrotesque_700Bold',
  displayLight: 'BricolageGrotesque_400Regular',
  body: 'SourceSans3_400Regular',
  bodyMedium: 'SourceSans3_600SemiBold',
  bodyBold: 'SourceSans3_700Bold',
} as const;
