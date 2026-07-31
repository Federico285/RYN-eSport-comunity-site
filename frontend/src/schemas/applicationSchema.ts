import { z } from "zod";
import { siteConfig } from "../data/siteConfig";

const opggUrl = z
  .string()
  .trim()
  .url("Inserisci un link OP.GG valido")
  .max(300, "Massimo 300 caratteri")
  .refine((value) => {
    try {
      const hostname = new URL(value).hostname.toLowerCase();
      return hostname === "op.gg" || hostname.endsWith(".op.gg");
    } catch {
      return false;
    }
  }, "Inserisci un link del dominio op.gg");

export const applicationSchema = z
  .object({
    riotId: z.string().trim().min(1, "Inserisci il Riot ID").max(32),
    riotTag: z.string().trim().min(1, "Inserisci il Riot Tag").max(16),
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
    weeklyAvailability: z
      .string()
      .trim()
      .min(1, "Indica la disponibilita")
      .max(120, "Massimo 120 caratteri"),
    experience: z.string().trim().max(1024, "Massimo 1024 caratteri"),
    motivation: z.string().trim().max(1024, "Massimo 1024 caratteri"),
    opggUrl: opggUrl,
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
