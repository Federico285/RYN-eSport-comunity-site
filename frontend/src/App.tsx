import { useCallback, useEffect, useMemo, useState } from "react";
import { teams } from "./data/siteConfig";
import { ApplicationModal } from "./sections/ApplicationModal";
import { Header } from "./sections/Header";
import { TeamDetail } from "./sections/TeamDetail";
import { TeamSelection } from "./sections/TeamSelection";

function teamIdFromHash() {
  const match = window.location.hash.match(/^#\/team\/([a-z0-9-]+)$/);
  return match?.[1] ?? "";
}

function App() {
  const [teamId, setTeamId] = useState(teamIdFromHash);
  const [positionId, setPositionId] = useState("");

  useEffect(() => {
    const syncRoute = () => setTeamId(teamIdFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const team = useMemo(
    () => teams.find((candidate) => candidate.id === teamId),
    [teamId],
  );

  const navigateHome = useCallback(() => {
    window.location.hash = "/";
    setTeamId("");
  }, []);

  const navigateTeam = useCallback((nextTeamId: string) => {
    window.location.hash = `/team/${nextTeamId}`;
    setTeamId(nextTeamId);
  }, []);

  const cycleTeam = (direction: -1 | 1) => {
    const currentIndex = Math.max(
      0,
      teams.findIndex((candidate) => candidate.id === team?.id),
    );
    const nextIndex = (currentIndex + direction + teams.length) % teams.length;
    navigateTeam(teams[nextIndex].id);
  };

  return (
    <div className="site-shell">
      <Header onHome={navigateHome} />
      {team ? (
        <TeamDetail
          team={team}
          onBack={navigateHome}
          onApply={setPositionId}
          onCycle={cycleTeam}
        />
      ) : (
        <TeamSelection onSelect={navigateTeam} />
      )}
      {positionId ? (
        <ApplicationModal
          positionId={positionId}
          onClose={() => setPositionId("")}
        />
      ) : null}
    </div>
  );
}

export default App;
