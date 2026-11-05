import { expect, test } from '@playwright/test';
import { parseCount, parseResultsSummary, parseStarRating } from '../../src/utils/catalog';

test.describe('parseResultsSummary', () => {
  test('reads the range and the total', () => {
    expect(parseResultsSummary('Showing 13–24 of 49 products')).toEqual({
      from: 13,
      to: 24,
      total: 49,
    });
    expect(parseResultsSummary('Showing 1–1 of 1 product')).toEqual({ from: 1, to: 1, total: 1 });
  });

  test('reads "No products found" as an empty result', () => {
    expect(parseResultsSummary('No products found')).toEqual({ from: 0, to: 0, total: 0 });
  });

  test('rejects anything else', () => {
    expect(() => parseResultsSummary('Loading…')).toThrow(/Unrecognised/);
  });
});

test.describe('other labels', () => {
  test('parseStarRating reads the accessible rating', () => {
    expect(parseStarRating('4.8 out of 5 stars')).toBe(4.8);
    expect(parseStarRating('5 out of 5 stars')).toBe(5);
  });

  test('parseCount reads the first number', () => {
    expect(parseCount('Electronics 7')).toBe(7);
    expect(parseCount('6 items')).toBe(6);
  });
});
