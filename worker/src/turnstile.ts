import type { Env } from "./types";

type TurnstileResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const EXPECTED_ACTION = "application";
const MAX_TOKEN_LENGTH = 2048;
const SITEVERIFY_TIMEOUT_MS = 10_000;

function allowedHostnames(value: string): Set<string> {
  return new Set(
    value
      .split(",")
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function verifyTurnstile(
  token: string,
  request: Request,
  env: Env,
): Promise<boolean> {
  if (
    !token ||
    token.length > MAX_TOKEN_LENGTH ||
    !env.TURNSTILE_SECRET_KEY ||
    !env.TURNSTILE_HOSTNAMES
  ) {
    return false;
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: controller.signal,
    });

    if (!response.ok) return false;

    const data = (await response.json()) as TurnstileResponse;
    if (data.success !== true || data.action !== EXPECTED_ACTION) return false;
    if (typeof data.hostname !== "string") return false;

    return allowedHostnames(env.TURNSTILE_HOSTNAMES).has(
      data.hostname.toLowerCase(),
    );
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
