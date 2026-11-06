import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { leaveScreen } from '@/utils/navigation';

import { AlarmForm } from '@/components/AlarmForm';
import { ConfirmationDialog } from '@/components/Buttons';
import { EmptyState, ScreenContainer } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { validateAlarmDraft } from '@/features/alarms/validation';
import type { AlarmDraft } from '@/types/alarm';

export default function EditAlarmScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alarms, saveAlarmRecord, deleteAlarm } = useAppData();
  const alarm = alarms.find((item) => item.id === id);
  const [confirming, setConfirming] = useState(false);

  if (!alarm) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: 'Budilnik' }} />
        <EmptyState title="Budilnik topilmadi" body="U o‘chirilgan yoki hali yuklanmagan bo‘lishi mumkin." />
      </ScreenContainer>
    );
  }

  const initial: AlarmDraft = {
    title: alarm.title,
    hour: alarm.hour,
    minute: alarm.minute,
    repeatDays: alarm.repeatDays,
    isEnabled: alarm.isEnabled,
    snoozeMinutes: alarm.snoozeMinutes,
    soundId: alarm.soundId,
    vibrationEnabled: alarm.vibrationEnabled,
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Budilnikni tahrirlash' }} />
      <AlarmForm
        initial={initial}
        submitLabel="Saqlash"
        onDelete={() => setConfirming(true)}
        onSubmit={async (draft) => {
          const result = validateAlarmDraft(draft);
          if (!result.ok) {
            throw new Error(result.error);
          }
          await saveAlarmRecord(result.value, alarm.id);
          leaveScreen('/alarms');
        }}
      />
      <ConfirmationDialog
        visible={confirming}
        title="Budilnik o‘chirilsinmi?"
        message="Mahalliy yozuv va tizimdagi signal birga bekor qilinadi."
        confirmLabel="O‘chirish"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          deleteAlarm(alarm.id)
            .then(() => leaveScreen('/alarms'))
            .catch(() => undefined);
        }}
      />
    </ScreenContainer>
  );
}
