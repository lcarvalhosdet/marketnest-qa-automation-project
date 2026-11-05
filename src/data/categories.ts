export const categories = [
  'electronics',
  'home-kitchen',
  'fashion',
  'sports-outdoors',
  'books',
  'toys-games',
  'beauty',
  'garden',
] as const;

export type Category = (typeof categories)[number];
