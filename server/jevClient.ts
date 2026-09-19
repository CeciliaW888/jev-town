import { ACTION_CRITERIA, ACTIONS } from "../shared/actions.ts";
import { CITIZENS, questionIdFor, type Citizen } from "../shared/citizens.ts";
import type { RawChoiceAnswer } from "../shared/decisions.ts";

const ENDPOINT_PATH = "/v1/systemone";
const DEFAULT_BASE_URL = "https://api.typesafe.ai";
const DEFAULT_MODEL = "jev-latest";
const DEFAULT_TIMEOUT_MS = 20_000;

export interface JevConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export function loadJevConfig(env: NodeJS.ProcessEnv = process.env): JevConfig | null {
  const apiKey = env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (env.TYPESAFE_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model: env.TYPESAFE_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs: Number(env.TYPESAFE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

interface CitizenPromptState {
  id: number;
  name: string;
  role: string;
  personality: string;
  home: string;
  work: string;
  lastAction: string | null;
}

export interface JevRoundState {
  broadcast: string;
  round: number;
  unrest: number;
  history: string[];
  /** Per-citizen last action, keyed by citizen id, for continuity across rounds. */
  lastActions: ReadonlyMap<number, string | null>;
}

function citizenState(citizen: Citizen, lastAction: string | null): CitizenPromptState {
  return {
    id: citizen.id,
    name: citizen.name,
    role: citizen.role,
    personality: citizen.personality,
    home: citizen.homeId,
    work: citizen.workId,
    lastAction,
  };
}

function buildRequestBody(config: JevConfig, input: JevRoundState) {
  const questions: Record<string, unknown> = {};

  for (const [index, citizen] of CITIZENS.entries()) {
    questions[questionIdFor(citizen.id)] = {
      type: "choice",
      instructions: [
        "The Town Crier just broadcast the announcement in `broadcast` to the whole town.",
        `Decide what the specific person in \`citizens[${index}]\` does in the next few seconds.`,
        "Use that citizen's role, personality, home, workplace and last action, together with `unrest` (0 calm, 100 chaos) and recent `history`.",
        "Answer in character for that person. Their personality should decide ambiguous cases.",
      ].join(" "),
      criteria: ACTION_CRITERIA,
    };
  }

  return {
    model: config.model,
    state: {
      broadcast: input.broadcast,
      round: input.round,
      unrest: input.unrest,
      history: input.history,
      citizens: CITIZENS.map((citizen) =>
        citizenState(citizen, input.lastActions.get(citizen.id) ?? null),
      ),
    },
    questions,
  };
}

export class JevRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "JevRequestError";
  }
}

export interface JevRoundResult {
  model: string;
  answers: Map<number, RawChoiceAnswer>;
  usage?: { inputTokens: number; outputTokens: number };
}

/**
 * Fires one batched Choice request covering all 24 citizens. Never logs the API
 * key or the raw Authorization header; only status codes and message text are
 * surfaced on failure.
 */
export async function askJev(config: JevConfig, input: JevRoundState): Promise<JevRoundResult> {
  const body = buildRequestBody(config, input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}${ENDPOINT_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new JevRequestError(`Jev request timed out after ${config.timeoutMs}ms`);
    }
    throw new JevRequestError(
      `Could not reach Jev: ${err instanceof Error ? err.message : "unknown network error"}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const label =
      response.status === 401
        ? "Jev rejected the API key"
        : response.status === 422
          ? "Jev rejected the request shape"
          : response.status === 429
            ? "Jev rate limit exceeded"
            : response.status === 529
              ? "Jev is overloaded"
              : "Jev request failed";
    throw new JevRequestError(`${label} (HTTP ${response.status})`, response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new JevRequestError("Jev returned a response that was not valid JSON");
  }

  return parseJevPayload(payload);
}

function parseJevPayload(payload: unknown): JevRoundResult {
  if (typeof payload !== "object" || payload === null) {
    throw new JevRequestError("Jev response was not a JSON object");
  }

  const record = payload as Record<string, unknown>;
  const answersRaw = record.answers;
  if (typeof answersRaw !== "object" || answersRaw === null) {
    throw new JevRequestError("Jev response had no `answers` field");
  }

  const answers = new Map<number, RawChoiceAnswer>();
  for (const [questionId, answer] of Object.entries(answersRaw as Record<string, unknown>)) {
    const match = /^citizen_(\d{1,3})$/.exec(questionId);
    if (!match) continue;
    const citizenId = Number(match[1]);
    if (Number.isNaN(citizenId)) continue;
    answers.set(citizenId, answer as RawChoiceAnswer);
  }

  const usageRaw = record.usage;
  const usage =
    typeof usageRaw === "object" && usageRaw !== null
      ? {
          inputTokens: Number((usageRaw as Record<string, unknown>).input_tokens) || 0,
          outputTokens: Number((usageRaw as Record<string, unknown>).output_tokens) || 0,
        }
      : undefined;

  return {
    model: typeof record.model === "string" ? record.model : "jev",
    answers,
    ...(usage ? { usage } : {}),
  };
}

/** Exposed for tests only: confirms the exact option set sent to Jev never drifts. */
export const __testables = { buildRequestBody, ACTIONS };
