import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^https?:\/\/.+\..+/.test(value),
    "URL non valido",
  );

export const applicationSchema = z
  .object({
    fullName: z.string().trim().min(3).max(80),
    email: z.string().trim().email().max(120),
    discordUsername: z.string().trim().min(2).max(40),
    positionId: z.string().trim().min(1).max(80),
    age: z.coerce.number().int().min(16).max(99),
    confirmsMinimumAge: z.boolean().refine((value) => value),
    experience: z.string().trim().min(40).max(1200),
    motivation: z.string().trim().min(40).max(1200),
    weeklyAvailability: z.string().trim().min(3).max(120),
    portfolioUrl: optionalUrl,
    cvUrl: optionalUrl,
    privacyConsent: z.boolean().refine((value) => value),
    website: z.string().max(0).optional(),
    turnstileToken: z.string().min(1).max(2048),
  })
  .strict();

export type ApplicationPayload = z.infer<typeof applicationSchema>;
