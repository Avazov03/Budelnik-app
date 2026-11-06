import { AppState } from 'react-native';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Alarm, ValidAlarmInput } from '@/types/alarm';
import type { CalendarEvent, ValidEventInput } from '@/types/event';
import type { PrayerKey, PrayerSettings, PrayerSnapshot } from '@/types/prayer';
import { EMPTY_PRAYER } from '@/data/emptyPrayer';
import {
  dismissAlarm,
  refreshAll,
  removeAlarm,
  removeEvent,
  saveAlarm,
  saveEventRecord,
  saveTheme,
  setAlarmEnabled,
  snoozeAlarm,
  type AppSnapshot,
  type PlatformSnapshot,
  type ThemePreference,
} from '@/services/platform/sync';
import { addManualQaza, markPrayerDone, resolvePrayerQaza, savePrayerSettings } from '@/services/prayer/sync';
import { requestNotificationPermission } from '@/services/notifications/reminders';

type AppDataValue = AppSnapshot & {
  ready: boolean;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  saveAlarmRecord: (input: ValidAlarmInput, id?: string) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
  snooze: (id: string) => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  saveEvent: (input: ValidEventInput, id?: string) => Promise<string | undefined>;
  deleteEvent: (id: string) => Promise<void>;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  updatePrayerSettings: (settings: PrayerSettings) => Promise<void>;
  markPrayerRead: (day: string, prayer: PrayerKey) => Promise<void>;
  clearQaza: (id: string) => Promise<void>;
  addQazaItem: (day: string, prayer: PrayerKey) => Promise<void>;
};

const EMPTY_PLATFORM: PlatformSnapshot = {
  nativeAvailable: false,
  exactAlarm: false,
  notifications: false,
  fullScreenIntent: false,
  overlay: false,
};

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children, onReady }: { children: ReactNode; onReady: () => void }) {
  const [ready, setReady] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [theme, setTheme] = useState<ThemePreference>('system');
  const [platform, setPlatform] = useState<PlatformSnapshot>(EMPTY_PLATFORM);
  const [prayer, setPrayer] = useState<PrayerSnapshot>(EMPTY_PRAYER);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queue = useRef(Promise.resolve());
  const readyOnce = useRef(false);

  const apply = useCallback((snapshot: AppSnapshot) => {
    setAlarms(snapshot.alarms);
    setEvents(snapshot.events);
    setTheme(snapshot.theme);
    setPlatform(snapshot.platform);
    setPrayer(snapshot.prayer);
    setNotice(snapshot.notice);
  }, []);

  const run = useCallback((task: () => Promise<void>) => {
    const next = queue.current.then(task, task);
    queue.current = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }, []);

  const fail = useCallback((caught: unknown) => {
    setError(caught instanceof Error ? caught.message : 'Amal bajarilmadi.');
  }, []);

  const refresh = useCallback(async () => {
    await run(async () => {
      try {
        apply(await refreshAll());
        setError(null);
      } catch (caught) {
        fail(caught);
      }
    });
  }, [apply, fail, run]);

  useEffect(() => {
    let active = true;
    run(async () => {
      try {
        await requestNotificationPermission();
        const snapshot = await refreshAll();
        if (active) {
          apply(snapshot);
        }
      } catch (caught) {
        if (active) {
          fail(caught);
        }
      }
    }).finally(() => {
      if (!active || readyOnce.current) {
        return;
      }
      readyOnce.current = true;
      setReady(true);
      onReady();
    });
    return () => {
      active = false;
    };
  }, [apply, fail, onReady, run]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && readyOnce.current) {
        refresh().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  const applyPrayer = useCallback(
    async (task: () => Promise<PrayerSnapshot>) => {
      await run(async () => {
        try {
          await task();
          apply(await refreshAll());
          setError(null);
        } catch (caught) {
          fail(caught);
          throw caught;
        }
      });
    },
    [apply, fail, run],
  );

  const value = useMemo<AppDataValue>(
    () => ({
      ready,
      alarms,
      events,
      theme,
      platform,
      prayer,
      notice,
      error,
      clearError: () => setError(null),
      refresh,
      saveAlarmRecord: async (input, id) => {
        await run(async () => {
          try {
            apply(await saveAlarm(input, id));
            setError(null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
      },
      deleteAlarm: async (id) => {
        await run(async () => {
          try {
            apply(await removeAlarm(id));
            setError(null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
      },
      toggleAlarm: async (id, enabled) => {
        await run(async () => {
          try {
            apply(await setAlarmEnabled(id, enabled));
            setError(null);
          } catch (caught) {
            fail(caught);
          }
        });
      },
      snooze: async (id) => {
        await run(async () => {
          try {
            apply(await snoozeAlarm(id));
            setError(null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
      },
      dismiss: async (id) => {
        await run(async () => {
          try {
            apply(await dismissAlarm(id));
            setError(null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
      },
      saveEvent: async (input, id) => {
        let warning: string | undefined;
        await run(async () => {
          try {
            const result = await saveEventRecord(input, id);
            apply(result.snapshot);
            warning = result.warning;
            setError(result.warning ?? null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
        return warning;
      },
      deleteEvent: async (id) => {
        await run(async () => {
          try {
            apply(await removeEvent(id));
            setError(null);
          } catch (caught) {
            fail(caught);
            throw caught;
          }
        });
      },
      setThemePreference: async (next) => {
        setTheme(next);
        try {
          await saveTheme(next);
        } catch (caught) {
          fail(caught);
        }
      },
      updatePrayerSettings: async (settings) => {
        await applyPrayer(() => savePrayerSettings(settings));
      },
      markPrayerRead: async (day, prayerKey) => {
        await applyPrayer(() => markPrayerDone(day, prayerKey));
      },
      clearQaza: async (id) => {
        await applyPrayer(() => resolvePrayerQaza(id));
      },
      addQazaItem: async (day, prayerKey) => {
        await applyPrayer(() => addManualQaza(day, prayerKey));
      },
    }),
    [alarms, apply, applyPrayer, error, events, fail, notice, platform, prayer, ready, refresh, run, theme],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('AppDataProvider topilmadi.');
  }
  return value;
}
