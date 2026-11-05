import { expect, test } from '@playwright/test';
import { addBusinessDays, formatArrivalDate, isWeekend, todayIn } from '../../src/utils/delivery';

const date = (iso: string) => new Date(`${iso}T00:00:00Z`);

test.describe('todayIn', () => {
  test('returns the calendar date in the given time zone', () => {
    const now = new Date('2026-11-05T00:30:00Z');
    expect(todayIn('America/New_York', now)).toEqual(date('2026-11-04'));
    expect(todayIn('UTC', now)).toEqual(date('2026-11-05'));
  });
});

test.describe('addBusinessDays', () => {
  test('counts from the next day and skips weekends', () => {
    expect(addBusinessDays(date('2026-11-04'), 5)).toEqual(date('2026-11-11')); // Wed -> Wed
    expect(addBusinessDays(date('2026-11-04'), 2)).toEqual(date('2026-11-06')); // Wed -> Fri
    expect(addBusinessDays(date('2026-11-06'), 2)).toEqual(date('2026-11-10')); // Fri -> Tue
    expect(addBusinessDays(date('2026-11-07'), 1)).toEqual(date('2026-11-09')); // Sat -> Mon
  });

  test('crosses month and year ends', () => {
    expect(addBusinessDays(date('2026-12-30'), 3)).toEqual(date('2027-01-04'));
  });
});

test.describe('helpers', () => {
  test('isWeekend is true only on Saturday and Sunday', () => {
    expect(isWeekend(date('2026-11-07'))).toBe(true);
    expect(isWeekend(date('2026-11-08'))).toBe(true);
    expect(isWeekend(date('2026-11-09'))).toBe(false);
  });

  test('formatArrivalDate matches the product page format', () => {
    expect(formatArrivalDate(date('2026-11-11'))).toBe('Wednesday, Nov 11');
  });
});
