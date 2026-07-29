import { sendApplicationToDiscord } from "./discord";
import {
  createDraftSchema,
  DraftRoom,
  hashToken,
  randomToken,
  type DraftLobby,
  type DraftRole,
} from "./draft";
import { verifyTurnstile } from "./turnstile";
import type { ApiResponse, Env } from "./types";
import { applicationSchema } from "./validation";

const MAX_BODY_BYTES = 24 * 1024;
const localRateLimit = new Map<string, { count: number; resetAt: number }>();

function json(
  data: ApiResponse | { status: "ok" } | Record<string, unknown>,
  status: number,
  origin?: string,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigin(request: Request, env: Env): string | undefined {
  const origin = request.headers.get("Origin");
  if (!origin) return undefined;
  return allowedOrigins(env).includes(origin) ? origin : undefined;
}

async function isRateLimited(request: Request, env: Env): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const key = ip.toLowerCase();

  if (env.RATE_LIMITER) {
    const result = await env.RATE_LIMITER.limit({ key });
    return !result.success;
  }

  const now = Date.now();
  const current = localRateLimit.get(key);
  if (!current || current.resetAt < now) {
    localRateLimit.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function parseJsonBody(
  request: Request,
): Promise<unknown | "too-large" | "invalid"> {
  const length = Number(request.headers.get("Content-Length") || "0");
  if (length > MAX_BODY_BYTES) return "too-large";

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES)
    return "too-large";

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return "invalid";
  }
}

async function createDraft(request: Request, env: Env, origin: string) {
  if (await isRateLimited(request, env)) {
    return json(
      { success: false, error: "Troppe lobby create. Riprova tra poco." },
      429,
      origin,
    );
  }

  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ success: false, error: "Richiesta non valida" }, 400, origin);
  }

  const body = await parseJsonBody(request);
  if (body === "too-large") {
    return json(
      { success: false, error: "Richiesta troppo grande" },
      413,
      origin,
    );
  }
  if (body === "invalid") {
    return json({ success: false, error: "JSON non valido" }, 400, origin);
  }

  const parsed = createDraftSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { success: false, error: "Controlla i dati della lobby" },
      400,
      origin,
    );
  }

  const roomId = randomToken(9);
  const roles: DraftRole[] = ["blue", "red", "spectator", "admin"];
  const roleTokens = Object.fromEntries(
    roles.map((role) => [role, randomToken()]),
  ) as Record<DraftRole, string>;
  const roleHashes = Object.fromEntries(
    await Promise.all(
      roles.map(
        async (role) => [role, await hashToken(roleTokens[role])] as const,
      ),
    ),
  ) as Record<DraftRole, string>;

  const lobby: DraftLobby = {
    roomId,
    ...parsed.data,
    status: "lobby",
    ready: { blue: false, red: false },
    actions: [],
    deadline: null,
    pausedReason: null,
    version: 0,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    roleHashes,
  };

  const room = env.DRAFT_ROOMS.get(env.DRAFT_ROOMS.idFromName(roomId));
  const initialized = await room.fetch("https://draft.internal/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lobby),
  });
  if (!initialized.ok) {
    return json(
      { success: false, error: "Impossibile creare la lobby" },
      502,
      origin,
    );
  }

  return json({ success: true, roomId, tokens: roleTokens }, 201, origin);
}

function applicationId(): string {
  return crypto.randomUUID();
}

export async function handleRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    const origin = getAllowedOrigin(request, env);
    return origin
      ? new Response(null, { status: 204, headers: corsHeaders(origin) })
      : new Response(null, { status: 403 });
  }

  if (url.pathname === "/health" && request.method === "GET") {
    return json({ status: "ok" }, 200);
  }

  if (url.pathname === "/drafts" && request.method === "POST") {
    const origin = getAllowedOrigin(request, env);
    if (!origin) {
      return json({ success: false, error: "Origine non autorizzata" }, 403);
    }
    return createDraft(request, env, origin);
  }

  const draftSocketMatch = url.pathname.match(
    /^\/drafts\/([A-Za-z0-9_-]{8,32})\/socket$/,
  );
  if (draftSocketMatch && request.method === "GET") {
    const origin = getAllowedOrigin(request, env);
    if (!origin) {
      return new Response("Origine non autorizzata", { status: 403 });
    }
    const room = env.DRAFT_ROOMS.get(
      env.DRAFT_ROOMS.idFromName(draftSocketMatch[1]),
    );
    return room.fetch(new Request("https://draft.internal/socket", request));
  }

  if (url.pathname !== "/apply") {
    return json({ success: false, error: "Endpoint non trovato" }, 404);
  }

  const origin = getAllowedOrigin(request, env);
  if (!origin) {
    return json({ success: false, error: "Origine non autorizzata" }, 403);
  }

  if (request.method !== "POST") {
    return json(
      { success: false, error: "Metodo non consentito" },
      405,
      origin,
    );
  }

  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ success: false, error: "Richiesta non valida" }, 400, origin);
  }

  if (await isRateLimited(request, env)) {
    return json(
      { success: false, error: "Troppe richieste. Riprova tra poco." },
      429,
      origin,
    );
  }

  const body = await parseJsonBody(request);
  if (body === "too-large")
    return json(
      { success: false, error: "Richiesta troppo grande" },
      413,
      origin,
    );
  if (body === "invalid")
    return json({ success: false, error: "JSON non valido" }, 400, origin);

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return json(
      { success: false, error: "Controlla i campi e riprova" },
      400,
      origin,
    );
  }

  const turnstileOk = await verifyTurnstile(
    parsed.data.turnstileToken,
    request,
    env,
  );
  if (!turnstileOk) {
    return json(
      { success: false, error: "Verifica anti-spam non riuscita" },
      403,
      origin,
    );
  }

  try {
    const discordResult = await sendApplicationToDiscord(
      env.DISCORD_WEBHOOK_URL,
      parsed.data,
      applicationId(),
    );
    if (!discordResult.ok) {
      return json(
        {
          success: false,
          error: "Servizio candidature temporaneamente non disponibile",
        },
        502,
        origin,
      );
    }
  } catch {
    return json({ success: false, error: "Errore interno" }, 500, origin);
  }

  return json({ success: true }, 200, origin);
}

export default {
  fetch: handleRequest,
};

export { DraftRoom };
