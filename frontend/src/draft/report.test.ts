import { describe, expect, it } from "vitest";
import type { Champion, DraftState } from "./types";
import {
  buildDraftCsv,
  buildDraftCsvFilename,
  buildDraftImageFilename,
  buildDraftReport,
} from "./report";

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

const championById = new Map(
  champions.map((champion) => [champion.id, champion]),
);

describe("draft report", () => {
  it("genera un riepilogo testuale breve delle composizioni finali", () => {
    const report = buildDraftReport(state, championById);

    expect(report).toContain("RYN DRAFT ROOM — COMPOSIZIONI FINALI");
    expect(report).toContain("🟦 TEAM BLU — Lupi d'Italia");
    expect(report).toContain("Pick: Olaf");
    expect(report).toContain("Ban: Saltato");
    expect(report).not.toContain("SEQUENZA COMPLETA");
  });

  it("genera un CSV analizzabile con una riga per azione", () => {
    const csv = buildDraftCsv(state, championById);
    const rows = csv.split("\r\n");

    expect(rows).toHaveLength(4);
    expect(rows[0]).toBe(
      "lobby_id,blue_team,red_team,action_number,phase,action,side,team_name,champion_id,champion_name,skipped,selected_at",
    );
    expect(rows[1]).toContain(
      "ABC123,Lupi d'Italia,Red Foxes,1,ban_1,ban,blue",
    );
    expect(rows[1]).toContain(",true,1970-01-01T00:00:00.001Z");
    expect(rows[2]).toContain(",1,Annie,false,");
    expect(rows[3]).toContain(",2,Olaf,false,");
  });

  it("crea nomi file coerenti per PNG e CSV", () => {
    expect(buildDraftImageFilename(state)).toBe(
      "ryn-draft-lupi-d-italia-vs-red-foxes.png",
    );
    expect(buildDraftCsvFilename(state)).toBe(
      "ryn-draft-lupi-d-italia-vs-red-foxes.csv",
    );
  });
});
