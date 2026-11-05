const DAY_MS = 24 * 60 * 60 * 1000;

export function todayIn(timeZone: string, now: Date = new Date()): Date {
  const isoDate = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return new Date(`${isoDate}T00:00:00Z`);
}

export function isWeekend(date: Date): boolean {
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
}

export function addBusinessDays(start: Date, days: number): Date {
  let date = start;
  let left = days;
  while (left > 0) {
    date = new Date(date.getTime() + DAY_MS);
    if (!isWeekend(date)) left--;
  }
  return date;
}

const arrivalFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

export function formatArrivalDate(date: Date): string {
  return arrivalFormat.format(date);
}
