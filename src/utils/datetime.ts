export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAY_SHORT = ['', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'] as const;

export const WEEKDAY_FULL = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
] as const;

export const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
] as const;

export function isoWeekday(date: Date): IsoWeekday {
  const day = date.getDay();
  return (day === 0 ? 7 : day) as IsoWeekday;
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatClock(date: Date, withSeconds = false): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (!withSeconds) {
    return `${hours}:${minutes}`;
  }
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatLongDate(date: Date): string {
  return `${WEEKDAY_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDate(isoDate: string): string {
  const parsed = parseIsoDate(isoDate);
  if (!parsed) {
    return isoDate;
  }
  return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${formatClock(date)}`;
}

export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function parseLocalDateTime(date: string, time: string): Date | null {
  const day = parseIsoDate(date);
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!day || !match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    return null;
  }
  day.setHours(hour, minute, 0, 0);
  return day;
}

export function formatRepeatDays(days: number[]): string {
  const sorted = [...new Set(days.filter((day) => day >= 1 && day <= 7))].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return 'Bir martalik';
  }
  if (sorted.length === 7) {
    return 'Har kuni';
  }
  if (sorted.join(',') === '1,2,3,4,5') {
    return 'Ish kunlari';
  }
  if (sorted.join(',') === '6,7') {
    return 'Dam olish kunlari';
  }
  return sorted.map((day) => WEEKDAY_SHORT[day]).join(', ');
}

export function formatCountdown(targetIso: string, now: Date): string {
  const remaining = new Date(targetIso).getTime() - now.getTime();
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return 'Hozir';
  }
  const totalMinutes = Math.floor(remaining / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days} kun ${hours} soat`;
  }
  if (hours > 0) {
    return `${hours} soat ${minutes} daqiqa`;
  }
  if (minutes > 0) {
    return `${minutes} daqiqa`;
  }
  return '1 daqiqadan kam';
}

export type MonthCell = {
  date: string;
  inMonth: boolean;
};

export function monthGrid(year: number, monthIndex: number): MonthCell[] {
  const first = new Date(year, monthIndex, 1);
  const offset = isoWeekday(first) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: MonthCell[] = [];

  for (let index = 0; index < offset; index += 1) {
    const date = new Date(year, monthIndex, 1 - (offset - index));
    cells.push({ date: formatIsoDate(date), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: formatIsoDate(new Date(year, monthIndex, day)), inMonth: true });
  }
  let extra = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: formatIsoDate(new Date(year, monthIndex, daysInMonth + extra)),
      inMonth: false,
    });
    extra += 1;
  }
  return cells;
}

export function shiftMonth(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const date = new Date(year, monthIndex + delta, 1);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

export function sameLocalDay(isoDateTime: string, day: string): boolean {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return formatIsoDate(date) === day;
}

export function timeZoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'local';
}
