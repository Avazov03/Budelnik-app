import { Stack } from 'expo-router';

import { leaveScreen } from '@/utils/navigation';

import { AlarmForm } from '@/components/AlarmForm';
import { ScreenContainer } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { emptyAlarmDraft } from '@/features/alarms/validation';

export default function NewAlarmScreen() {
  const { saveAlarmRecord } = useAppData();
  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Yangi budilnik' }} />
      <AlarmForm
        initial={emptyAlarmDraft()}
        submitLabel="Saqlash"
        onSubmit={async (draft) => {
          const { validateAlarmDraft } = await import('@/features/alarms/validation');
          const result = validateAlarmDraft(draft);
          if (!result.ok) {
            throw new Error(result.error);
          }
          await saveAlarmRecord(result.value);
          leaveScreen('/alarms');
        }}
      />
    </ScreenContainer>
  );
}
