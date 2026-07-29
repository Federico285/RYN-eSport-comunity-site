import { Check, Copy, Link2, LockKeyhole, Radio, Shield } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { DraftRole, DraftTokens } from "../draft/types";
import { createDraft } from "../lib/draftApi";

type CreatedLobby = {
  roomId: string;
  tokens: DraftTokens;
};

const roleDetails: Array<{
  role: DraftRole;
  label: string;
  description: string;
  icon: typeof Shield;
}> = [
  {
    role: "blue",
    label: "Capitano Team Blu",
    description: "Può confermare pick e ban del lato blu.",
    icon: Shield,
  },
  {
    role: "red",
    label: "Capitano Team Rosso",
    description: "Invia questo link al team avversario.",
    icon: Shield,
  },
  {
    role: "spectator",
    label: "Spettatori",
    description: "Vista live senza possibilità di intervenire.",
    icon: Radio,
  },
  {
    role: "admin",
    label: "Controllo Admin",
    description: "Pausa, ripristino, annullamento e reset.",
    icon: LockKeyhole,
  },
];

function lobbyLink(roomId: string, token: string) {
  return (
    window.location.href.split("#")[0] +
    "#/draft/" +
    encodeURIComponent(roomId) +
    "/" +
    encodeURIComponent(token)
  );
}

export function DraftCreatePage() {
  const [blueTeam, setBlueTeam] = useState("RYN");
  const [redTeam, setRedTeam] = useState("Team ospite");
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [created, setCreated] = useState<CreatedLobby | null>(null);
  const [copiedRole, setCopiedRole] = useState<DraftRole | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const links = useMemo(() => {
    if (!created) return null;
    return Object.fromEntries(
      roleDetails.map(({ role }) => [
        role,
        lobbyLink(created.roomId, created.tokens[role]),
      ]),
    ) as Record<DraftRole, string>;
  }, [created]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await createDraft({
      blueTeam: blueTeam.trim(),
      redTeam: redTeam.trim(),
      timerSeconds,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setCreated({ roomId: result.roomId, tokens: result.tokens });
  };

  const copyLink = async (role: DraftRole) => {
    if (!links) return;
    try {
      await navigator.clipboard.writeText(links[role]);
      setCopiedRole(role);
      window.setTimeout(() => setCopiedRole(null), 1_600);
    } catch {
      setError("Copia non riuscita: seleziona il link manualmente.");
    }
  };

  return (
    <main className="draft-create-page">
      <div className="draft-create-grid">
        <section className="draft-intro">
          <p className="draft-eyebrow">RYN Draft Room</p>
          <h1>La partita inizia prima della Landa.</h1>
          <p>
            Crea una lobby competitiva, invita l&apos;avversario e gestisci pick
            e ban in tempo reale. Nessun account e nessun download.
          </p>
          <div className="draft-feature-list" aria-label="Funzioni incluse">
            <span>
              <Check aria-hidden="true" /> Link privati per ogni ruolo
            </span>
            <span>
              <Check aria-hidden="true" /> Timer sincronizzato
            </span>
            <span>
              <Check aria-hidden="true" /> Spettatori e controllo admin
            </span>
            <span>
              <Check aria-hidden="true" /> Riconnessione automatica
            </span>
          </div>
        </section>

        <section
          className="draft-create-card"
          aria-labelledby="create-draft-title"
        >
          {!created ? (
            <>
              <div className="draft-card-heading">
                <span>Nuova lobby</span>
                <h2 id="create-draft-title">Configura la draft</h2>
              </div>
              <form onSubmit={submit}>
                <label>
                  <span>Team Blu</span>
                  <input
                    value={blueTeam}
                    minLength={2}
                    maxLength={32}
                    onChange={(event) => setBlueTeam(event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Team Rosso</span>
                  <input
                    value={redTeam}
                    minLength={2}
                    maxLength={32}
                    onChange={(event) => setRedTeam(event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Tempo per turno</span>
                  <select
                    value={timerSeconds}
                    onChange={(event) =>
                      setTimerSeconds(Number(event.target.value))
                    }
                  >
                    <option value={30}>30 secondi</option>
                    <option value={45}>45 secondi</option>
                    <option value={60}>60 secondi</option>
                    <option value={90}>90 secondi</option>
                  </select>
                </label>
                {error ? (
                  <p className="draft-form-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  className="draft-create-submit"
                  type="submit"
                  disabled={submitting}
                >
                  <Link2 aria-hidden="true" />
                  {submitting ? "Creazione in corso..." : "Crea lobby"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="draft-card-heading">
                <span>Lobby pronta</span>
                <h2 id="create-draft-title">Condividi i link</h2>
                <p>
                  Ogni link concede permessi diversi. Conserva quello Admin
                  soltanto per lo staff RYN.
                </p>
              </div>
              <div className="draft-link-list">
                {roleDetails.map(({ role, label, description, icon: Icon }) => (
                  <article className={"draft-link-card is-" + role} key={role}>
                    <Icon aria-hidden="true" />
                    <div>
                      <strong>{label}</strong>
                      <span>{description}</span>
                      <input
                        aria-label={"Link " + label}
                        value={links?.[role] ?? ""}
                        readOnly
                        onFocus={(event) => event.currentTarget.select()}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label={"Copia link " + label}
                      onClick={() => copyLink(role)}
                    >
                      {copiedRole === role ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Copy aria-hidden="true" />
                      )}
                    </button>
                  </article>
                ))}
              </div>
              {error ? (
                <p className="draft-form-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="draft-created-actions">
                <a className="draft-create-submit" href={links?.admin}>
                  Apri controllo Admin
                </a>
                <button
                  className="draft-secondary-action"
                  type="button"
                  onClick={() => setCreated(null)}
                >
                  Crea un&apos;altra lobby
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <p className="draft-riot-notice">
        RYN Draft Room non è approvato da Riot Games e non riflette le opinioni
        di Riot Games o di soggetti coinvolti nella produzione dei suoi
        prodotti. Riot Games e tutte le proprietà associate sono marchi o marchi
        registrati di Riot Games, Inc.
      </p>
    </main>
  );
}
