import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';

export function ScreenContainer({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>{children}</ScrollView>
  ) : (
    <View style={[styles.content, styles.fill, { paddingBottom: insets.bottom + 20 }]}>{children}</View>
  );
  return <View style={[styles.fill, { backgroundColor: colors.background }]}>{body}</View>;
}

export function AppHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.header}>
      <View style={styles.fill}>
        <AppText tone="displayBold" style={[styles.brand, { color: colors.text }]}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText tone="body" style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return (
    <AppText tone="bodyMedium" style={[styles.section, { color: colors.textMuted }]}>
      {children}
    </AppText>
  );
}

export function Hairline() {
  const { colors } = useAppTheme();
  return <View style={[styles.hairline, { backgroundColor: colors.border }]} />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.empty}>
      <AppText tone="bodyMedium" style={{ color: colors.text, fontSize: 17 }}>
        {title}
      </AppText>
      <AppText tone="body" style={[styles.subtitle, { color: colors.textMuted }]}>
        {body}
      </AppText>
    </View>
  );
}

export function PermissionBanner({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.banner, { borderColor: colors.warning }]}>
      <AppText tone="body" style={[styles.bannerText, { color: colors.warning }]}>
        {message}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={styles.bannerButton}>
          <AppText tone="bodyBold" style={{ color: colors.warning }}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Xabarni yopish" onPress={onClose} style={[styles.banner, { borderColor: colors.danger }]}>
      <AppText tone="body" style={[styles.bannerText, { color: colors.danger }]}>
        {message}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 12, gap: 22, width: '100%', maxWidth: 480, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 8 },
  brand: { fontSize: 34, letterSpacing: -0.8, lineHeight: 38 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  section: { fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' },
  empty: { gap: 6, paddingVertical: 8 },
  banner: { borderLeftWidth: 2, paddingVertical: 10, paddingHorizontal: 12, gap: 8 },
  bannerText: { fontSize: 14, lineHeight: 20 },
  bannerButton: { alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' },
  hairline: { height: StyleSheet.hairlineWidth, width: '100%' },
});
