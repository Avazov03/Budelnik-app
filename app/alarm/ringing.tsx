import { leaveScreen } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/Buttons';
import { FaceGate, isFaceGateAvailable } from '@/components/FaceGate';
import { useAppData } from '@/data/AppData';
import { beginChallenge, stepChallenge, type Challenge, type ChallengeFrame } from '@/features/face/challenge';
import { getTimeflowAlarm } from '@/services/native-alarm';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { formatTime } from '@/utils/datetime';

const IDLE: ChallengeFrame = {
  challenge: beginChallenge(),
  hint: 'Yuzingizni ovalga joylang',
  ok: false,
  progress: 0,
};

export default function RingingScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { alarms, snooze, dismiss } = useAppData();
  const alarm = alarms.find((item) => item.id === id);
  const title = alarm?.title ?? 'Budilnik';
  const hour = alarm?.hour ?? new Date().getHours();
  const minute = alarm?.minute ?? new Date().getMinutes();
  const snoozeMinutes = alarm?.snoozeMinutes ?? 5;
  const challenge = useRef<Challenge>(beginChallenge());
  const stopped = useRef(false);
  const [frame, setFrame] = useState<ChallengeFrame>(IDLE);
  const [camera, setCamera] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const gateReady = isFaceGateAvailable();

  useEffect(() => {
    const native = getTimeflowAlarm();
    try {
      native?.setRingingWindow(true);
    } catch {
      // The activity also applies these flags before JavaScript loads.
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then((result) => setCamera(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'))
        .catch(() => setCamera('denied'));
    }
    return () => {
      try {
        native?.setRingingWindow(false);
      } catch {
        // Closing the screen must not depend on the window flag.
      }
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (frame.challenge.phase !== 'done' || !id || stopped.current) {
      return;
    }
    stopped.current = true;
    dismiss(id)
      .then(() => leaveScreen('/'))
      .catch(() => {
        stopped.current = false;
      });
  }, [dismiss, frame.challenge.phase, id]);

  if (!id) {
    return (
      <View style={[styles.fill, styles.missing, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
        <AppText tone="display" style={{ color: colors.text, fontSize: 22, textAlign: 'center' }}>
          Signal identifikatori yo‘q
        </AppText>
        <PrimaryButton label="Yopish" onPress={() => leaveScreen('/')} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.fill,
        {
          backgroundColor: '#0C100E',
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <AppText tone="displayLight" style={styles.time}>
        {formatTime(hour, minute)}
      </AppText>
      <AppText tone="body" style={styles.name}>
        {title}
      </AppText>
      <AppText tone="bodyBold" style={[styles.hint, { color: frame.ok ? '#7FCBB8' : '#E6EBE6' }]}>
        {frame.hint}
      </AppText>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${Math.round(frame.progress * 100)}%`, backgroundColor: colors.accent }]} />
      </View>
      <View style={styles.stage}>
        {camera === 'granted' && gateReady ? (
          <FaceGate
            running
            style={StyleSheet.absoluteFill}
            onSample={(sample) => {
              const next = stepChallenge(challenge.current, sample, Date.now());
              challenge.current = next.challenge;
              setFrame(next);
            }}
          />
        ) : (
          <View style={styles.permission}>
            <AppText tone="body" style={styles.permissionText}>
              {!gateReady
                ? 'Yuz skaneri yuklanmadi. Ilovani qayta o‘rnating.'
                : camera === 'denied'
                  ? 'Kamerasiz signal to‘xtamaydi.'
                  : 'Kamera ochilmoqda…'}
            </AppText>
            {camera === 'denied' ? (
              <PrimaryButton
                label="Kamerani yoqish"
                onPress={() => {
                  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
                    .then((result) => setCamera(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied'))
                    .catch(() => setCamera('denied'));
                }}
              />
            ) : null}
          </View>
        )}
        <View pointerEvents="none" style={styles.oval} />
      </View>
      <AppText tone="body" style={styles.note}>
        Tasodifiy buyruq bajarilganda signal o‘chadi.
      </AppText>
      <PrimaryButton
        label={`Kechiktirish · ${snoozeMinutes} daqiqa`}
        tone="ghost"
        onPress={() => {
          snooze(id)
            .then(() => leaveScreen('/'))
            .catch(() => undefined);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, paddingHorizontal: 22, gap: 10 },
  missing: { justifyContent: 'center', gap: 20 },
  time: { color: '#E6EBE6', fontSize: 56, letterSpacing: -1.5, textAlign: 'center', fontVariant: ['tabular-nums'] },
  name: { color: '#939C95', fontSize: 16, textAlign: 'center' },
  hint: { fontSize: 18, textAlign: 'center', minHeight: 48 },
  track: { height: 2, backgroundColor: 'rgba(230,235,230,0.16)', overflow: 'hidden' },
  trackFill: { height: 2 },
  stage: { flex: 1, overflow: 'hidden', backgroundColor: '#161B18', alignItems: 'center', justifyContent: 'center' },
  oval: {
    position: 'absolute',
    width: 210,
    height: 280,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(230,235,230,0.85)',
  },
  permission: { padding: 24, gap: 16, alignItems: 'center' },
  permissionText: { color: '#E6EBE6', fontSize: 16, textAlign: 'center', lineHeight: 22 },
  note: { color: '#6F7872', fontSize: 13, textAlign: 'center' },
});
