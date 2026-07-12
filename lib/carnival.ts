// The carnival is a single event that lives in the `events` table (admin-managed).
// This id ties the sign-up sheet to that event so the title/time/location have one
// source of truth. Everything else here is sign-up-specific copy not stored on the event.
export const CARNIVAL_EVENT_ID = "bfd51c6a-9023-4011-91ef-7b1e780d632d";

export const EVENT = {
  contactName: "Hannah Holm",
  contactPhone: "801-698-6053",
  blurb:
    "We need stake members to run booths, activities, and more. There's direction and " +
    "plenty of support, but your booth is largely up to you and your own creativity. " +
    "Hannah can help with supplies and materials as needed.",
} as const;

export type BoothKind = "standard" | "game" | "cookies";

export type Booth = {
  id: string; // stored in carnival_signups.booth
  label: string;
  note: string;
  kind: BoothKind; // game → "own prizes" ♡ checkbox; cookies → quantity field
  multi?: boolean; // informational ("several volunteers welcome")
};

// Shared note shown on every game booth.
export const GAME_NOTE =
  "Prizes are provided for game booths. Check the box below if you'd like to bring your own ♡";

export const BOOTHS: Booth[] = [
  {
    id: "face_painting",
    label: "Face Painting",
    note: "You don't have to be a professional. At least two volunteers so no one waits too long.",
    kind: "standard",
    multi: true,
  },
  {
    id: "bubble_station",
    label: "Bubble Station",
    note: "Giant bubbles, bubble machines, and bubble wands for the kids to try.",
    kind: "standard",
  },
  {
    id: "craft_area",
    label: "Craft Area",
    note: "Keep it simple — even coloring pages and crayons work great.",
    kind: "standard",
  },
  {
    id: "story_station",
    label: "Story Station",
    note: "Bring your favorite children's books (or Hannah can provide). Read on the half/quarter hour, or take turns. Great option for youth!",
    kind: "standard",
    multi: true,
  },
  {
    id: "fishing_pond",
    label: "Fishing Pond game",
    note: "",
    kind: "game",
  },
  {
    id: "knock_down_cans",
    label: "Knock-down cans game",
    note: "",
    kind: "game",
  },
  {
    id: "ring_toss",
    label: "Ring / bean bag toss",
    note: "",
    kind: "game",
  },
  {
    id: "plinko",
    label: "Plinko / Spin-the-Wheel",
    note: "",
    kind: "game",
  },
  {
    id: "visiting_area",
    label: "Visiting area",
    note: "Patio furniture, camp chairs, picnic blankets — set up a cozy spot for parents and family to relax and talk. Several volunteers can contribute.",
    kind: "standard",
    multi: true,
  },
  {
    id: "popcorn",
    label: "Popcorn machine",
    note: "Someone who can lend and operate a popcorn machine and fill bags/cups.",
    kind: "standard",
  },
  {
    id: "lemonade",
    label: "Lemonade service",
    note: "We provide the lemonade — just need someone to serve it.",
    kind: "standard",
  },
  {
    id: "cookies",
    label: "Cookies",
    note: "Make or bring cookies — we need about 100 total (8–9 dozen). Let us know how many you can bring.",
    kind: "cookies",
    multi: true,
  },
  {
    id: "decorations",
    label: "Decorations",
    note: "Going for a “storybook summer fête” — garden party, muted colors, cozy and nostalgic. Fabric bunting, gingham tablecloths, pastel balloons. Several people can collaborate.",
    kind: "standard",
    multi: true,
  },
  {
    id: "cleanup",
    label: "Clean-up crew",
    note: "The more the merrier!",
    kind: "standard",
    multi: true,
  },
];

export const BOOTH_IDS = BOOTHS.map((b) => b.id);

export function getBooth(id: string): Booth | undefined {
  return BOOTHS.find((b) => b.id === id);
}

export type CarnivalSignup = {
  id: string;
  created_at: string;
  booth: string;
  name: string;
  phone: string;
  cookie_count: number | null;
  own_prizes: boolean;
  notes: string | null;
};
