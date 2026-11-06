import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { NativeAlarmRecord } from '@/types/alarm';

export type NativeSyncResult = {
  ok: boolean;
  blocked: boolean;
  reason: string | null;
};

type TimeflowAlarmNative = {
  syncAlarms(json: string): Promise<string>;
  getSnapshot(): Promise<string>;
  snooze(id: string): Promise<string>;
  dismiss(id: string): Promise<string>;
  canScheduleExactAlarms(): boolean;
  canPostNotifications(): boolean;
  canUseFullScreenIntent(): boolean;
  canDrawOverlays(): boolean;
  openExactAlarmSettings(): void;
  openNotificationSettings(): void;
  openFullScreenIntentSettings(): void;
  openBatterySettings(): void;
  openOverlaySettings(): void;
  setRingingWindow(enabled: boolean): void;
};

let cached: TimeflowAlarmNative | null | undefined;

export function getTimeflowAlarm(): TimeflowAlarmNative | null {
  if (cached !== undefined) {
    return cached;
  }
  if (Platform.OS !== 'android') {
    cached = null;
    return null;
  }
  try {
    cached = requireNativeModule('TimeflowAlarm') as TimeflowAlarmNative;
  } catch {
    cached = null;
  }
  return cached;
}

export function resetNativeModuleCache(): void {
  cached = undefined;
}

export async function readNativeSnapshot(): Promise<NativeAlarmRecord[]> {
  const native = getTimeflowAlarm();
  if (!native) {
    return [];
  }
  return parseSnapshot(await native.getSnapshot());
}

export function parseSnapshot(json: string): NativeAlarmRecord[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isRecord);
  } catch {
    return [];
  }
}

function isRecord(value: unknown): value is NativeAlarmRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Partial<NativeAlarmRecord>;
  return typeof record.id === 'string' && typeof record.triggerAt === 'number' && typeof record.updatedAt === 'number';
}

export function parseSyncResult(json: string): NativeSyncResult {
  try {
    const parsed = JSON.parse(json) as Partial<NativeSyncResult>;
    return {
      ok: Boolean(parsed.ok),
      blocked: Boolean(parsed.blocked),
      reason: typeof parsed.reason === 'string' ? parsed.reason : null,
    };
  } catch {
    return { ok: false, blocked: true, reason: 'native' };
  }
}
