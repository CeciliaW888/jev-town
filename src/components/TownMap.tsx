import type { Action } from "@shared/actions.ts";
import { CITIZENS, type Citizen } from "@shared/citizens.ts";
import type { Point } from "@shared/positions.ts";
import { PLACES, ROADS, getPlace } from "@shared/town.ts";
import { CitizenSprite } from "./CitizenSprite.tsx";

export interface TownMapProps {
  positions: Map<number, Point>;
  durations: Map<number, number>;
  actions: Map<number, Action | null>;
  confidences: Map<number, number | null>;
  focusedAction: Action | null;
}

const KIND_LABEL: Record<string, string> = {
  plaza: "plaza",
  work: "building",
  home: "homes",
  landmark: "landmark",
};

export function TownMap({ positions, durations, actions, confidences, focusedAction }: TownMapProps) {
  return (
    <div className="town-map" role="group" aria-label="Town map with 24 citizens">
      <svg className="town-map__svg" viewBox="0 0 160 100" aria-hidden="true">
        <rect x={0} y={0} width={160} height={100} className="town-map__ground" />
        {ROADS.map(([fromId, toId]) => {
          const from = getPlace(fromId);
          const to = getPlace(toId);
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="town-map__road"
            />
          );
        })}
        {PLACES.map((place) => (
          <g key={place.id} className={`town-map__place town-map__place--${place.kind}`}>
            {place.kind === "plaza" ? (
              <circle cx={place.x} cy={place.y} r={9} className="town-map__building" />
            ) : place.kind === "landmark" ? (
              <polygon
                points={`${place.x},${place.y - 8} ${place.x - 6},${place.y + 6} ${place.x + 6},${place.y + 6}`}
                className="town-map__building"
              />
            ) : (
              <rect
                x={place.x - 6}
                y={place.y - 5}
                width={12}
                height={10}
                rx={1.6}
                className="town-map__building"
              />
            )}
            <text x={place.x} y={place.y + (place.kind === "landmark" ? 12 : 10)} className="town-map__label">
              {place.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="town-map__citizens">
        {CITIZENS.map((citizen: Citizen) => {
          const action = actions.get(citizen.id) ?? null;
          return (
            <CitizenSprite
              key={citizen.id}
              citizen={citizen}
              position={positions.get(citizen.id) ?? { x: 80, y: 50 }}
              durationMs={durations.get(citizen.id) ?? 900}
              action={action}
              confidence={confidences.get(citizen.id) ?? null}
              highlighted={focusedAction !== null && action === focusedAction}
            />
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {`Town map. ${PLACES.length} locations, ${KIND_LABEL.work} workplaces and ${KIND_LABEL.home} home clusters, connected by roads.`}
      </p>
    </div>
  );
}
