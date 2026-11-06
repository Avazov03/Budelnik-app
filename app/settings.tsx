import { Stack } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Hairline, ScreenContainer, SectionLabel } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { requestNotificationPermission } from '@/services/notifications/reminders';
import { getTimeflowAlarm } from '@/services/native-alarm';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import type { ThemePreference } from '@/services/platform/sync';

const THEMES: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'Tizim' },
  { id: 'light', label: 'Yorug‘' },
  { id: 'dark', label: 'Tun' },
];

export default function SettingsScreen() {
  const { theme, setThemePreference, platform, refresh } = useAppData();
  const { colors } = useAppTheme();
  const native = getTimeflowAlarm();

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Sozlamalar' }} />
      <SectionLabel>Mavzu</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {THEMES.map((item) => {
          const selected = theme === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityState={{ selected }}
              onPress={() => {
                setThemePreference(item.id).catch(() => undefined);
              }}
              style={{
                flex: 1,
                minHeight: 48,
                borderRadius: 4,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.accent : 'transparent',
                borderColor: selected ? colors.accent : colors.border,
              }}
            >
              <AppText tone="bodyBold" style={{ color: selected ? colors.onAccent : colors.text }}>
                {item.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Hairline />
      <SectionLabel>Ruxsatlar</SectionLabel>
      <StatusRow label="Native budilnik" ok={platform.nativeAvailable} />
      <StatusRow label="Aniq signal" ok={platform.exactAlarm} action="Ochish" onAction={() => native?.openExactAlarmSettings()} />
      <StatusRow
        label="Bildirishnoma"
        ok={platform.notifications}
        action="So‘rash"
        onAction={() => {
          requestNotificationPermission()
            .then(() => refresh())
            .catch(() => undefined);
        }}
      />
      <StatusRow label="To‘liq ekran" ok={platform.fullScreenIntent} action="Ochish" onAction={() => native?.openFullScreenIntentSettings()} />
      <StatusRow label="Ilovalar ustida" ok={platform.overlay} action="Ochish" onAction={() => native?.openOverlaySettings()} />
      <StatusRow label="Batareya cheklovi" ok={null} action="Sozlamalar" onAction={() => native?.openBatterySettings()} />

      <Hairline />
      <SectionLabel>Cheklovlar</SectionLabel>
      <AppText tone="body" style={{ color: colors.textMuted, lineHeight: 22 }}>
        Ilova tizim sozlamalaridan majburan to‘xtatilsa, Android budilnikni tiklamasligi mumkin. Bezovta qilinmasin rejimi va ayrim telefonlarning batareya siyosati signalni pasaytirishi mumkin. TimeFlow buni yashirmaydi.
      </AppText>
    </ScreenContainer>
  );
}

function StatusRow({ label, ok, action, onAction }: { label: string; ok: boolean | null; action?: string; onAction?: () => void }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <AppText tone="body" style={{ color: colors.text, fontSize: 16, flex: 1 }}>
        {label}
      </AppText>
      {ok === null ? null : (
        <AppText tone="bodyBold" style={{ color: ok ? colors.accent : colors.warning }}>
          {ok ? 'Bor' : 'Yo‘q'}
        </AppText>
      )}
      {action && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onAction} style={{ minHeight: 36, justifyContent: 'center' }}>
          <AppText tone="bodyBold" style={{ color: colors.accent }}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
