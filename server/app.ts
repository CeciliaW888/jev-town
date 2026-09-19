import express, { type NextFunction, type Request, type Response } from "express";
import { CITIZENS } from "../shared/citizens.ts";
import {
  broadcastRequestSchema,
  formatIssues,
  type BroadcastResponse,
  type StatusResponse,
} from "../shared/protocol.ts";
import { mapAnswersToDecisions } from "../shared/decisions.ts";
import { askJev, JevRequestError, loadJevConfig, type JevConfig } from "./jevClient.ts";
import { simulateAllDecisions, simulateFallback } from "./simulation.ts";

export interface CreateAppOptions {
  /** Injected for tests; defaults to reading TYPESAFE_API_KEY from process.env. */
  jevConfig?: JevConfig | null;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(express.json({ limit: "32kb" }));

  const jevConfig = options.jevConfig !== undefined ? options.jevConfig : loadJevConfig();

  app.get("/api/status", (_req: Request, res: Response<StatusResponse>) => {
    res.json({
      jevConfigured: jevConfig !== null,
      model: jevConfig?.model ?? "local-simulation",
      citizenCount: CITIZENS.length,
    });
  });

  app.post("/api/broadcast", async (req: Request, res: Response<BroadcastResponse | { error: string; details?: string[] }>) => {
    const parsed = broadcastRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ error: "Invalid broadcast request", details: formatIssues(parsed.error) });
      return;
    }

    const { broadcast, round, unrest, history, citizens } = parsed.data;
    const citizenIds = citizens.map((c) => c.id);
    const started = performance.now();

    if (!jevConfig) {
      const decisions = simulateAllDecisions(broadcast, round);
      res.json({
        mode: "simulation",
        reason: "TYPESAFE_API_KEY is not configured on the server.",
        latencyMs: Math.round(performance.now() - started),
        filledLocally: decisions.length,
        decisions,
      });
      return;
    }

    try {
      const lastActions = new Map(citizens.map((c) => [c.id, c.lastAction]));
      const result = await askJev(jevConfig, { broadcast, round, unrest, history, lastActions });

      const { decisions, filledLocally } = mapAnswersToDecisions(
        citizenIds,
        result.answers,
        (citizenId) => simulateFallback(citizenId, broadcast, round),
      );

      res.json({
        mode: "jev",
        model: result.model,
        latencyMs: Math.round(performance.now() - started),
        filledLocally: filledLocally.length,
        ...(result.usage ? { usage: result.usage } : {}),
        decisions,
      });
    } catch (err) {
      const message = err instanceof JevRequestError ? err.message : "Unexpected error contacting Jev.";
      // Never log request/response bodies here: they could echo back the Authorization header context.
      console.error(`[jev] falling back to simulation: ${message}`);

      const decisions = simulateAllDecisions(broadcast, round);
      res.json({
        mode: "simulation",
        reason: message,
        latencyMs: Math.round(performance.now() - started),
        filledLocally: decisions.length,
        decisions,
      });
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[server] unhandled error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
