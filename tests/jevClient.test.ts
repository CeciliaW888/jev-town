import { describe, expect, it } from "vitest";
import { ACTION_CRITERIA, ACTIONS } from "../shared/actions.ts";
import { CITIZEN_COUNT, questionIdFor } from "../shared/citizens.ts";
import { __testables, loadJevConfig } from "../server/jevClient.ts";

describe("loadJevConfig", () => {
  it("returns null when TYPESAFE_API_KEY is unset or blank", () => {
    expect(loadJevConfig({})).toBeNull();
    expect(loadJevConfig({ TYPESAFE_API_KEY: "   " })).toBeNull();
  });

  it("reads the key and applies documented defaults", () => {
    const config = loadJevConfig({ TYPESAFE_API_KEY: "secret-value" });
    expect(config).not.toBeNull();
    expect(config!.apiKey).toBe("secret-value");
    expect(config!.model).toBe("jev-latest");
    expect(config!.baseUrl).toBe("https://api.typesafe.ai");
    expect(config!.timeoutMs).toBe(20_000);
  });

  it("honors overrides and strips a trailing slash from the base URL", () => {
    const config = loadJevConfig({
      TYPESAFE_API_KEY: "k",
      TYPESAFE_MODEL: "jev-preview",
      TYPESAFE_BASE_URL: "https://custom.example/",
      TYPESAFE_TIMEOUT_MS: "5000",
    });
    expect(config!.model).toBe("jev-preview");
    expect(config!.baseUrl).toBe("https://custom.example");
    expect(config!.timeoutMs).toBe(5000);
  });
});

describe("buildRequestBody", () => {
  const config = { apiKey: "k", baseUrl: "https://api.typesafe.ai", model: "jev-latest", timeoutMs: 1000 };

  it("batches exactly one Choice question per citizen, all in a single request", () => {
    const body = __testables.buildRequestBody(config, {
      broadcast: "Free bread at the bakery!",
      round: 2,
      unrest: 15,
      history: ["Round 1: a fire drill."],
      lastActions: new Map(),
    }) as { model: string; state: unknown; questions: Record<string, unknown> };

    expect(body.model).toBe("jev-latest");
    const questionIds = Object.keys(body.questions);
    expect(questionIds).toHaveLength(CITIZEN_COUNT);
    expect(questionIds).toContain(questionIdFor(1));
    expect(questionIds).toContain(questionIdFor(CITIZEN_COUNT));

    for (const id of questionIds) {
      const question = body.questions[id] as { type: string; criteria: Record<string, unknown> };
      expect(question.type).toBe("choice");
      expect(Object.keys(question.criteria).sort()).toEqual([...ACTIONS].sort());
    }
  });

  it("uses the exact five documented action names as criteria keys everywhere", () => {
    expect(Object.keys(ACTION_CRITERIA).sort()).toEqual(["FLEE", "IGNORE", "INVESTIGATE", "JOIN", "WARN"]);
  });

  it("carries the broadcast, round and unrest into state", () => {
    const body = __testables.buildRequestBody(config, {
      broadcast: "hello town",
      round: 7,
      unrest: 33,
      history: [],
      lastActions: new Map(),
    }) as { state: { broadcast: string; round: number; unrest: number; citizens: unknown[] } };

    expect(body.state.broadcast).toBe("hello town");
    expect(body.state.round).toBe(7);
    expect(body.state.unrest).toBe(33);
    expect(body.state.citizens).toHaveLength(CITIZEN_COUNT);
  });
});
