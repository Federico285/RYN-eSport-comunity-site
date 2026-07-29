import { z } from "zod";

export type DraftRole = "blue" | "red" | "spectator" | "admin";
export type DraftTeam = "blue" | "red";
export type DraftStatus = "lobby" | "active" | "paused" | "complete";
export type DraftTurnKind = "ban" | "pick";

export type DraftTurn = {
  team: DraftTeam;
  kind: DraftTurnKind;
};

export const DRAFT_SEQUENCE: DraftTurn[] = [
  { team: "blue", kind: "ban" },
  { team: "red", kind: "ban" },
  { team: "blue", kind: "ban" },
  { team: "red", kind: "ban" },
  { team: "blue", kind: "ban" },
  { team: "red", kind: "ban" },
  { team: "blue", kind: "pick" },
  { team: "red", kind: "pick" },
  { team: "red", kind: "pick" },
  { team: "blue", kind: "pick" },
  { team: "blue", kind: "pick" },
  { team: "red", kind: "pick" },
  { team: "red", kind: "ban" },
  { team: "blue", kind: "ban" },
  { team: "red", kind: "ban" },
  { team: "blue", kind: "ban" },
  { team: "red", kind: "pick" },
  { team: "blue", kind: "pick" },
  { team: "blue", kind: "pick" },
  { team: "red", kind: "pick" },
];

export type DraftAction = DraftTurn & {
  championId: number | null;
  at: number;
};

export type DraftLobby = {
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
  roleHashes: Record<DraftRole, string>;
};

export type PublicDraftState = Omit<DraftLobby, "roleHashes"> & {
  turn: DraftTurn | null;
};

export const createDraftSchema = z.object({
  blueTeam: z.string().trim().min(2).max(32),
  redTeam: z.string().trim().min(2).max(32),
  timerSeconds: z.number().int().min(20).max(120),
});

const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("auth"), token: z.string().min(24).max(128) }),
  z.object({ type: z.literal("ready"), expectedVersion: z.number().int() }),
  z.object({
    type: z.literal("choose"),
    championId: z.number().int().positive().max(100_000),
    expectedVersion: z.number().int(),
  }),
  z.object({ type: z.literal("skip-ban"), expectedVersion: z.number().int() }),
  z.object({
    type: z.literal("admin"),
    command: z.enum(["pause", "resume", "undo", "reset"]),
    expectedVersion: z.number().int(),
  }),
]);

type ClientMessage = z.infer<typeof clientMessageSchema>;

type SocketAttachment =
  { authenticated: false } | { authenticated: true; role: DraftRole };

const textEncoder = new TextEncoder();

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function randomToken(byteLength = 24): string {
  return base64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(token),
  );
  return base64Url(new Uint8Array(digest));
}

function publicState(lobby: DraftLobby): PublicDraftState {
  const safeLobby = Object.fromEntries(
    Object.entries(lobby).filter(([key]) => key !== "roleHashes"),
  ) as Omit<DraftLobby, "roleHashes">;
  return {
    ...safeLobby,
    turn: DRAFT_SEQUENCE[lobby.actions.length] ?? null,
  };
}

function errorMessage(error: string) {
  return JSON.stringify({ type: "error", error });
}

function stateMessage(lobby: DraftLobby, role?: DraftRole) {
  return JSON.stringify({ type: "state", role, state: publicState(lobby) });
}

export class DraftRoom {
  constructor(
    private readonly ctx: DurableObjectState,
    private readonly _env: unknown,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/initialize" && request.method === "POST") {
      if (await this.ctx.storage.get("lobby")) {
        return Response.json(
          { error: "Lobby già inizializzata" },
          { status: 409 },
        );
      }

      const lobby = (await request.json()) as DraftLobby;
      await this.ctx.storage.put("lobby", lobby);
      await this.ctx.storage.setAlarm(lobby.expiresAt);
      return Response.json(publicState(lobby), { status: 201 });
    }

