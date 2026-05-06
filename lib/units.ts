export const UNITS = [
  "Foothill 1st Ward",
  "Foothill 2nd Ward",
  "Foothills 3rd Branch (Mandarin)",
  "Hillcrest 1st Ward",
  "Hillcrest 2nd Ward",
  "Lundstrom Park 1st Ward",
  "Lundstrom Park 2nd Ward",
  "Lundstrom Park 3rd Ward",
  "Community Member",
] as const;

export type Unit = (typeof UNITS)[number];
