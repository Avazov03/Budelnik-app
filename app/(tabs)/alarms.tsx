import { router } from 'expo-router';

import { AlarmCard } from '@/components/AlarmCard';
import { PrimaryButton } from '@/components/Buttons';
import { EmptyState, ErrorBanner, ScreenContainer, SectionLabel } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { compareAlarms } from '@/features/alarms/schedule';
import { useNow } from '@/hooks/useNow';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';

export default function AlarmsScreen() {
  const now = useNow(30000);
  const { colors } = useAppTheme();
  const { alarms, error, clearError, toggleAlarm } = useAppData();
  const ordered = [...alarms].sort(compareAlarms);

  return (
    <ScreenContainer>
      <AppText tone="displayBold" style={{ color: colors.text, fontSize: 34, letterSpacing: -0.8 }}>
        Budilnik
      </AppText>
      <AppText tone="body" style={{ color: colors.textMuted, lineHeight: 22 }}>
        Har bir yoqish Android signalini ham yangilaydi.
      </AppText>
      {error ? <ErrorBanner message={error} onClose={clearError} /> : null}
      <PrimaryButton label="Yangi budilnik" onPress={() => router.push('/alarms/new')} />
      <SectionLabel>Ro‘yxat</SectionLabel>
      {ordered.length === 0 ? (
        <EmptyState title="Budilniklar yo‘q" body="Birinchi uyg‘onish vaqtini qo‘shing." />
      ) : (
        ordered.map((alarm) => (
          <AlarmCard
            key={alarm.id}
            alarm={alarm}
            now={now}
            onPress={() => router.push({ pathname: '/alarms/[id]', params: { id: alarm.id } })}
            onToggle={(enabled) => {
              toggleAlarm(alarm.id, enabled).catch(() => undefined);
            }}
          />
        ))
      )}
    </ScreenContainer>
  );
}
