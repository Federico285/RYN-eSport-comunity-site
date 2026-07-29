import type { Champion, DraftAction, DraftState, DraftTeam } from "./types";

function championName(
  action: DraftAction,
  championById: Map<number, Champion>,
) {
  if (action.championId === null) return "Nessun ban";
  return (
    championById.get(action.championId)?.name ??
    `Campione #${action.championId}`
  );
}

function teamName(state: DraftState, team: DraftTeam) {
  return team === "blue" ? state.blueTeam : state.redTeam;
}

function listTeamActions(
  state: DraftState,
  team: DraftTeam,
  kind: "pick" | "ban",
  championById: Map<number, Champion>,
) {
  const names = state.actions
    .filter((action) => action.team === team && action.kind === kind)
    .map((action) => championName(action, championById));

  return names.length > 0 ? names.join(", ") : "—";
}

export function buildDraftReport(
  state: DraftState,
  championById: Map<number, Champion>,
) {
  const sequence = state.actions.map((action, index) => {
    const number = String(index + 1).padStart(2, "0");
    const kind = action.kind === "pick" ? "PICK" : "BAN";
    return `${number}. ${kind} · ${teamName(state, action.team)} · ${championName(action, championById)}`;
  });

  return [
    "RYN DRAFT ROOM — ESITO DRAFT",
    `Lobby: ${state.roomId}`,
    "",
    `TEAM BLU — ${state.blueTeam}`,
    `Pick: ${listTeamActions(state, "blue", "pick", championById)}`,
    `Ban: ${listTeamActions(state, "blue", "ban", championById)}`,
    "",
    `TEAM ROSSO — ${state.redTeam}`,
    `Pick: ${listTeamActions(state, "red", "pick", championById)}`,
    `Ban: ${listTeamActions(state, "red", "ban", championById)}`,
    "",
    "SEQUENZA COMPLETA",
    ...sequence,
  ].join("\n");
}

export function buildDraftReportFilename(state: DraftState) {
  const matchup = `${state.blueTeam}-vs-${state.redTeam}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `ryn-draft-${matchup || state.roomId}.txt`;
}
