import type { Action } from "@shared/actions.ts";
import {
  broadcastResponseSchema,
  statusResponseSchema,
  type BroadcastResponse,
  type StatusResponse,
} from "@shared/protocol.ts";
import { simulateAllDecisions } from "@shared/simulation.ts";

const IS_STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";

export async function fetchStatus(): Promise<StatusResponse> {
  if (IS_STATIC_DEMO) {
    return { jevConfigured: false, model: "static-simulation", citizenCount: 24 };
  }

  const res = await fetch("/api/status");
  if (!res.ok) throw new Error(`Status check failed (HTTP ${res.status})`);
  return statusResponseSchema.parse(await res.json());
}

export interface BroadcastPayload {
  broadcast: string;
  round: number;
  unrest: number;
  history: string[];
  citizens: { id: number; lastAction: Action | null }[];
}

export async function postBroadcast(payload: BroadcastPayload): Promise<BroadcastResponse> {
  if (IS_STATIC_DEMO) {
    const started = performance.now();
    const decisions = simulateAllDecisions(payload.broadcast, payload.round);
    return {
      mode: "simulation",
      reason: "GitHub Pages cannot keep API keys secret, so this public version uses the local simulation.",
      latencyMs: Math.round(performance.now() - started),
      filledLocally: decisions.length,
      decisions,
    };
  }

  const res = await fetch("/api/broadcast", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = `Broadcast failed (HTTP ${res.status})`;
    try {
      const body: unknown = await res.json();
      if (typeof body === "object" && body !== null && typeof (body as Record<string, unknown>).error === "string") {
        message = (body as Record<string, unknown>).error as string;
      }
    } catch {
      // Response body wasn't JSON; fall back to the generic message above.
    }
    throw new Error(message);
  }

  return broadcastResponseSchema.parse(await res.json());
}
