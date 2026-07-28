import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { teams } from "../data/siteConfig";

type TeamSelectionProps = {
  onSelect: (teamId: string) => void;
};

export function TeamSelection({ onSelect }: TeamSelectionProps) {
  return (
    <main className="team-selector" aria-label="Seleziona un team">
      {teams.map((team, index) => (
        <button
          key={team.id}
          type="button"
          className={`team-slice team-slice-${index + 1}`}
          style={
            {
              "--accent": team.accent,
              "--secondary": team.secondary,
            } as CSSProperties
          }
          onClick={() => onSelect(team.id)}
          aria-label={`Apri il roster ${team.name}`}
        >
          <span className="team-slice-content">
            <span className="team-index">0{index + 1}</span>
            <span className="team-tier">{team.tier}</span>
            <strong>{team.name}</strong>
            <span className="team-statement">{team.statement}</span>
            <span className="team-open">
              Esplora roster <ArrowUpRight aria-hidden="true" size={20} />
            </span>
          </span>
        </button>
      ))}
    </main>
  );
}
