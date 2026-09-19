import type { Action } from "./actions.ts";
import type { PlaceId } from "./town.ts";

export interface Citizen {
  /** Stable 1-based id. Also encoded in the Jev question id (`citizen_07`). */
  id: number;
  name: string;
  role: string;
  /** One sentence of character, sent to the model verbatim. */
  personality: string;
  homeId: PlaceId;
  workId: PlaceId;
  /** Colour band for the sprite, 0-5. */
  palette: number;
  /**
   * Baseline temperament, only used by the offline simulation fallback so that
   * it still feels like these particular people. Real rounds ignore it entirely.
   */
  leaning: Partial<Record<Action, number>>;
}

export const CITIZENS: readonly Citizen[] = [
  {
    id: 1,
    name: "Mira Dell",
    role: "Apothecary",
    personality:
      "Cautious to a fault. Reads every warning label twice and assumes an announcement is understating the danger.",
    homeId: "cottage_north",
    workId: "clinic",
    palette: 0,
    leaning: { FLEE: 1.1, WARN: 0.6 },
  },
  {
    id: 2,
    name: "Tobias Kell",
    role: "Baker",
    personality:
      "Generous and incurably nosy. He is usually the first person in town to have heard a thing, and he likes it that way.",
    homeId: "cottage_north",
    workId: "bakery",
    palette: 1,
    leaning: { INVESTIGATE: 1.2, WARN: 0.8 },
  },
  {
    id: 3,
    name: "Ansel Crow",
    role: "Watchman",
    personality:
      "Duty-bound and deeply suspicious of theatrics. He distrusts anything announced loudly and would rather verify it himself.",
    homeId: "cottage_hill",
    workId: "watchtower",
    palette: 2,
    leaning: { INVESTIGATE: 1.4, IGNORE: 0.3 },
  },
  {
    id: 4,
    name: "Perrin Vask",
    role: "Dockhand",
    personality:
      "Unflappable. He has been in two shipwrecks and a fire, and very little said over a loudspeaker impresses him.",
    homeId: "cottage_quay",
    workId: "docks",
    palette: 3,
    leaning: { IGNORE: 1.5 },
  },
  {
    id: 5,
    name: "Odile Mane",
    role: "Librarian",
    personality:
      "Sceptical and precise. She wants a source before she wants an opinion, and dismisses claims with no evidence behind them.",
    homeId: "cottage_east",
    workId: "library",
    palette: 4,
    leaning: { IGNORE: 1.1, INVESTIGATE: 0.9 },
  },
  {
    id: 6,
    name: "Hugo Brandt",
    role: "Blacksmith",
    personality:
      "Stubborn and loud about it. Interrupting him mid-weld is a bigger emergency to him than most emergencies.",
    homeId: "cottage_green",
    workId: "forge",
    palette: 5,
    leaning: { IGNORE: 1.6 },
  },
  {
    id: 7,
    name: "Sela Quint",
    role: "Schoolteacher",
    personality:
      "Fiercely protective. With thirty children in her care she moves the instant anything might reach them.",
    homeId: "cottage_west",
    workId: "school",
    palette: 0,
    leaning: { WARN: 1.3, FLEE: 0.9 },
  },
  {
    id: 8,
    name: "Rook Halloway",
    role: "Tavern keeper",
    personality:
      "Frankly opportunistic. A crowd is a crowd and a crowd is money, whatever it has gathered for.",
    homeId: "cottage_south",
    workId: "tavern",
    palette: 1,
    leaning: { JOIN: 1.5 },
  },
  {
    id: 9,
    name: "Ivy Marsh",
    role: "Farmhand",
    personality:
      "Practical and unsentimental. She distrusts town gossip on principle and the goats do not feed themselves.",
    homeId: "cottage_lane",
    workId: "farm",
    palette: 2,
    leaning: { IGNORE: 1.3 },
  },
  {
    id: 10,
    name: "Dr. Neve Alder",
    role: "Physician",
    personality:
      "Calm under pressure. She triages everything, including announcements, and goes where she would be most useful.",
    homeId: "cottage_east",
    workId: "clinic",
    palette: 3,
    leaning: { INVESTIGATE: 1.1, JOIN: 0.7 },
  },
  {
    id: 11,
    name: "Barnaby Twill",
    role: "Market trader",
    personality:
      "Openly greedy and quick on his feet. Any hint of a bargain, a shortage or a free thing pulls him like a magnet.",
    homeId: "cottage_hill",
    workId: "market",
    palette: 4,
    leaning: { JOIN: 1.6 },
  },
  {
    id: 12,
    name: "Cyra Lune",
    role: "Fishmonger",
    personality:
      "Extremely loud. She repeats news faster and less accurately than the weather, and enjoys being the one to tell you.",
    homeId: "cottage_quay",
    workId: "docks",
    palette: 5,
    leaning: { WARN: 1.5 },
  },
  {
    id: 13,
    name: "Elias Fen",
    role: "Clockmaker",
    personality:
      "Precise and allergic to chaos. Disorder physically pains him, and he retreats from it rather than join it.",
    homeId: "cottage_hill",
    workId: "watchtower",
    palette: 0,
    leaning: { FLEE: 1.0, IGNORE: 0.8 },
  },
  {
    id: 14,
    name: "Juno Rell",
    role: "Courier",
    personality:
      "Restless and always already running. Standing still is the one reaction that does not occur to her.",
    homeId: "cottage_south",
    workId: "plaza",
    palette: 1,
    leaning: { INVESTIGATE: 1.2, WARN: 1.0 },
  },
  {
    id: 15,
    name: "Marta Vane",
    role: "Chapel warden",
    personality:
      "Devout and steady. Her instinct is to go to frightened people and stay with them rather than run anywhere.",
    homeId: "cottage_north",
    workId: "chapel",
    palette: 2,
    leaning: { JOIN: 0.9, INVESTIGATE: 0.8 },
  },
  {
    id: 16,
    name: "Ossian Grey",
    role: "Poet",
    personality:
      "Ironic and detached. He treats every emergency as material for a poem and rarely as a reason to move.",
    homeId: "cottage_west",
    workId: "tavern",
    palette: 3,
    leaning: { IGNORE: 1.4, INVESTIGATE: 0.6 },
  },
  {
    id: 17,
    name: "Delphine Roux",
    role: "Herbalist",
    personality:
      "Deeply superstitious. She reads omens into ordinary events and takes any warning completely literally.",
    homeId: "cottage_lane",
    workId: "market",
    palette: 4,
    leaning: { FLEE: 1.4 },
  },
  {
    id: 18,
    name: "Gideon Pike",
    role: "Constable",
    personality:
      "Authoritative and procedural. He believes nothing should be acted on before it has been confirmed by him.",
    homeId: "cottage_green",
    workId: "watchtower",
    palette: 5,
    leaning: { INVESTIGATE: 1.5 },
  },
  {
    id: 19,
    name: "Wren Abbott",
    role: "Student, age nine",
    personality:
      "Curious, fearless and terrible at staying put. If something is happening, she is going to be in the middle of it.",
    homeId: "cottage_west",
    workId: "school",
    palette: 0,
    leaning: { JOIN: 1.4, INVESTIGATE: 0.9 },
  },
  {
    id: 20,
    name: "Silas Thorne",
    role: "Miller",
    personality:
      "A grumpy hermit who moved out here specifically to avoid the town and everyone announcing things in it.",
    homeId: "cottage_lane",
    workId: "farm",
    palette: 1,
    leaning: { IGNORE: 1.9 },
  },
  {
    id: 21,
    name: "Faye Nolan",
    role: "Nurse",
    personality:
      "Empathetic and fast. She runs toward trouble by reflex and worries about the details once she is there.",
    homeId: "cottage_south",
    workId: "clinic",
    palette: 2,
    leaning: { JOIN: 1.1, INVESTIGATE: 0.9 },
  },
  {
    id: 22,
    name: "Corin Ash",
    role: "Glassblower",
    personality:
      "Anxious and catastrophising. He assumes the worst available reading of any sentence and plans around it.",
    homeId: "cottage_green",
    workId: "forge",
    palette: 3,
    leaning: { FLEE: 1.6 },
  },
  {
    id: 23,
    name: "Petra Solis",
    role: "Merchant captain",
    personality:
      "Decisive and territorial. Her cargo comes first, and she will secure it before she considers anyone else's crisis.",
    homeId: "cottage_quay",
    workId: "docks",
    palette: 4,
    leaning: { FLEE: 0.9, IGNORE: 0.9 },
  },
  {
    id: 24,
    name: "Bram Oakley",
    role: "Gardener",
    personality:
      "Gentle and extremely slow to move. He loves the fountain and is reluctant to be anywhere that is not near it.",
    homeId: "cottage_south",
    workId: "plaza",
    palette: 5,
    leaning: { IGNORE: 1.2, JOIN: 0.7 },
  },
];

export const CITIZEN_COUNT = CITIZENS.length;

const BY_ID = new Map(CITIZENS.map((c) => [c.id, c]));

export function getCitizen(id: number): Citizen | undefined {
  return BY_ID.get(id);
}

/** `citizen_07` - zero padded so question ids sort naturally in logs. */
export function questionIdFor(citizenId: number): string {
  return `citizen_${String(citizenId).padStart(2, "0")}`;
}

/** Inverse of {@link questionIdFor}. Returns null for anything unrecognised. */
export function citizenIdFromQuestionId(questionId: string): number | null {
  const match = /^citizen_(\d{1,3})$/.exec(questionId);
  if (!match) return null;
  const id = Number(match[1]);
  return BY_ID.has(id) ? id : null;
}
