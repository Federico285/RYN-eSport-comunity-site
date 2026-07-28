import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { PlayerSilhouette } from "../components/PlayerSilhouette";
import { RoleIcon } from "../components/RoleIcon";
import type { Team } from "../data/siteConfig";

type TeamDetailProps = {
  team: Team;
  onBack: () => void;
  onApply: (positionId: string) => void;
  onCycle: (direction: -1 | 1) => void;
};

export function TeamDetail({
  team,
  onBack,
  onApply,
  onCycle,
}: TeamDetailProps) {
  return (
    <main
      className="roster-page"
      style={
        {
          "--accent": team.accent,
          "--secondary": team.secondary,
        } as CSSProperties
      }
    >
      <div className="roster-heading">
        <button
          className="icon-button"
          type="button"
          onClick={onBack}
          aria-label="Torna alla selezione team"
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <div>
          <span>{team.tier}</span>
          <h1>{team.name}</h1>
        </div>
        <div className="team-cycle" aria-label="Cambia team">
          <button
            className="icon-button"
            type="button"
            onClick={() => onCycle(-1)}
            aria-label="Team precedente"
          >
            <ArrowLeft aria-hidden="true" />
          </button>
          <button
            className="icon-button"
            type="button"
            onClick={() => onCycle(1)}
            aria-label="Team successivo"
          >
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="roster-grid" aria-label={`Formazione ${team.name}`}>
        {team.roster.map((member) => (
          <article
            className={`player-column ${member.name ? "is-filled" : "is-open"}`}
            key={member.role}
          >
            <PlayerSilhouette imageUrl={member.imageUrl} name={member.name} />
            <div className="player-meta">
              {member.name ? (
                <>
                  <h2>
                    {member.name}
                    <small>#{member.tag}</small>
                  </h2>
                  <p>{member.roleLabel}</p>
                  <RoleIcon role={member.role} />
                </>
              ) : (
                <>
                  <p>{member.roleLabel}</p>
                  <RoleIcon role={member.role} />
                  <button
                    className="apply-button"
                    type="button"
                    onClick={() => onApply(`${team.id}-${member.role}`)}
                  >
                    Candidati
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="coach-strip" aria-label={`Coach ${team.name}`}>
        <div className="coach-portrait">
          <PlayerSilhouette
            imageUrl={team.coach?.imageUrl}
            name={team.coach?.name}
          />
        </div>
        <RoleIcon role="coach" size={34} />
        <div className="coach-copy">
          <span>Coach</span>
          {team.coach?.name ? (
            <h2>
              {team.coach.name}
              <small>{team.coach.tag}</small>
            </h2>
          ) : (
            <h2>Posizione aperta</h2>
          )}
        </div>
        {!team.coach?.name ? (
          <button
            className="apply-button"
            type="button"
            onClick={() => onApply(`${team.id}-coach`)}
          >
            Candidati
          </button>
        ) : null}
      </section>
    </main>
  );
}
