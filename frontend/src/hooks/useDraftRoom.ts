import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DraftConnectionStatus,
  DraftRole,
  DraftState,
} from "../draft/types";
import { draftSocketUrl } from "../lib/draftApi";

type DraftCommand =
  | { type: "ready" }
  | { type: "choose"; championId: number }
  | { type: "skip-ban" }
  | { type: "admin"; command: "pause" | "resume" | "undo" | "reset" };

type ServerMessage =
  | { type: "hello" }
  | { type: "error"; error: string }
  | { type: "state"; role?: DraftRole; state: DraftState };

export function useDraftRoom(roomId: string, token: string) {
  const [state, setState] = useState<DraftState | null>(null);
  const [role, setRole] = useState<DraftRole | null>(null);
  const [status, setStatus] = useState<DraftConnectionStatus>("connecting");
  const [error, setError] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const versionRef = useRef(0);

  useEffect(() => {
    versionRef.current = state?.version ?? 0;
  }, [state?.version]);

  useEffect(() => {
    let disposed = false;
    let retryTimer: number | undefined;
    let retryCount = 0;

    const connect = () => {
      if (disposed) return;
      setStatus(retryCount === 0 ? "connecting" : "reconnecting");
      const socket = new WebSocket(draftSocketUrl(roomId));
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        if (disposed) return;
        retryCount = 0;
        setError("");
        socket.send(JSON.stringify({ type: "auth", token }));
      });

      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string") return;
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data) as ServerMessage;
        } catch {
          return;
        }

        if (message.type === "state") {
          setState(message.state);
          if (message.role) setRole(message.role);
          setStatus("live");
          return;
        }
        if (message.type === "error") {
          setError(message.error);
        }
      });

      socket.addEventListener("close", (event) => {
        if (disposed) return;
        if (event.code === 1008) {
          setStatus("error");
          setError("Questo link non è valido oppure non è più utilizzabile.");
          return;
        }
        retryCount += 1;
        setStatus("reconnecting");
        const delay = Math.min(1_000 * 2 ** (retryCount - 1), 8_000);
        retryTimer = window.setTimeout(connect, delay);
      });

      socket.addEventListener("error", () => {
        if (!disposed) setError("Connessione alla lobby interrotta.");
      });
    };

    connect();
    return () => {
      disposed = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      socketRef.current?.close(1000, "Pagina chiusa");
    };
  }, [roomId, token]);

  const send = useCallback((command: DraftCommand) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError("La lobby si sta riconnettendo. Attendi un istante.");
      return false;
    }
    socket.send(
      JSON.stringify({
        ...command,
        expectedVersion: versionRef.current,
      }),
    );
    return true;
  }, []);

  return { state, role, status, error, clearError: () => setError(""), send };
}
