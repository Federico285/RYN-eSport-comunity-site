import { z } from "zod";

const opggUrl = z
  .string()
  .trim()
  .url()
  .max(300)
  .refine((value) => {
    try {
      const hostname = new URL(value).hostname.toLowerCase();
      return hostname === "op.gg" || hostname.endsWith(".op.gg");
    } catch {
      return false;
    }
  });

export const applicationSchema = z
  .object({
    riotId: z.string().trim().min(1).max(32),
    riotTag: z.string().trim().min(1).max(16),
    discordUsername: z.string().trim().min(2).max(40),
    positionId: z.string().trim().min(1).max(80),
    age: z.coerce.number().int().min(16).max(99),
    confirmsMinimumAge: z.boolean().refine((value) => value),
    weeklyAvailability: z.string().trim().min(1).max(120),
    experience: z.string().trim().max(1024),
    motivation: z.string().trim().max(1024),
    opggUrl: opggUrl,
    privacyConsent: z.boolean().refine((value) => value),
    website: z.string().max(0).optional(),
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();

export type ApplicationPayload = z.infer<typeof applicationSchema>;
