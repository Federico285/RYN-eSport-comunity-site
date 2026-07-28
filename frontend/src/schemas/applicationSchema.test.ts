import { describe, expect, it } from "vitest";
import { applicationSchema } from "./applicationSchema";

const validValues = {
  fullName: "Mario Rossi",
  email: "mario@example.com",
  discordUsername: "mario#1234",
  positionId: "community-moderator",
  age: 21,
  confirmsMinimumAge: true,
  experience:
    "Ho gestito community Discord gaming per diversi mesi con turni di moderazione.",
  motivation:
    "Vorrei aiutare RYN a crescere con eventi ordinati e una community accogliente.",
  weeklyAvailability: "Tre sere a settimana",
  portfolioUrl: "",
  cvUrl: "",
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

  it("rifiuta link facoltativi non validi", () => {
    const result = applicationSchema.safeParse({
      ...validValues,
      portfolioUrl: "notaurl",
    });
    expect(result.success).toBe(false);
  });
});
