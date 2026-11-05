import { expect, test } from '@playwright/test';
import {
  expectedBadgePercent,
  formatPrice,
  marketplaceFee,
  parseDiscountBadge,
  parseOptional,
  parsePrice,
  parseSurcharge,
  percentDiscount,
  percentOff,
  salesTax,
} from '../../src/utils/pricing';

test.describe('parsePrice', () => {
  test('reads a price label into cents', () => {
    expect(parsePrice('$95.00')).toBe(9_500);
    expect(parsePrice('$149.99')).toBe(14_999);
    expect(parsePrice('$1,299.99')).toBe(129_999);
    expect(parsePrice('$1299.99')).toBe(129_999);
    expect(parsePrice('$12')).toBe(1_200);
  });

  test('finds the price inside a sentence', () => {
    expect(parsePrice('You save $45.00')).toBe(4_500);
  });

  test('rejects labels with no price or more than one', () => {
    expect(() => parsePrice('Free')).toThrow(/exactly one price/);
    expect(() => parsePrice('$95.00$140.00')).toThrow(/exactly one price/);
  });
});

test.describe('parseDiscountBadge', () => {
  test('reads the number on the badge', () => {
    expect(parseDiscountBadge('-47%')).toBe(47);
    expect(parseDiscountBadge(' -5% ')).toBe(5);
    expect(parseDiscountBadge('-20%')).toBe(20);
  });

  test('rejects anything that is not a badge', () => {
    expect(() => parseDiscountBadge('47')).toThrow(/Unrecognised discount badge/);
    expect(() => parseDiscountBadge('Sale')).toThrow(/Unrecognised discount badge/);
  });
});

test.describe('parseSurcharge', () => {
  test('reads the extra cost of a variant', () => {
    expect(parseSurcharge('Blue switches+$10.00')).toBe(1_000);
    expect(parseSurcharge('XL + $2.50')).toBe(250);
  });

  test('is zero when the variant costs nothing extra', () => {
    expect(parseSurcharge('Brown switches')).toBe(0);
    expect(parseSurcharge('Red switches(sold out)')).toBe(0);
  });
});

test.describe('discount math', () => {
  test('is relative to the original price, not the sale price', () => {
    expect(percentOff(9_500, 14_000)).toBeCloseTo(32.14, 2);
    expect(expectedBadgePercent(9_500, 14_000)).toBe(32);
  });

  test('rounds the badge to the nearest whole percent', () => {
    expect(expectedBadgePercent(14_999, 19_999)).toBe(25); // 25.001%
    expect(expectedBadgePercent(23_900, 28_900)).toBe(17); // 17.30%
    expect(expectedBadgePercent(3_999, 5_499)).toBe(27); // 27.28%
    expect(expectedBadgePercent(2_200, 2_800)).toBe(21); // 21.43%
  });

  test('rejects an original price that is not positive', () => {
    expect(() => percentOff(100, 0)).toThrow(RangeError);
  });
});

test.describe('order math', () => {
  test('tax is 8% of the subtotal after the discount (Help example)', () => {
    const discount = percentDiscount(5_000, 10);
    expect(discount).toBe(500);
    expect(salesTax(5_000 - discount)).toBe(360);
  });

  test('rounds tax and discounts to the cent', () => {
    expect(percentDiscount(9_999, 10)).toBe(1_000); // $9.999 -> $10.00
    expect(salesTax(8_999)).toBe(720); // $7.1992 -> $7.20
  });

  test('marketplace fee is 10% of item sales (Help example)', () => {
    expect(marketplaceFee(4_000)).toBe(400); // $40.00 item -> $4.00 fee, $36.00 earned
    expect(marketplaceFee(5_000)).toBe(500);
  });
});

test.describe('helpers', () => {
  test('parseOptional returns undefined when the element is missing', () => {
    expect(parseOptional([], parsePrice)).toBeUndefined();
    expect(parseOptional(['$5.99'], parsePrice)).toBe(599);
  });

  test('formatPrice writes cents as dollars', () => {
    expect(formatPrice(129_999)).toBe('$1,299.99');
    expect(formatPrice(9_500)).toBe('$95.00');
  });
});
