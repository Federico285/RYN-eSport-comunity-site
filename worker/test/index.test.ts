import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleRequest } from "../src/index";
import type { Env } from "../src/types";

const env: Env = {
  DISCORD_WEBHOOK_URL: "https://discord.com/api/webhooks/test",
  TURNSTILE_SECRET_KEY: "secret",
  TURNSTILE_HOSTNAMES: "localhost",
  ALLOWED_ORIGINS: "http://localhost:5173",
  DRAFT_ROOMS: {} as DurableObjectNamespace,
};

const validPayload = {
  riotId: "MarioRossi",
  riotTag: "EUW",
  discordUsername: "mariorossi",
  positionId: "community-moderator",
  age: 21,
  confirmsMinimumAge: true,
  experience:
    "Ho gestito community Discord gaming per diversi mesi con turni di moderazione.",
  motivation:
    "Vorrei aiutare RYN a crescere con eventi ordinati e una community accogliente.",
  weeklyAvailability: "Tre sere a settimana",
  opggUrl: "https://www.op.gg/summoners/euw/MarioRossi-EUW",
  privacyConsent: true,
  website: "",
  turnstileToken: "token",
};

function request(body: unknown, init: RequestInit = {}) {
  return new Request("https://worker.example.com/apply", {
    method: "POST",
    headers: {
      Origin: "http://localhost:5173",
      "Content-Type": "application/json",
      "CF-Connecting-IP": crypto.randomUUID(),
      ...init.headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

function mockExternal(
  turnstileSuccess = true,
  discordSuccess = true,
  turnstileOverrides: Record<string, unknown> = {},
) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("siteverify")) {
        return Response.json({
          success: turnstileSuccess,
          hostname: "localhost",
          action: "application",
          ...turnstileOverrides,
        });
      }
      return new Response(null, { status: discordSuccess ? 204 : 500 });
    }),
  );
}

describe("worker /apply", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("accetta una richiesta valida", async () => {
    mockExternal();
    const response = await handleRequest(request(validPayload), env);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it("rifiuta JSON non valido", async () => {
    mockExternal();
    const response = await handleRequest(request("{", { body: "{" }), env);
    expect(response.status).toBe(400);
  });

  it("rifiuta campo obbligatorio mancante", async () => {
    mockExternal();
    const payload = { ...validPayload };
    delete (payload as Partial<typeof validPayload>).riotId;
    const response = await handleRequest(request(payload), env);
    expect(response.status).toBe(400);
  });

  it("accetta esperienza e motivazione vuote", async () => {
    mockExternal();
    const response = await handleRequest(
      request({ ...validPayload, experience: "", motivation: "" }),
      env,
    );
    expect(response.status).toBe(200);
  });

  it("rifiuta un link esterno a OP.GG", async () => {
    mockExternal();
    const response = await handleRequest(
      request({ ...validPayload, opggUrl: "https://example.com/player" }),
      env,
    );
    expect(response.status).toBe(400);
  });

  it("rifiuta honeypot compilato", async () => {
    mockExternal();
    const response = await handleRequest(
      request({ ...validPayload, website: "bot" }),
      env,
    );
    expect(response.status).toBe(400);
  });

  it("rifiuta origine non autorizzata", async () => {
    mockExternal();
    const response = await handleRequest(
      request(validPayload, {
        headers: {
          Origin: "https://evil.example",
          "Content-Type": "application/json",
        },
      }),
      env,
    );
    expect(response.status).toBe(403);
  });

  it("rifiuta Turnstile fallito", async () => {
    mockExternal(false);
    const response = await handleRequest(request(validPayload), env);
    expect(response.status).toBe(403);
  });

  it("rifiuta un token Turnstile generato per un'altra azione", async () => {
    mockExternal(true, true, { action: "login" });
    const response = await handleRequest(request(validPayload), env);
    expect(response.status).toBe(403);
  });

  it("rifiuta un token Turnstile generato su un altro hostname", async () => {
    mockExternal(true, true, { hostname: "evil.example" });
    const response = await handleRequest(request(validPayload), env);
    expect(response.status).toBe(403);
  });

  it("gestisce Discord fallito", async () => {
    mockExternal(true, false);
    const response = await handleRequest(request(validPayload), env);
    expect(response.status).toBe(502);
  });

  it("rifiuta metodo non consentito", async () => {
    mockExternal();
    const response = await handleRequest(
      request(validPayload, { method: "GET", body: undefined }),
      env,
    );
    expect(response.status).toBe(405);
  });

  it("rifiuta payload troppo grande", async () => {
    mockExternal();
    const response = await handleRequest(
      request("x".repeat(25 * 1024), {
        headers: {
          Origin: "http://localhost:5173",
          "Content-Type": "application/json",
          "Content-Length": String(25 * 1024),
        },
      }),
      env,
    );
    expect(response.status).toBe(413);
  });
});
