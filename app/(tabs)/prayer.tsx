import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { PrimaryButton, TextLinkButton } from '@/components/Buttons';
import { EmptyState, ErrorBanner, Hairline, PermissionBanner, ScreenContainer, SectionLabel } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { UZ_CITIES } from '@/features/prayer/cities';
import { prayerWindowEnd, prayerWindowStart, withOffsets } from '@/features/prayer/schedule';
import { readGpsFix } from '@/services/prayer/location';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { PRAYER_KEYS, PRAYER_LABELS, type PrayerKey, type PrayerSettings } from '@/types/prayer';

export default function PrayerScreen() {
  const { colors } = useAppTheme();
  const { prayer, updatePrayerSettings, markPrayerRead, clearQaza, addQazaItem, refresh, error, clearError } = useAppData();
  const [busy, setBusy] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [showOffsets, setShowOffsets] = useState(false);
  const settings = prayer.settings;
  const timings = useMemo(
    () => (prayer.today ? withOffsets(prayer.today.timings, settings.offsets) : null),
    [prayer.today, settings.offsets],
  );

  const patch = async (partial: Partial<PrayerSettings>) => {
    setBusy(true);
    try {
      await updatePrayerSettings({
        ...settings,
        ...partial,
        offsets: { ...settings.offsets, ...(partial.offsets ?? {}) },
        wake: { ...settings.wake, ...(partial.wake ?? {}) },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ gap: 6 }}>
        <AppText tone="displayBold" style={{ color: colors.text, fontSize: 34, letterSpacing: -0.8 }}>
          Namoz
        </AppText>
        <AppText tone="body" style={{ color: colors.textMuted }}>
          {settings.locationLabel} · Hanafi
        </AppText>
      </View>

      {error ? <ErrorBanner message={error} onClose={clearError} /> : null}
      {prayer.notice ? <PermissionBanner message={prayer.notice} actionLabel="Yangilash" onAction={() => refresh()} /> : null}

      <SectionLabel>Bugun</SectionLabel>
      {!timings || !prayer.today ? (
        <EmptyState title="Jadval yuklanmagan" body="Internet yoqilganda Aladhan orqali yangilanadi." />
      ) : (
        <View style={{ gap: 14 }}>
          {PRAYER_KEYS.map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <AppText tone="body" style={{ color: colors.textMuted, flex: 1 }}>
                {PRAYER_LABELS[key]}
              </AppText>
              <AppText tone="display" style={{ color: colors.text, fontSize: 28, letterSpacing: -0.5, fontVariant: ['tabular-nums'] }}>
                {timings[key]}
              </AppText>
              <TextLinkButton label="O‘qidim" onPress={() => markPrayerRead(prayer.today!.date, key).catch(() => undefined)} />
            </View>
          ))}
        </View>
      )}

      <Hairline />

      <SectionLabel>Uyg‘onish</SectionLabel>
      <AppText tone="body" style={{ color: colors.textMuted, lineHeight: 22 }}>
        Tanlangan namoz oralig‘i tugashiga qancha daqiqa qolganda signal chalinadi.
      </AppText>
      <View style={{ gap: 0 }}>
        {PRAYER_KEYS.map((key) => {
          const selected = settings.wake.prayer === key;
          return (
            <Pressable
              key={key}
              onPress={() => patch({ wake: { ...settings.wake, prayer: key } })}
              style={{
                minHeight: 48,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <AppText tone={selected ? 'bodyBold' : 'body'} style={{ color: selected ? colors.accent : colors.text }}>
                {PRAYER_LABELS[key]}
              </AppText>
              {selected ? (
                <AppText tone="bodyMedium" style={{ color: colors.accent }}>
                  tanlangan
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AppText tone="body" style={{ color: colors.text }}>
          Tugashiga
        </AppText>
        <TextInput
          keyboardType="number-pad"
          defaultValue={String(settings.wake.minutesBeforeEnd)}
          onEndEditing={(event) => {
            const value = Number(event.nativeEvent.text.replace(/[^\d]/g, '') || '0');
            patch({ wake: { ...settings.wake, minutesBeforeEnd: value } }).catch(() => undefined);
          }}
          style={{
            minWidth: 56,
            minHeight: 44,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            color: colors.text,
            textAlign: 'center',
            fontSize: 20,
            fontFamily: 'BricolageGrotesque_600SemiBold',
          }}
        />
        <AppText tone="body" style={{ color: colors.textMuted }}>
          daqiqa
        </AppText>
      </View>
      {timings ? (
        <AppText tone="body" style={{ color: colors.textMuted }}>
          {PRAYER_LABELS[settings.wake.prayer]} oralig‘i {prayerWindowStart(settings.wake.prayer, timings)} — {prayerWindowEnd(settings.wake.prayer, timings)}
        </AppText>
      ) : null}
      {prayer.nextWakeAt ? (
        <AppText tone="bodyMedium" style={{ color: colors.accent }}>
          Keyingi signal: {new Date(prayer.nextWakeAt).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
        </AppText>
      ) : null}
      <PrimaryButton
        label={settings.wake.enabled ? 'Signal yoqilgan' : 'Signalni yoqish'}
        tone={settings.wake.enabled ? 'accent' : 'ghost'}
        disabled={busy}
        onPress={() => patch({ wake: { ...settings.wake, enabled: !settings.wake.enabled } })}
      />

      <Hairline />

      <SectionLabel>Joy</SectionLabel>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="Shahar"
            tone={settings.locationMode === 'city' ? 'accent' : 'ghost'}
            onPress={() => {
              setShowCities(true);
              patch({ locationMode: 'city' }).catch(() => undefined);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label="GPS"
            tone={settings.locationMode === 'gps' ? 'accent' : 'ghost'}
            disabled={busy}
            onPress={() => {
              setBusy(true);
              readGpsFix()
                .then((fix) =>
                  patch({
                    locationMode: 'gps',
                    latitude: fix.latitude,
                    longitude: fix.longitude,
                    locationLabel: fix.label,
                  }),
                )
                .catch(() => undefined)
                .finally(() => setBusy(false));
            }}
          />
        </View>
      </View>
      {showCities || settings.locationMode === 'city' ? (
        <View style={{ gap: 0 }}>
          {UZ_CITIES.map((city) => {
            const selected = settings.cityId === city.id && settings.locationMode === 'city';
            return (
              <Pressable
                key={city.id}
                onPress={() =>
                  patch({
                    locationMode: 'city',
                    cityId: city.id,
                    latitude: city.latitude,
                    longitude: city.longitude,
                    locationLabel: city.label,
                  }).then(() => setShowCities(false))
                }
                style={{
                  minHeight: 44,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  justifyContent: 'center',
                }}
              >
                <AppText tone={selected ? 'bodyBold' : 'body'} style={{ color: selected ? colors.accent : colors.text }}>
                  {city.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Hairline />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionLabel>Masjid tuzatmasi</SectionLabel>
        <TextLinkButton label={showOffsets ? 'Yopish' : 'O‘zgartirish'} onPress={() => setShowOffsets((value) => !value)} />
      </View>
      <AppText tone="body" style={{ color: colors.textMuted, lineHeight: 22 }}>
        Daqiqalik siljish Hanafi hisob ustiga qo‘llanadi.
      </AppText>
      {showOffsets
        ? (Object.keys(settings.offsets) as Array<keyof typeof settings.offsets>).map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
              <AppText tone="body" style={{ color: colors.text }}>
                {key === 'sunrise' ? 'Quyosh' : PRAYER_LABELS[key as PrayerKey] ?? key}
              </AppText>
              <TextInput
                keyboardType="numbers-and-punctuation"
                defaultValue={String(settings.offsets[key])}
                onEndEditing={(event) => {
                  const cleaned = event.nativeEvent.text.replace(/[^\d-]/g, '');
                  const value = cleaned === '-' || cleaned === '' ? 0 : Number(cleaned);
                  patch({ offsets: { ...settings.offsets, [key]: Number.isFinite(value) ? value : 0 } }).catch(() => undefined);
                }}
                style={{
                  width: 64,
                  minHeight: 40,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  color: colors.text,
                  textAlign: 'center',
                  fontFamily: 'BricolageGrotesque_600SemiBold',
                }}
              />
            </View>
          ))
        : null}

      <Hairline />

      <SectionLabel>Qazo</SectionLabel>
      {prayer.qaza.length === 0 ? (
        <EmptyState title="Qazo yo‘q" body="O‘tkazib yuborilgan uyg‘onish namozi shu yerda turadi." />
      ) : (
        prayer.qaza.map((item) => (
          <View
            key={item.id}
            style={{
              minHeight: 56,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText tone="bodyMedium" style={{ color: colors.text }}>
                {PRAYER_LABELS[item.prayer]}
              </AppText>
              <AppText tone="body" style={{ color: colors.textMuted }}>
                {item.day}
              </AppText>
            </View>
            <TextLinkButton label="Bajarildi" onPress={() => clearQaza(item.id).catch(() => undefined)} />
          </View>
        ))
      )}
      {prayer.today ? (
        <PrimaryButton
          label={`${PRAYER_LABELS[settings.wake.prayer]}ni qazoga qo‘shish`}
          tone="ghost"
          onPress={() => addQazaItem(prayer.today!.date, settings.wake.prayer).catch(() => undefined)}
        />
      ) : null}
      <TextLinkButton label="Jadvalni yangilash" onPress={() => refresh()} />
    </ScreenContainer>
  );
}