    if (url.pathname !== "/socket") {
      return new Response("Not found", { status: 404 });
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket upgrade required", { status: 426 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      authenticated: false,
    } satisfies SocketAttachment);
    server.send(JSON.stringify({ type: "hello" }));

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(socket: WebSocket, rawMessage: string | ArrayBuffer) {
    if (typeof rawMessage !== "string") {
      socket.send(errorMessage("Messaggio non valido"));
      return;
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(rawMessage);
    } catch {
      socket.send(errorMessage("Messaggio non valido"));
      return;
    }

    const parsed = clientMessageSchema.safeParse(decoded);
    if (!parsed.success) {
      socket.send(errorMessage("Azione non valida"));
      return;
    }

    const lobby = await this.getLobby();
    if (!lobby) {
      socket.send(errorMessage("Lobby non trovata"));
      socket.close(1011, "Lobby non trovata");
      return;
    }

    const attachment =
      socket.deserializeAttachment() as SocketAttachment | null;
    if (parsed.data.type === "auth") {
      const role = await this.roleForToken(lobby, parsed.data.token);
      if (!role) {
        socket.send(errorMessage("Link non valido o scaduto"));
        socket.close(1008, "Non autorizzato");
        return;
      }
      socket.serializeAttachment({
        authenticated: true,
        role,
      } satisfies SocketAttachment);
      socket.send(stateMessage(lobby, role));
      return;
    }

    if (!attachment?.authenticated) {
      socket.send(errorMessage("Autenticazione richiesta"));
      return;
    }

    await this.applyMessage(socket, attachment.role, lobby, parsed.data);
  }

  async alarm() {
    const lobby = await this.getLobby();
    if (!lobby) return;

    if (Date.now() >= lobby.expiresAt) {
      for (const socket of this.ctx.getWebSockets()) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(errorMessage("Questa lobby è scaduta"));
          socket.close(1000, "Lobby scaduta");
        }
      }
      await this.ctx.storage.deleteAll();
      return;
    }

    if (lobby.status !== "active" || !lobby.deadline) {
      await this.ctx.storage.setAlarm(lobby.expiresAt);
      return;
    }
    if (Date.now() < lobby.deadline) {
      await this.ctx.storage.setAlarm(
        Math.min(lobby.deadline, lobby.expiresAt),
      );
      return;
    }

    const turn = DRAFT_SEQUENCE[lobby.actions.length];
    if (!turn) return;

    if (turn.kind === "ban") {
      lobby.actions.push({ ...turn, championId: null, at: Date.now() });
      lobby.version += 1;
      this.advanceOrComplete(lobby);
    } else {
      lobby.status = "paused";
      lobby.deadline = null;
      lobby.pausedReason = `Tempo scaduto per il Team ${turn.team === "blue" ? "Blu" : "Rosso"}`;
      lobby.version += 1;
    }

    await this.saveAndBroadcast(lobby);
  }

  private async getLobby(): Promise<DraftLobby | null> {
    return (await this.ctx.storage.get<DraftLobby>("lobby")) ?? null;
  }

  private async roleForToken(
    lobby: DraftLobby,
    token: string,
  ): Promise<DraftRole | null> {
    const hash = await hashToken(token);
    return (
      (Object.keys(lobby.roleHashes) as DraftRole[]).find(
        (role) => lobby.roleHashes[role] === hash,
      ) ?? null
    );
  }

  private async applyMessage(
    socket: WebSocket,
    role: DraftRole,
    lobby: DraftLobby,
    message: Exclude<ClientMessage, { type: "auth" }>,
  ) {
    if (message.expectedVersion !== lobby.version) {
      socket.send(
        errorMessage("La draft è stata aggiornata. Stato sincronizzato."),
      );
      socket.send(stateMessage(lobby, role));
      return;
    }

    if (message.type === "ready") {
      if (role !== "blue" && role !== "red") {
        socket.send(errorMessage("Solo i capitani possono confermare"));
        return;
      }
      if (lobby.status !== "lobby") {
        socket.send(errorMessage("La lobby è già iniziata"));
        return;
      }
      lobby.ready[role] = !lobby.ready[role];
      lobby.version += 1;
      if (lobby.ready.blue && lobby.ready.red) {
        lobby.status = "active";
        lobby.deadline = Date.now() + lobby.timerSeconds * 1000;
      }
      await this.saveAndBroadcast(lobby);
      return;
    }

    if (message.type === "admin") {
      if (role !== "admin") {
        socket.send(errorMessage("Controllo riservato all'amministratore"));
        return;
      }
      this.applyAdminCommand(lobby, message.command);
      lobby.version += 1;
      await this.saveAndBroadcast(lobby);
      return;
    }

    if (lobby.status !== "active") {
      socket.send(errorMessage("La draft non è attiva"));
      return;
    }

    const turn = DRAFT_SEQUENCE[lobby.actions.length];
    if (!turn || role !== turn.team) {
      socket.send(errorMessage("Non è il tuo turno"));
      return;
    }

    if (message.type === "skip-ban") {
      if (turn.kind !== "ban") {
        socket.send(errorMessage("Una scelta campione non può essere saltata"));
        return;
      }
      lobby.actions.push({ ...turn, championId: null, at: Date.now() });
    } else {
      if (
        lobby.actions.some((action) => action.championId === message.championId)
      ) {
        socket.send(errorMessage("Questo campione non è più disponibile"));
        return;
      }
      lobby.actions.push({
        ...turn,
        championId: message.championId,
        at: Date.now(),
      });
    }

    lobby.version += 1;
    lobby.pausedReason = null;
    this.advanceOrComplete(lobby);
    await this.saveAndBroadcast(lobby);
  }

  private applyAdminCommand(
    lobby: DraftLobby,
    command: "pause" | "resume" | "undo" | "reset",
  ) {
    if (command === "pause" && lobby.status === "active") {
      lobby.status = "paused";
      lobby.deadline = null;
      lobby.pausedReason = "Draft messa in pausa dall'amministratore";
    }
    if (command === "resume" && lobby.status === "paused") {
      lobby.status = "active";
      lobby.deadline = Date.now() + lobby.timerSeconds * 1000;
      lobby.pausedReason = null;
    }
    if (command === "undo" && lobby.actions.length > 0) {
      lobby.actions.pop();
      lobby.status = "active";
      lobby.deadline = Date.now() + lobby.timerSeconds * 1000;
      lobby.pausedReason = null;
    }
    if (command === "reset") {
      lobby.status = "lobby";
      lobby.ready = { blue: false, red: false };
      lobby.actions = [];
      lobby.deadline = null;
      lobby.pausedReason = null;
    }
  }

  private advanceOrComplete(lobby: DraftLobby) {
    if (lobby.actions.length >= DRAFT_SEQUENCE.length) {
      lobby.status = "complete";
      lobby.deadline = null;
    } else {
      lobby.status = "active";
      lobby.deadline = Date.now() + lobby.timerSeconds * 1000;
    }
  }

  private async saveAndBroadcast(lobby: DraftLobby) {
    await this.ctx.storage.put("lobby", lobby);
    if (lobby.status === "active" && lobby.deadline) {
      await this.ctx.storage.setAlarm(
        Math.min(lobby.deadline, lobby.expiresAt),
      );
    } else {
      await this.ctx.storage.setAlarm(lobby.expiresAt);
    }

    for (const socket of this.ctx.getWebSockets()) {
      const attachment =
        socket.deserializeAttachment() as SocketAttachment | null;
      if (attachment?.authenticated && socket.readyState === WebSocket.OPEN) {
        socket.send(stateMessage(lobby, attachment.role));
      }
    }
  }
}
