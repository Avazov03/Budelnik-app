import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { PrimaryButton } from '@/components/Buttons';
import { CalendarMonthView } from '@/components/CalendarMonthView';
import { EventCard } from '@/components/EventCard';
import { EmptyState, ScreenContainer, SectionLabel } from '@/components/Screen';
import { useAppData } from '@/data/AppData';
import { AppText, useAppTheme } from '@/theme/ThemeProvider';
import { formatIsoDate, sameLocalDay } from '@/utils/datetime';

export default function CalendarScreen() {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), monthIndex: today.getMonth() });
  const [selected, setSelected] = useState(formatIsoDate(today));
  const { events } = useAppData();
  const { colors } = useAppTheme();
  const marked = useMemo(() => new Set(events.map((event) => formatIsoDate(new Date(event.startAt)))), [events]);
  const selectedEvents = events.filter((event) => sameLocalDay(event.startAt, selected));

  return (
    <ScreenContainer>
      <AppText tone="displayBold" style={{ color: colors.text, fontSize: 34, letterSpacing: -0.8 }}>
        Kalendar
      </AppText>
      <AppText tone="body" style={{ color: colors.textMuted }}>
        Hafta dushanbadan boshlanadi.
      </AppText>
      <CalendarMonthView
        year={cursor.year}
        monthIndex={cursor.monthIndex}
        selected={selected}
        marked={marked}
        onSelect={setSelected}
        onMonthChange={(year, monthIndex) => setCursor({ year, monthIndex })}
      />
      <SectionLabel>Tanlangan sana</SectionLabel>
      {selectedEvents.length === 0 ? (
        <EmptyState title="Tadbir yo‘q" body="Shu kunga yangi tadbir qo‘shishingiz mumkin." />
      ) : (
        selectedEvents.map((event) => (
          <EventCard key={event.id} event={event} onPress={() => router.push({ pathname: '/events/[id]', params: { id: event.id } })} />
        ))
      )}
      <PrimaryButton label="Tadbir qo‘shish" onPress={() => router.push({ pathname: '/events/new', params: { date: selected } })} />
    </ScreenContainer>
  );
}
