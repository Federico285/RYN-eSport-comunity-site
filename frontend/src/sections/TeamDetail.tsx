import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { PlayerSilhouette } from "../components/PlayerSilhouette";
import { RoleIcon } from "../components/RoleIcon";
import type { Team, TeamStaffMember } from "../data/siteConfig";

type TeamDetailProps = {
  team: Team;
  onBack: () => void;
  onApply: (positionId: string) => void;
  onCycle: (direction: -1 | 1) => void;
};

type StaffMemberProps = {
  label: string;
  member: TeamStaffMember;
  positionId: string;
  onApply: (positionId: string) => void;
};

function StaffMember({ label, member, positionId, onApply }: StaffMemberProps) {
  return (
    <article className="staff-member">
      <div className="coach-portrait">
        <PlayerSilhouette imageUrl={member.imageUrl} name={member.name} />
      </div>
      <div className="coach-copy">
        <span>{label}</span>
        {member.name ? (
          <h2>
            {member.name}
            <small>{member.tag}</small>
          </h2>
        ) : (
          <h2>{member.isOpen ? "Posizione aperta" : "Posizione non attiva"}</h2>
        )}
      </div>
      {member.isOpen ? (
        <button
          className="apply-button"
          type="button"
          onClick={() => onApply(positionId)}
        >
          Candidati
        </button>
      ) : null}
    </article>
  );
}

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
            className={`player-column ${
              member.isOpen
                ? "is-open"
                : member.name
                  ? "is-filled"
                  : "is-closed"
            }`}
            key={member.role}
          >
            <PlayerSilhouette imageUrl={member.imageUrl} name={member.name} />
            <div className="player-meta">
              {member.isOpen ? (
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
              ) : member.name ? (
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
                  <span className="position-status">Non disponibile</span>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <section
        className={`coach-strip ${team.assistantCoach ? "has-assistant" : ""}`}
        aria-label={`Staff ${team.name}`}
      >
        <StaffMember
          label="Coach"
          member={team.coach}
          positionId={`${team.id}-coach`}
          onApply={onApply}
        />
        {team.assistantCoach ? (
          <StaffMember
            label="Assistant Coach"
            member={team.assistantCoach}
            positionId={`${team.id}-assistant-coach`}
            onApply={onApply}
          />
        ) : null}
      </section>
    </main>
  );
}
