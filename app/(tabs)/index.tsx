import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

import { PrimaryButton, TextLinkButton } from '@/components/Buttons';
import { ErrorBanner, Hairline, PermissionBanner, ScreenContainer, SectionLabel } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { compareAlarms } from '@/features/alarms/schedule';
import { withOffsets } from '@/features/prayer/schedule';
import { useNow } from '@/hooks/useNow';
import { getTimeflowAlarm } from '@/services/native-alarm';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { PRAYER_LABELS } from '@/types/prayer';
import { formatClock, formatCountdown, formatLongDate, formatTime } from '@/utils/datetime';

export default function HomeScreen() {
  const now = useNow();
  const { colors } = useAppTheme();
  const { alarms, notice, error, clearError, prayer } = useAppData();
  const nextAlarm = [...alarms].filter((alarm) => alarm.isEnabled && alarm.nextTriggerAt).sort(compareAlarms)[0];
  const ringing = alarms.find((alarm) => alarm.status === 'ringing');
  const fade = useRef(new Animated.Value(0)).current;
  const timings = prayer.today ? withOffsets(prayer.today.timings, prayer.settings.offsets) : null;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return (
    <ScreenContainer>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }], gap: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <AppText tone="displayBold" style={{ color: colors.text, fontSize: 36, letterSpacing: -1 }}>
              TimeFlow
            </AppText>
            <AppText tone="body" style={{ color: colors.textMuted, marginTop: 4 }}>
              {formatLongDate(now)}
            </AppText>
          </View>
          <TextLinkButton label="Sozlama" onPress={() => router.push('/settings')} />
        </View>

        {error ? <ErrorBanner message={error} onClose={clearError} /> : null}
        {notice ? <ErrorBanner message={notice} onClose={clearError} /> : null}
        <PlatformBanners />

        {ringing ? (
          <PrimaryButton label="Signal ochiq — davom etish" onPress={() => router.push({ pathname: '/alarm/ringing', params: { id: ringing.id } })} />
        ) : null}

        <View style={{ paddingVertical: 12 }}>
          <AppText tone="displayLight" style={{ color: colors.text, fontSize: 84, letterSpacing: -3, fontVariant: ['tabular-nums'], lineHeight: 90 }}>
            {formatClock(now, true)}
          </AppText>
        </View>

        <Hairline />

        <SectionLabel>Keyingi uyg‘onish</SectionLabel>
        {nextAlarm?.nextTriggerAt ? (
          <View style={{ gap: 6 }}>
            <AppText tone="displayBold" style={{ color: colors.text, fontSize: 42, letterSpacing: -1, fontVariant: ['tabular-nums'] }}>
              {formatTime(nextAlarm.hour, nextAlarm.minute)}
            </AppText>
            <AppText tone="bodyMedium" style={{ color: colors.text }}>
              {nextAlarm.title}
            </AppText>
            <AppText tone="body" style={{ color: colors.accent }}>
              {formatCountdown(nextAlarm.nextTriggerAt, now)} qoldi
            </AppText>
          </View>
        ) : (
          <AppText tone="body" style={{ color: colors.textMuted, lineHeight: 22 }}>
            Hali faol signal yo‘q. Budilnik yoki namoz uyg‘onishini belgilang.
          </AppText>
        )}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Budilnik" onPress={() => router.push('/alarms/new')} />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Namoz" tone="ghost" onPress={() => router.push('/prayer' as Href)} />
          </View>
        </View>

        {timings ? (
          <>
            <Hairline />
            <SectionLabel>{prayer.settings.locationLabel}</SectionLabel>
            <View style={{ gap: 10 }}>
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((key) => (
                <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText tone="body" style={{ color: colors.textMuted }}>
                    {PRAYER_LABELS[key]}
                  </AppText>
                  <AppText tone="bodyMedium" style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>
                    {timings[key]}
                  </AppText>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </Animated.View>
    </ScreenContainer>
  );
}

function PlatformBanners() {
  const { platform } = useAppData();
  const native = getTimeflowAlarm();
  if (!platform.nativeAvailable) {
    return <PermissionBanner message="Haqiqiy budilnik Android development buildda ishlaydi." />;
  }
  return (
    <>
      {!platform.exactAlarm ? (
        <PermissionBanner message="Aniq budilnik ruxsati yo‘q." actionLabel="Ochish" onAction={() => native?.openExactAlarmSettings()} />
      ) : null}
      {!platform.fullScreenIntent ? (
        <PermissionBanner message="To‘liq ekran ruxsati yo‘q." actionLabel="Ochish" onAction={() => native?.openFullScreenIntentSettings()} />
      ) : null}
      {!platform.overlay ? (
        <PermissionBanner message="Ilovalar ustida ko‘rsatish yoqilmagan." actionLabel="Ochish" onAction={() => native?.openOverlaySettings()} />
      ) : null}
    </>
  );
}
