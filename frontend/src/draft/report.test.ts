import { describe, expect, it } from "vitest";
import type { Champion, DraftState } from "./types";
import { buildDraftReport, buildDraftReportFilename } from "./report";

const champions: Champion[] = [
  { id: 1, slug: "Annie", name: "Annie", imageUrl: "", tags: ["Mage"] },
  { id: 2, slug: "Olaf", name: "Olaf", imageUrl: "", tags: ["Fighter"] },
];

const state: DraftState = {
  roomId: "ABC123",
  blueTeam: "Lupi d'Italia",
  redTeam: "Red Foxes",
  timerSeconds: 30,
  status: "complete",
  ready: { blue: true, red: true },
  actions: [
    { team: "blue", kind: "ban", championId: null, at: 1 },
    { team: "red", kind: "ban", championId: 1, at: 2 },
    { team: "blue", kind: "pick", championId: 2, at: 3 },
  ],
  deadline: null,
  pausedReason: null,
  version: 4,
  createdAt: 1,
  expiresAt: 2,
  turn: null,
};

describe("draft report", () => {
  it("genera un riepilogo copiabile con pick, ban e sequenza", () => {
    const championById = new Map(
      champions.map((champion) => [champion.id, champion]),
    );
    const report = buildDraftReport(state, championById);

    expect(report).toContain("TEAM BLU — Lupi d'Italia");
    expect(report).toContain("Pick: Olaf");
    expect(report).toContain("Ban: Nessun ban");
    expect(report).toContain("02. BAN · Red Foxes · Annie");
  });

  it("crea un nome file compatibile", () => {
    expect(buildDraftReportFilename(state)).toBe(
      "ryn-draft-lupi-d-italia-vs-red-foxes.txt",
    );
  });
});
