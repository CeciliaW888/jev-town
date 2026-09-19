/**
 * The map. Everything - the SVG scene, the citizen sprites and the destinations
 * each reaction sends people to - is derived from these coordinates, which live in
 * a 160 x 100 design space.
 */

export const MAP_W = 160;
export const MAP_H = 100;

export type PlaceKind = "plaza" | "work" | "home" | "landmark";

export interface Place {
  id: string;
  label: string;
  kind: PlaceKind;
  x: number;
  y: number;
}

export const PLACES = [
  { id: "plaza", label: "Fountain Plaza", kind: "plaza", x: 80, y: 52 },
  { id: "watchtower", label: "Watchtower", kind: "landmark", x: 100, y: 14 },
  { id: "bakery", label: "Bakery", kind: "work", x: 44, y: 30 },
  { id: "market", label: "Market", kind: "work", x: 80, y: 24 },
  { id: "clinic", label: "Clinic", kind: "work", x: 118, y: 30 },
  { id: "library", label: "Library", kind: "work", x: 134, y: 56 },
  { id: "forge", label: "Forge", kind: "work", x: 112, y: 76 },
  { id: "docks", label: "Docks", kind: "work", x: 140, y: 86 },
  { id: "farm", label: "Farm", kind: "work", x: 24, y: 80 },
  { id: "tavern", label: "Tavern", kind: "work", x: 58, y: 72 },
  { id: "school", label: "School", kind: "work", x: 30, y: 52 },
  { id: "chapel", label: "Chapel", kind: "work", x: 52, y: 12 },
  { id: "cottage_north", label: "North Cottages", kind: "home", x: 14, y: 22 },
  { id: "cottage_west", label: "West Cottages", kind: "home", x: 10, y: 44 },
  { id: "cottage_lane", label: "Millers Lane", kind: "home", x: 16, y: 64 },
  { id: "cottage_south", label: "South Cottages", kind: "home", x: 44, y: 92 },
  { id: "cottage_green", label: "Green Row", kind: "home", x: 76, y: 90 },
  { id: "cottage_hill", label: "Hill Houses", kind: "home", x: 128, y: 12 },
  { id: "cottage_east", label: "East Cottages", kind: "home", x: 150, y: 40 },
  { id: "cottage_quay", label: "Quayside Rooms", kind: "home", x: 152, y: 70 },
] as const satisfies readonly Place[];

export type PlaceId = (typeof PLACES)[number]["id"];

const PLACE_BY_ID = new Map<string, Place>(PLACES.map((p) => [p.id, p]));

export function getPlace(id: PlaceId): Place {
  const place = PLACE_BY_ID.get(id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
}

/** Roads drawn on the map, as pairs of place ids. */
export const ROADS: ReadonlyArray<readonly [PlaceId, PlaceId]> = [
  ["plaza", "market"],
  ["plaza", "school"],
  ["plaza", "library"],
  ["plaza", "tavern"],
  ["plaza", "clinic"],
  ["market", "bakery"],
  ["market", "watchtower"],
  ["market", "chapel"],
  ["bakery", "chapel"],
  ["chapel", "cottage_north"],
  ["cottage_north", "cottage_west"],
  ["cottage_west", "school"],
  ["school", "cottage_lane"],
  ["cottage_lane", "farm"],
  ["farm", "cottage_south"],
  ["cottage_south", "tavern"],
  ["tavern", "cottage_green"],
  ["cottage_green", "forge"],
  ["forge", "docks"],
  ["docks", "cottage_quay"],
  ["cottage_quay", "library"],
  ["library", "cottage_east"],
  ["cottage_east", "clinic"],
  ["clinic", "watchtower"],
  ["watchtower", "cottage_hill"],
];
