import { requireNativeViewManager } from 'expo-modules-core';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

import type { FaceSample } from '@/features/face/challenge';

type NativeFaceEvent = { nativeEvent: Partial<FaceSample> };

type FaceGateNative = React.ComponentType<{
  running: boolean;
  style?: StyleProp<ViewStyle>;
  onFace?: (event: NativeFaceEvent) => void;
}>;

function loadNative(): FaceGateNative | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  try {
    return requireNativeViewManager('TimeflowAlarm', 'FaceGateView') as FaceGateNative;
  } catch {
    return null;
  }
}

const NativeFaceGate = loadNative();

export function FaceGate({
  running,
  onSample,
  style,
}: {
  running: boolean;
  onSample: (sample: FaceSample) => void;
  style?: StyleProp<ViewStyle>;
}) {
  if (!NativeFaceGate) {
    return null;
  }
  return (
    <NativeFaceGate
      running={running}
      style={style}
      onFace={(event: NativeFaceEvent) => {
        const raw = event.nativeEvent;
        // Preview is mirrored; ML Kit boxes are not. Align against what the user sees.
        const centerX = number(raw.centerX);
        onSample({
          faces: number(raw.faces),
          yaw: number(raw.yaw),
          roll: number(raw.roll),
          brightness: number(raw.brightness),
          centerX: centerX > 0 ? 1 - centerX : 0,
          centerY: number(raw.centerY),
          faceRatio: number(raw.faceRatio),
          leftEye: number(raw.leftEye, -1),
          rightEye: number(raw.rightEye, -1),
          smile: number(raw.smile, -1),
        });
      }}
    />
  );
}

export function isFaceGateAvailable(): boolean {
  return NativeFaceGate != null;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
