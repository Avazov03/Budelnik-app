import { Stack, useLocalSearchParams } from 'expo-router';

import { leaveScreen } from '@/utils/navigation';

import { EventForm } from '@/components/EventForm';
import { ScreenContainer } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { emptyEventDraft, validateEventDraft } from '@/features/calendar/rules';
import { formatIsoDate } from '@/utils/datetime';

export default function NewEventScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const date = typeof params.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : formatIsoDate(new Date());
  const { saveEvent } = useAppData();

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Yangi tadbir' }} />
      <EventForm
        initial={emptyEventDraft(date)}
        submitLabel="Saqlash"
        onSubmit={async (draft) => {
          const result = validateEventDraft(draft, new Date());
          if (!result.ok) {
            throw new Error(result.error);
          }
          await saveEvent(result.value);
          leaveScreen('/calendar');
        }}
      />
    </ScreenContainer>
  );
}
