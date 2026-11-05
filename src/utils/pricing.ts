
export interface DisplayedPricing {
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
}

// Prefer grouped thousands so "$1,299" is not parsed as "$1".
const PRICE_PATTERN = /\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g;
// App badges may use ASCII, unicode minus, or en dash.
const BADGE_PATTERN = /^[-−–]\s?(\d{1,3})\s?%$/;

export function parsePrice(label: string): number {
  const matches = [...label.matchAll(PRICE_PATTERN)];
  const match = matches[0];
  if (matches.length !== 1 || !match) {
    throw new Error(`Expected exactly one price in "${label}", found ${matches.length}`);
  }
  const dollars = Number((match[1] ?? '').replaceAll(',', ''));
  const cents = Number(match[2] ?? '0');
  return dollars * 100 + cents;
}

export function parseDiscountBadge(label: string): number {
  const match = BADGE_PATTERN.exec(label.trim());
  if (!match?.[1]) throw new Error(`Unrecognised discount badge: "${label}"`);
  return Number(match[1]);
}

export function parseSurcharge(label: string): number {
  return /\+\s?\$/.test(label) ? parsePrice(label) : 0;
}

export function parseOptional<T>(labels: string[], parse: (label: string) => T): T | undefined {
  const [label] = labels;
  return label === undefined ? undefined : parse(label);
}

export function percentOff(priceCents: number, compareAtCents: number): number {
  if (compareAtCents <= 0) {
    throw new RangeError(`Original price must be positive, got ${compareAtCents} cents`);
  }
  return ((compareAtCents - priceCents) / compareAtCents) * 100;
}

export function expectedBadgePercent(priceCents: number, compareAtCents: number): number {
  return Math.round(percentOff(priceCents, compareAtCents));
}

export const SALES_TAX_PERCENT = 8;

export function salesTax(taxableCents: number): number {
  return Math.round((taxableCents * SALES_TAX_PERCENT) / 100);
}

export function percentDiscount(subtotalCents: number, percent: number): number {
  return Math.round((subtotalCents * percent) / 100);
}

export const MARKETPLACE_FEE_PERCENT = 10;

export function marketplaceFee(itemSubtotalCents: number): number {
  return Math.round((itemSubtotalCents * MARKETPLACE_FEE_PERCENT) / 100);
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}
