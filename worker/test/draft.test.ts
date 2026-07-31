import { describe, expect, it, vi } from "vitest";
import { DRAFT_SEQUENCE, createDraftSchema, hashToken } from "../src/draft";
import { handleRequest } from "../src/index";
import type { Env } from "../src/types";

describe("draft engine", () => {
  it("usa la sequenza competitiva completa", () => {
    expect(DRAFT_SEQUENCE).toHaveLength(20);
    expect(
      DRAFT_SEQUENCE.filter(
        (turn) => turn.team === "blue" && turn.kind === "pick",
      ),
    ).toHaveLength(5);
    expect(
      DRAFT_SEQUENCE.filter(
        (turn) => turn.team === "red" && turn.kind === "pick",
      ),
    ).toHaveLength(5);
    expect(DRAFT_SEQUENCE.filter((turn) => turn.kind === "ban")).toHaveLength(
      10,
    );
  });

  it("valida nomi squadra e timer", () => {
    expect(
      createDraftSchema.safeParse({
        blueTeam: "RYN",
        redTeam: "Opponent",
        timerSeconds: 45,
      }).success,
    ).toBe(true);
    expect(
      createDraftSchema.safeParse({
        blueTeam: "R",
        redTeam: "Opponent",
        timerSeconds: 5,
      }).success,
    ).toBe(false);
  });

  it("genera una lobby con token separati e memorizzati come hash", async () => {
    let storedLobby: Record<string, unknown> | null = null;
    const room = {
      fetch: vi.fn(async (_url: string, init: RequestInit) => {
        storedLobby = JSON.parse(String(init.body)) as Record<string, unknown>;
        return Response.json({ ok: true }, { status: 201 });
      }),
    };
    const namespace = {
      idFromName: vi.fn((name: string) => name),
      get: vi.fn(() => room),
    } as unknown as DurableObjectNamespace;
    const env: Env = {
      DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
      TURNSTILE_SECRET_KEY: "secret",
      TURNSTILE_HOSTNAMES: "localhost",
      ALLOWED_ORIGINS: "http://localhost:5173",
      DRAFT_ROOMS: namespace,
    };

    const response = await handleRequest(
      new Request("https://worker.example.com/drafts", {
        method: "POST",
        headers: {
          Origin: "http://localhost:5173",
          "Content-Type": "application/json",
          "CF-Connecting-IP": crypto.randomUUID(),
        },
        body: JSON.stringify({
          blueTeam: "RYN",
          redTeam: "Opponent",
          timerSeconds: 45,
        }),
      }),
      env,
    );

    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      success: boolean;
      tokens: Record<string, string>;
    };
    expect(body.success).toBe(true);
    expect(new Set(Object.values(body.tokens)).size).toBe(4);
    expect(storedLobby).not.toBeNull();

    const hashes = (
      storedLobby as unknown as { roleHashes: Record<string, string> }
    ).roleHashes;
    expect(Object.values(hashes)).not.toContain(body.tokens.blue);
    expect(hashes.blue).toBe(await hashToken(body.tokens.blue));
  });
});
