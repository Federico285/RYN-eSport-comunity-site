export type Env = {
  DISCORD_WEBHOOK_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMITER?: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
};

export type ApiResponse = { success: true } | { success: false; error: string };
