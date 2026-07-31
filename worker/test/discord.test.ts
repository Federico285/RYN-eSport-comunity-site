import { describe, expect, it } from "vitest";
import { buildDiscordPayload } from "../src/discord";
import type { ApplicationPayload } from "../src/validation";

const application: ApplicationPayload = {
  riotId: "MarioRossi",
  riotTag: "EUW",
  discordUsername: "mariorossi",
  positionId: "apex-support",
  age: 21,
  confirmsMinimumAge: true,
  weeklyAvailability: "Tre sere a settimana",
  experience: "",
  motivation: "",
  opggUrl: "https://www.op.gg/summoners/euw/MarioRossi-EUW",
  privacyConsent: true,
  website: "",
  turnstileToken: "token",
};

describe("Discord application payload", () => {
  it("include i nuovi campi della candidatura", () => {
    const payload = buildDiscordPayload(application, "application-id");
    const fields = payload.embeds[0].fields;

    expect(fields).toContainEqual(
      expect.objectContaining({ name: "Riot ID", value: "MarioRossi" }),
    );
    expect(fields).toContainEqual(
      expect.objectContaining({ name: "Riot Tag", value: "EUW" }),
    );
    expect(fields).toContainEqual(
      expect.objectContaining({ name: "OP.GG", value: application.opggUrl }),
    );
    expect(fields.some((field) => field.name === "Email")).toBe(false);
  });
});
