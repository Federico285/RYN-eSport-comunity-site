import { UserRound } from "lucide-react";

type PlayerSilhouetteProps = {
  imageUrl?: string;
  name?: string;
};

export function PlayerSilhouette({ imageUrl, name }: PlayerSilhouetteProps) {
  if (imageUrl) {
    return (
      <img
        className="player-portrait"
        src={imageUrl}
        alt={`Ritratto di ${name}`}
      />
    );
  }

  return (
    <div
      className="player-silhouette"
      role="img"
      aria-label={
        name
          ? `Ritratto non disponibile per ${name}`
          : "Posizione senza giocatore"
      }
    >
      <UserRound aria-hidden="true" strokeWidth={0.75} />
    </div>
  );
}
