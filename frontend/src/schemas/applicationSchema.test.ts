import { describe, expect, it } from "vitest";
import { applicationSchema } from "./applicationSchema";

const validValues = {
  riotId: "MarioRossi",
  riotTag: "EUW",
  discordUsername: "mariorossi",
  positionId: "apex-support",
  age: 21,
  confirmsMinimumAge: true,
  weeklyAvailability: "Tre sere a settimana",
  experience: "Esperienza in team",
  motivation: "Voglio migliorare",
  opggUrl: "https://www.op.gg/summoners/euw/MarioRossi-EUW",
  privacyConsent: true,
  website: "",
  turnstileToken: "token",
};

describe("applicationSchema", () => {
  it("rifiuta Turnstile non completato", () => {
    const result = applicationSchema.safeParse({
      ...validValues,
      turnstileToken: "",
    });
    expect(result.success).toBe(false);
  });

  it("rifiuta token Turnstile troppo lunghi", () => {
    const result = applicationSchema.safeParse({
      ...validValues,
      turnstileToken: "x".repeat(2049),
    });
    expect(result.success).toBe(false);
  });

  it("accetta esperienza e motivazione vuote", () => {
    const result = applicationSchema.safeParse({
      ...validValues,
      experience: "",
      motivation: "",
    });
    expect(result.success).toBe(true);
  });

  it("rifiuta link esterni a OP.GG", () => {
    const result = applicationSchema.safeParse({
      ...validValues,
      opggUrl: "https://example.com/player",
    });
    expect(result.success).toBe(false);
  });
});
