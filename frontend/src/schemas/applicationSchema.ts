import { z } from "zod";
import { siteConfig } from "../data/siteConfig";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^https?:\/\/.+\..+/.test(value),
    "Inserisci un URL valido",
  );

export const applicationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Inserisci nome e cognome")
      .max(80, "Massimo 80 caratteri"),
    email: z
      .string()
      .trim()
      .email("Inserisci un indirizzo email valido")
      .max(120, "Massimo 120 caratteri"),
    discordUsername: z
      .string()
      .trim()
      .min(2, "Inserisci il tuo username Discord")
      .max(40, "Massimo 40 caratteri"),
    positionId: z.string().min(1, "Seleziona una posizione"),
    age: z.coerce
      .number({ invalid_type_error: "Inserisci la tua eta" })
      .int("Inserisci un numero intero")
      .min(
        siteConfig.minimumAge,
        `Devi avere almeno ${siteConfig.minimumAge} anni`,
      )
      .max(99, "Inserisci una eta valida"),
    confirmsMinimumAge: z
      .boolean()
      .refine(
        (value) => value,
        `Conferma di avere almeno ${siteConfig.minimumAge} anni`,
      ),

    experience: z
      .string()
      .trim()
      .min(40, "Raccontaci almeno 40 caratteri")
      .max(1200, "Massimo 1200 caratteri"),
    motivation: z
      .string()
      .trim()
      .min(40, "Scrivi almeno 40 caratteri")
      .max(1200, "Massimo 1200 caratteri"),
    weeklyAvailability: z
      .string()
      .trim()
      .min(3, "Indica la disponibilita")
      .max(120, "Massimo 120 caratteri"),
    portfolioUrl: optionalUrl,
    cvUrl: optionalUrl,
    privacyConsent: z
      .boolean()
      .refine((value) => value, "Il consenso privacy e obbligatorio"),
    website: z.string().max(0, "Richiesta non valida").optional(),
    turnstileToken: z
      .string()
      .min(1, "Completa la verifica anti-spam")
      .max(2048, "Verifica anti-spam non valida"),
  })
  .strict();

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
