import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { leaveScreen } from '@/utils/navigation';

import { ConfirmationDialog } from '@/components/Buttons';
import { EventForm } from '@/components/EventForm';
import { EmptyState, ScreenContainer } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { validateEventDraft } from '@/features/calendar/rules';
import type { EventDraft } from '@/types/event';
import { formatClock, formatIsoDate } from '@/utils/datetime';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, saveEvent, deleteEvent } = useAppData();
  const event = events.find((item) => item.id === id);
  const [confirming, setConfirming] = useState(false);

  if (!event) {
    return (
      <ScreenContainer>
        <Stack.Screen options={{ title: 'Tadbir' }} />
        <EmptyState title="Tadbir topilmadi" body="U o‘chirilgan yoki hali yuklanmagan bo‘lishi mumkin." />
      </ScreenContainer>
    );
  }

  const start = new Date(event.startAt);
  const end = event.endAt ? new Date(event.endAt) : null;
  const initial: EventDraft = {
    title: event.title,
    description: event.description ?? '',
    date: formatIsoDate(start),
    startTime: formatClock(start),
    endTime: end ? formatClock(end) : null,
    reminderEnabled: event.reminderEnabled,
    reminderOffsetMinutes: event.reminderOffsetMinutes,
  };

  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Tadbirni tahrirlash' }} />
      <EventForm
        initial={initial}
        submitLabel="Saqlash"
        onDelete={() => setConfirming(true)}
        onSubmit={async (draft) => {
          const result = validateEventDraft(draft, new Date());
          if (!result.ok) {
            throw new Error(result.error);
          }
          await saveEvent(result.value, event.id);
          leaveScreen('/calendar');
        }}
      />
      <ConfirmationDialog
        visible={confirming}
        title="Tadbir o‘chirilsinmi?"
        message="Bog‘langan eslatma ham bekor qilinadi."
        confirmLabel="O‘chirish"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          deleteEvent(event.id)
            .then(() => leaveScreen('/calendar'))
            .catch(() => undefined);
        }}
      />
    </ScreenContainer>
  );
}
