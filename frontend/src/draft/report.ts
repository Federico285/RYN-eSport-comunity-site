import type { Champion, DraftAction, DraftState, DraftTeam } from "./types";

function championName(
  action: DraftAction,
  championById: Map<number, Champion>,
) {
  if (action.championId === null) return "";
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
    .map((action) =>
      action.championId === null
        ? "Saltato"
        : championName(action, championById),
    );

  return names.length > 0 ? names.join(" · ") : "—";
}

function actionPhase(index: number) {
  if (index < 6) return "ban_1";
  if (index < 12) return "pick_1";
  if (index < 16) return "ban_2";
  return "pick_2";
}

function spreadsheetSafe(value: string) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number | boolean | null) {
  if (value === null) return "";
  const text = spreadsheetSafe(String(value));
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildDraftExportBaseName(state: DraftState) {
  const matchup = `${state.blueTeam}-vs-${state.redTeam}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `ryn-draft-${matchup || state.roomId}`;
}

export function buildDraftReport(
  state: DraftState,
  championById: Map<number, Champion>,
) {
  return [
    "RYN DRAFT ROOM — COMPOSIZIONI FINALI",
    `${state.blueTeam} vs ${state.redTeam}`,
    `Lobby: ${state.roomId}`,
    "",
    `🟦 TEAM BLU — ${state.blueTeam}`,
    `Pick: ${listTeamActions(state, "blue", "pick", championById)}`,
    `Ban: ${listTeamActions(state, "blue", "ban", championById)}`,
    "",
    `🟥 TEAM ROSSO — ${state.redTeam}`,
    `Pick: ${listTeamActions(state, "red", "pick", championById)}`,
    `Ban: ${listTeamActions(state, "red", "ban", championById)}`,
  ].join("\n");
}

export function buildDraftCsv(
  state: DraftState,
  championById: Map<number, Champion>,
) {
  const header = [
    "lobby_id",
    "blue_team",
    "red_team",
    "action_number",
    "phase",
    "action",
    "side",
    "team_name",
    "champion_id",
    "champion_name",
    "skipped",
    "selected_at",
  ];

  const rows = state.actions.map((action, index) => {
    const skipped = action.kind === "ban" && action.championId === null;
    return [
      state.roomId,
      state.blueTeam,
      state.redTeam,
      index + 1,
      actionPhase(index),
      action.kind,
      action.team,
      teamName(state, action.team),
      action.championId,
      championName(action, championById),
      skipped,
      new Date(action.at).toISOString(),
    ]
      .map(csvCell)
      .join(",");
  });

  return [header.join(","), ...rows].join("\r\n");
}

export function buildDraftCsvFilename(state: DraftState) {
  return `${buildDraftExportBaseName(state)}.csv`;
}

export function buildDraftImageFilename(state: DraftState) {
  return `${buildDraftExportBaseName(state)}.png`;
}
