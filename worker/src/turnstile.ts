import type { Env } from "./types";

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  "error-codes"?: string[];
};

export async function verifyTurnstile(
  token: string,
  request: Request,
  env: Env,
): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  const body = new FormData();
  body.set("secret", env.TURNSTILE_SECRET_KEY);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) return false;
  const data = (await response.json()) as TurnstileResponse;
  if (!data.success) return false;

  const origin = request.headers.get("Origin");
  if (origin && data.hostname) {
    try {
      return (
        new URL(origin).hostname === data.hostname ||
        data.hostname === "localhost"
      );
    } catch {
      return false;
    }
  }

  return true;
}
