export interface ResultsSummary {
  from: number;
  to: number;
  total: number;
}

const SUMMARY_PATTERN = /Showing\s+(\d+)\s*[–-]\s*(\d+)\s+of\s+(\d+)\s+products?/i;

export function parseResultsSummary(label: string): ResultsSummary {
  if (/no products found/i.test(label)) return { from: 0, to: 0, total: 0 };
  const match = SUMMARY_PATTERN.exec(label);
  if (!match) throw new Error(`Unrecognised results summary: "${label}"`);
  return { from: Number(match[1]), to: Number(match[2]), total: Number(match[3]) };
}

export function parseStarRating(label: string): number {
  const match = /([\d.]+)\s+out of 5 stars/i.exec(label);
  if (!match?.[1]) throw new Error(`Unrecognised rating: "${label}"`);
  return Number(match[1]);
}

export function parseCount(label: string): number {
  const match = /(\d+)/.exec(label);
  if (!match?.[1]) throw new Error(`No number in "${label}"`);
  return Number(match[1]);
}
