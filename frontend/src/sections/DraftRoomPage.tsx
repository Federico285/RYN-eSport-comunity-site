import {
  Ban,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  FileSpreadsheet,
  FileText,
  ImageDown,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Undo2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  Champion,
  DraftAction,
  DraftRole,
  DraftTeam,
} from "../draft/types";
import {
  buildDraftCsv,
  buildDraftCsvFilename,
  buildDraftImageFilename,
  buildDraftReport,
} from "../draft/report";
import { buildDraftResultImage } from "../draft/resultImage";
import { useDraftRoom } from "../hooks/useDraftRoom";
import { loadChampions } from "../lib/draftApi";

type DraftRoomPageProps = {
  roomId: string;
  token: string;
};

const roleLabels: Record<DraftRole, string> = {
  blue: "Capitano Blu",
  red: "Capitano Rosso",
  spectator: "Spettatore",
  admin: "Amministratore",
};

const filters = [
  { value: "all", label: "Tutti" },
  { value: "Fighter", label: "Combattenti" },
  { value: "Mage", label: "Maghi" },
  { value: "Assassin", label: "Assassini" },
  { value: "Marksman", label: "Tiratori" },
  { value: "Tank", label: "Tank" },
  { value: "Support", label: "Supporti" },
];

function ChampionSlot({
  action,
  champion,
  label,
  compact = false,
}: {
  action?: DraftAction;
  champion?: Champion;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={"draft-champion-slot" + (compact ? " is-compact" : "")}>
      {champion ? (
        <img src={champion.imageUrl} alt="" />
      ) : (
        <span className="draft-slot-placeholder" aria-hidden="true">
          {action?.championId === null ? <Ban size={16} /> : null}
        </span>
      )}
      <div>
        <small>{label}</small>
        <strong>
          {champion?.name ??
            (action?.championId === null ? "Nessun ban" : "In attesa")}
        </strong>
      </div>
    </div>
  );
}

function TeamPanel({
  team,
  teamName,
  actions,
  championById,
  isCurrent,
}: {
  team: DraftTeam;
  teamName: string;
  actions: DraftAction[];
  championById: Map<number, Champion>;
  isCurrent: boolean;
}) {
  const picks = actions.filter(
    (action) => action.team === team && action.kind === "pick",
  );
  const bans = actions.filter(
    (action) => action.team === team && action.kind === "ban",
  );

  return (
    <aside
      className={
        "draft-team-panel is-" + team + (isCurrent ? " is-current" : "")
      }
      aria-label={"Composizione " + teamName}
    >
      <div className="draft-team-title">
        <span>{team === "blue" ? "Blue side" : "Red side"}</span>
        <h2>{teamName}</h2>
      </div>
      <div className="draft-pick-list">
        {Array.from({ length: 5 }, (_, index) => {
          const action = picks[index];
          return (
            <ChampionSlot
              key={index}
              action={action}
              champion={
                action?.championId
                  ? championById.get(action.championId)
                  : undefined
              }
              label={"Pick " + (index + 1)}
            />
          );
        })}
      </div>
      <div className="draft-ban-list" aria-label={"Ban " + teamName}>
        {Array.from({ length: 5 }, (_, index) => {
          const action = bans[index];
          return (
            <ChampionSlot
              key={index}
              compact
              action={action}
              champion={
                action?.championId
                  ? championById.get(action.championId)
                  : undefined
              }
              label={"Ban " + (index + 1)}
            />
          );
        })}
      </div>
    </aside>
  );
}

