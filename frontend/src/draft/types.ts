export type DraftRole = "blue" | "red" | "spectator" | "admin";
export type DraftTeam = "blue" | "red";
export type DraftStatus = "lobby" | "active" | "paused" | "complete";
export type DraftTurnKind = "ban" | "pick";

export type DraftTurn = {
  team: DraftTeam;
  kind: DraftTurnKind;
};

export type DraftAction = DraftTurn & {
  championId: number | null;
  at: number;
};

export type DraftState = {
  roomId: string;
  blueTeam: string;
  redTeam: string;
  timerSeconds: number;
  status: DraftStatus;
  ready: Record<DraftTeam, boolean>;
  actions: DraftAction[];
  deadline: number | null;
  pausedReason: string | null;
  version: number;
  createdAt: number;
  expiresAt: number;
  turn: DraftTurn | null;
};

export type DraftTokens = Record<DraftRole, string>;

export type Champion = {
  id: number;
  slug: string;
  name: string;
  imageUrl: string;
  tags: string[];
};

export type DraftConnectionStatus =
  "connecting" | "live" | "reconnecting" | "error";
