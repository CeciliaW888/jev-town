import { memo } from "react";
import { ACTION_GLYPH, ACTION_LABEL, type Action } from "@shared/actions.ts";
import type { Citizen } from "@shared/citizens.ts";
import type { Point } from "@shared/positions.ts";

export interface CitizenSpriteProps {
  citizen: Citizen;
  position: Point;
  durationMs: number;
  action: Action | null;
  confidence: number | null;
  highlighted: boolean;
}

function CitizenSpriteImpl({ citizen, position, durationMs, action, confidence, highlighted }: CitizenSpriteProps) {
  const pct = confidence !== null ? Math.round(confidence * 100) : null;

  return (
    <button
      type="button"
      className={`citizen palette-${citizen.palette}${highlighted ? " citizen--highlighted" : ""}${
        action ? ` citizen--${action.toLowerCase()}` : ""
      }`}
      style={{
        left: `${(position.x / 160) * 100}%`,
        top: `${(position.y / 100) * 100}%`,
        transitionDuration: `${durationMs}ms`,
      }}
      aria-label={`${citizen.name}, ${citizen.role}. ${
        action ? `Last decision: ${ACTION_LABEL[action]}${pct !== null ? ` at ${pct}% confidence` : ""}.` : "Has not reacted yet."
      }`}
    >
      <span className="citizen__dot" aria-hidden="true" />
      {action ? (
        <span className="citizen__badge" aria-hidden="true">
          {ACTION_GLYPH[action]}
        </span>
      ) : null}
      <span className="citizen__tooltip" role="tooltip">
        <strong>{citizen.name}</strong>
        <span className="citizen__tooltip-role">{citizen.role}</span>
        <span className="citizen__tooltip-personality">{citizen.personality}</span>
        {action ? (
          <span className="citizen__tooltip-action">
            {ACTION_LABEL[action]}
            {pct !== null ? ` — ${pct}% confident` : ""}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export const CitizenSprite = memo(CitizenSpriteImpl);
