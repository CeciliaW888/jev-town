import type { Action } from "./actions.ts";
import type { Citizen } from "./citizens.ts";
import { getPlace } from "./town.ts";

export interface Point {
  x: number;
  y: number;
}

/**
 * Small deterministic offset per citizen so a crowd at one building reads as a
 * cluster of people instead of one sprite stacked twenty-four deep.
 */
function scatter(seed: number, radius: number): Point {
  const angle = (seed * 137.508 * Math.PI) / 180; // golden-angle spiral
  const r = radius * Math.sqrt(((seed * 37) % 31) / 31);
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.62 };
}

/** Where a citizen stands while nothing is happening: at their workplace. */
export function postPosition(citizen: Citizen): Point {
  const place = getPlace(citizen.workId);
  const offset = scatter(citizen.id * 3 + 1, 7);
  return { x: place.x + offset.x, y: place.y + offset.y };
}

/**
 * Where a reaction sends someone. Each of the five actions has its own visually
 * distinct destination, so the shape of the crowd tells you the outcome before
 * you read a single number.
 */
export function destinationFor(citizen: Citizen, action: Action): Point {
  const plaza = getPlace("plaza");

  switch (action) {
    case "IGNORE":
      return postPosition(citizen);

    case "JOIN": {
      // Tight knot in the middle of the plaza.
      const offset = scatter(citizen.id * 7 + 3, 6);
      return { x: plaza.x + offset.x, y: plaza.y + offset.y };
    }

    case "INVESTIGATE": {
      // Cautious ring around the plaza, facing in.
      const angle = (citizen.id * 137.508 * Math.PI) / 180;
      return {
        x: plaza.x + Math.cos(angle) * 17,
        y: plaza.y + Math.sin(angle) * 11,
      };
    }

    case "FLEE": {
      const home = getPlace(citizen.homeId);
      const offset = scatter(citizen.id * 11 + 5, 6);
      return { x: home.x + offset.x, y: home.y + offset.y };
    }

    case "WARN": {
      const tower = getPlace("watchtower");
      const offset = scatter(citizen.id * 13 + 7, 9);
      return { x: tower.x + offset.x, y: tower.y + offset.y + 4 };
    }
  }
}

/** Travel time in ms, so distant citizens visibly take longer to arrive. */
export function travelDurationMs(from: Point, to: Point): number {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.round(Math.min(2600, 420 + distance * 22));
}