export function DraftRoomPage({ roomId, token }: DraftRoomPageProps) {
  const { state, role, status, error, clearError, send } = useDraftRoom(
    roomId,
    token,
  );
  const [champions, setChampions] = useState<Champion[]>([]);
  const [championError, setChampionError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [resultCopied, setResultCopied] = useState(false);
  const [resultCopyError, setResultCopyError] = useState("");
  const [resultExportError, setResultExportError] = useState("");
  const [resultExporting, setResultExporting] = useState<"image" | null>(null);

  useEffect(() => {
    let active = true;
    loadChampions()
      .then((items) => {
        if (active) setChampions(items);
      })
      .catch(() => {
        if (active) {
          setChampionError(
            "L'elenco campioni Riot non è disponibile. Ricarica la pagina.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSelectedId(null);
  }, [state?.version]);

  useEffect(() => {
    if (!state?.deadline) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [state?.deadline]);

  const championById = useMemo(
    () => new Map(champions.map((champion) => [champion.id, champion])),
    [champions],
  );
  const unavailableIds = useMemo(
    () =>
      new Set(
        state?.actions
          .map((action) => action.championId)
          .filter((id): id is number => id !== null) ?? [],
      ),
    [state?.actions],
  );
  const visibleChampions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("it");
    return champions.filter(
      (champion) =>
        (filter === "all" || champion.tags.includes(filter)) &&
        (!normalizedSearch ||
          champion.name.toLocaleLowerCase("it").includes(normalizedSearch)),
    );
  }, [champions, filter, search]);
  const draftReport = useMemo(
    () =>
      state?.status === "complete" ? buildDraftReport(state, championById) : "",
    [championById, state],
  );

  if (!state || !role) {
    return (
      <main className="draft-loading-page">
        <div className="draft-loading-mark">RYN</div>
        <h1>Accesso alla draft room</h1>
        <p>
          {status === "error"
            ? error || "Lobby non disponibile."
            : "Connessione sicura alla lobby in corso..."}
        </p>
        {status === "error" ? <a href="#/draft">Crea una nuova lobby</a> : null}
      </main>
    );
  }

  const currentTurn = state.turn;
  const canAct =
    state.status === "active" &&
    (role === "blue" || role === "red") &&
    currentTurn?.team === role;
  const selectedChampion = selectedId
    ? championById.get(selectedId)
    : undefined;
  const remaining = state.deadline
    ? Math.max(0, Math.ceil((state.deadline - now) / 1000))
    : null;
  const roleTeam = role === "blue" || role === "red" ? role : null;
  const roleReady = roleTeam ? state.ready[roleTeam] : false;

  const confirmSelection = () => {
    if (selectedId && canAct) {
      send({ type: "choose", championId: selectedId });
    }
  };

  const copyDraftReport = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(draftReport);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = draftReport;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        textArea.remove();
        if (!copied) throw new Error("copy-not-supported");
      }

      setResultCopyError("");
      setResultCopied(true);
      window.setTimeout(() => setResultCopied(false), 2200);
    } catch {
      setResultCopied(false);
      setResultCopyError(
        "Copia automatica non disponibile: seleziona il testo qui sopra.",
      );
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const downloadDraftCsv = () => {
    try {
      const csv = buildDraftCsv(state, championById);
      const blob = new Blob(["﻿", csv], {
        type: "text/csv;charset=utf-8",
      });
      downloadBlob(blob, buildDraftCsvFilename(state));
      setResultExportError("");
    } catch {
      setResultExportError("Non è stato possibile creare il file CSV.");
    }
  };

  const downloadDraftImage = async () => {
    setResultExporting("image");
    setResultExportError("");
    try {
      const image = await buildDraftResultImage(state, championById);
      downloadBlob(image, buildDraftImageFilename(state));
    } catch {
      setResultExportError(
        "Non è stato possibile creare l'immagine. Riprova tra qualche secondo.",
      );
    } finally {
      setResultExporting(null);
    }
  };

  return (
    <main
      className={
        "draft-room-page" + (role === "admin" ? " has-admin-controls" : "")
      }
    >
      <header className="draft-match-header">
        <div className="draft-room-meta">
          <span className="draft-live-state">
            {status === "live" ? (
              <Wifi aria-hidden="true" size={15} />
            ) : (
              <WifiOff aria-hidden="true" size={15} />
            )}
            {status === "live" ? "Live" : "Riconnessione"}
          </span>
          <span>Lobby {state.roomId}</span>
          <strong>{roleLabels[role]}</strong>
        </div>
        <div className="draft-versus">
          <strong>{state.blueTeam}</strong>
          <span>VS</span>
          <strong>{state.redTeam}</strong>
        </div>
        <div
          className={
            "draft-timer" +
            (remaining !== null && remaining <= 10 ? " is-low" : "")
          }
        >
          <Clock3 aria-hidden="true" />
          <strong>{remaining !== null ? remaining : "--"}</strong>
          <span>secondi</span>
        </div>
      </header>

      {error ? (
        <button className="draft-toast" type="button" onClick={clearError}>
          {error} <span>Chiudi</span>
        </button>
      ) : null}

      {state.status === "lobby" ? (
        <section className="draft-ready-overlay" aria-labelledby="ready-title">
          <div>
            <p className="draft-eyebrow">Ready check</p>
            <h1 id="ready-title">Entrambe le squadre devono essere pronte</h1>
            <p>
              La draft partirà automaticamente quando i due capitani avranno
              confermato.
            </p>
          </div>
          <div className="draft-ready-teams">
            {(["blue", "red"] as DraftTeam[]).map((team) => (
              <article className={"is-" + team} key={team}>
                <ShieldCheck aria-hidden="true" />
                <span>{team === "blue" ? state.blueTeam : state.redTeam}</span>
                <strong>{state.ready[team] ? "Pronto" : "In attesa"}</strong>
              </article>
            ))}
          </div>
          {roleTeam ? (
            <button
              className={"draft-ready-button is-" + roleTeam}
              type="button"
              onClick={() => send({ type: "ready" })}
            >
              {roleReady ? "Annulla conferma" : "Sono pronto"}
            </button>
          ) : (
            <p className="draft-spectator-wait">
              <Eye aria-hidden="true" /> Stai osservando la lobby
            </p>
          )}
        </section>
      ) : null}

      {state.status === "complete" && (role === "blue" || role === "red") ? (
        <section
          className="draft-result-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="draft-result-title"
        >
          <div className="draft-result-card">
            <div className="draft-result-heading">
              <span className="draft-result-icon" aria-hidden="true">
                <FileText />
              </span>
              <div>
                <p className="draft-eyebrow">Draft completata</p>
                <h1 id="draft-result-title">Esito pronto da condividere</h1>
                <p>
                  Scarica la Result Card per condividerla oppure il CSV per
                  analizzare pick, ban, lati e fasi della draft.
                </p>
              </div>
            </div>

            <label className="draft-result-content">
              <span>Riepilogo testuale da copiare</span>
              <textarea
                aria-label="Esito completo della draft"
                readOnly
                value={draftReport}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>

            {resultCopyError || resultExportError ? (
              <p className="draft-result-error" role="alert">
                {resultCopyError || resultExportError}
              </p>
            ) : null}

            <div className="draft-result-actions">
              <button
                className="draft-result-image"
                type="button"
                onClick={downloadDraftImage}
                disabled={resultExporting !== null}
              >
                <ImageDown aria-hidden="true" />
                {resultExporting === "image"
                  ? "Creo immagine..."
                  : "Scarica PNG"}
              </button>
              <button
                className="draft-result-download"
                type="button"
                onClick={downloadDraftCsv}
              >
                <FileSpreadsheet aria-hidden="true" />
                Scarica CSV
              </button>
              <button
                className="draft-result-copy"
                type="button"
                onClick={copyDraftReport}
              >
                {resultCopied ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {resultCopied ? "Riepilogo copiato" : "Copia riepilogo"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="draft-status-strip" aria-live="polite">
        {state.status === "complete" ? (
          <strong>Draft completata</strong>
        ) : state.status === "paused" ? (
          <strong>{state.pausedReason || "Draft in pausa"}</strong>
        ) : currentTurn ? (
          <>
            <span>Turno attuale</span>
            <strong>
              {currentTurn.kind === "ban" ? "Ban" : "Pick"} ·{" "}
              {currentTurn.team === "blue" ? state.blueTeam : state.redTeam}
            </strong>
          </>
        ) : null}
        <span className="draft-progress">
          {state.actions.length} / 20 azioni
        </span>
      </section>

      {role === "admin" ? (
        <nav
          className="draft-admin-controls"
          aria-label="Controlli amministratore"
        >
          {state.status === "active" ? (
            <button
              type="button"
              onClick={() => send({ type: "admin", command: "pause" })}
            >
              <Pause aria-hidden="true" /> Pausa
            </button>
          ) : state.status === "paused" ? (
            <button
              type="button"
              onClick={() => send({ type: "admin", command: "resume" })}
            >
              <Play aria-hidden="true" /> Riprendi
            </button>
          ) : null}
          <button
            type="button"
            disabled={state.actions.length === 0}
            onClick={() => send({ type: "admin", command: "undo" })}
          >
            <Undo2 aria-hidden="true" /> Annulla ultima
          </button>
          <button
            type="button"
            onClick={() => send({ type: "admin", command: "reset" })}
          >
            <RotateCcw aria-hidden="true" /> Reset
          </button>
        </nav>
      ) : null}

      <div className="draft-board">
        <TeamPanel
          team="blue"
          teamName={state.blueTeam}
          actions={state.actions}
          championById={championById}
          isCurrent={currentTurn?.team === "blue" && state.status === "active"}
        />

        <section className="draft-pool" aria-label="Selezione campioni">
          <div className="draft-pool-tools">
            <label className="draft-search">
              <Search aria-hidden="true" />
              <input
                aria-label="Cerca campione"
                placeholder="Cerca campione"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="draft-filters" aria-label="Filtra campioni">
              {filters.map((item) => (
                <button
                  className={filter === item.value ? "is-active" : ""}
                  type="button"
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {championError ? (
            <p className="draft-champion-error">{championError}</p>
          ) : (
            <div className="draft-champion-grid">
              {visibleChampions.map((champion) => {
                const unavailable = unavailableIds.has(champion.id);
                return (
                  <button
                    className={
                      "draft-champion" +
                      (selectedId === champion.id ? " is-selected" : "") +
                      (unavailable ? " is-unavailable" : "")
                    }
                    type="button"
                    key={champion.id}
                    disabled={!canAct || unavailable}
                    aria-pressed={selectedId === champion.id}
                    onClick={() => setSelectedId(champion.id)}
                  >
                    <img src={champion.imageUrl} alt="" loading="lazy" />
                    <span>{champion.name}</span>
                    {unavailable ? <Ban aria-label="Non disponibile" /> : null}
                  </button>
                );
              })}
            </div>
          )}

          <div className="draft-confirm-bar">
            <div>
              {selectedChampion ? (
                <>
                  <img src={selectedChampion.imageUrl} alt="" />
                  <span>
                    <small>Selezionato</small>
                    <strong>{selectedChampion.name}</strong>
                  </span>
                </>
              ) : (
                <span>
                  <small>
                    {canAct ? "È il tuo turno" : "Selezione bloccata"}
                  </small>
                  <strong>
                    {canAct
                      ? "Scegli un campione"
                      : "Attendi la prossima azione"}
                  </strong>
                </span>
              )}
            </div>
            {canAct && currentTurn?.kind === "ban" ? (
              <button
                className="draft-skip-button"
                type="button"
                onClick={() => send({ type: "skip-ban" })}
              >
                Salta ban
              </button>
            ) : null}
            <button
              className={
                "draft-lock-button is-" + (currentTurn?.team ?? "neutral")
              }
              type="button"
              disabled={!canAct || !selectedId}
              onClick={confirmSelection}
            >
              <Check aria-hidden="true" />
              Conferma {currentTurn?.kind === "ban" ? "ban" : "pick"}
            </button>
          </div>
        </section>

        <TeamPanel
          team="red"
          teamName={state.redTeam}
          actions={state.actions}
          championById={championById}
          isCurrent={currentTurn?.team === "red" && state.status === "active"}
        />
      </div>
    </main>
  );
}
