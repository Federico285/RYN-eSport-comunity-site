import { useCallback, useEffect, useMemo, useState } from "react";
import { teams } from "./data/siteConfig";
import { ApplicationModal } from "./sections/ApplicationModal";
import { DraftCreatePage } from "./sections/DraftCreatePage";
import { DraftRoomPage } from "./sections/DraftRoomPage";
import { Header } from "./sections/Header";
import { HomePage } from "./sections/HomePage";
import { TeamDetail } from "./sections/TeamDetail";
import { TeamSelection } from "./sections/TeamSelection";

function routeFromHash() {
  return window.location.hash || "#/";
}

function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [positionId, setPositionId] = useState("");

  useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  const teamId = route.match(/^#\/team\/([a-z0-9-]+)$/)?.[1] ?? "";
  const team = useMemo(
    () => teams.find((candidate) => candidate.id === teamId),
    [teamId],
  );
  const isTeamsPage = route === "#/teams";
  const isDraftCreatePage = route === "#/draft";
  const draftRoomMatch = route.match(
    /^#\/draft\/([A-Za-z0-9_-]{8,32})\/([A-Za-z0-9_-]{24,128})$/,
  );
  const isDraftPage = isDraftCreatePage || Boolean(draftRoomMatch);

  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
    setRoute("#" + hash);
  }, []);

  const navigateHome = useCallback(() => navigate("/"), [navigate]);
  const navigateTeams = useCallback(() => navigate("/teams"), [navigate]);
  const navigateDraft = useCallback(() => navigate("/draft"), [navigate]);
  const navigateTeam = useCallback(
    (nextTeamId: string) => navigate("/team/" + nextTeamId),
    [navigate],
  );

  const cycleTeam = (direction: -1 | 1) => {
    const currentIndex = Math.max(
      0,
      teams.findIndex((candidate) => candidate.id === team?.id),
    );
    const nextIndex = (currentIndex + direction + teams.length) % teams.length;
    navigateTeam(teams[nextIndex].id);
  };

  return (
    <div
      className={
        "site-shell " +
        (!team && !isTeamsPage && !isDraftPage ? "is-home " : "") +
        (isDraftPage ? "is-draft" : "")
      }
    >
      <Header
        onHome={navigateHome}
        onTeams={navigateTeams}
        onDraft={navigateDraft}
      />
      {draftRoomMatch ? (
        <DraftRoomPage roomId={draftRoomMatch[1]} token={draftRoomMatch[2]} />
      ) : isDraftCreatePage ? (
        <DraftCreatePage />
      ) : team ? (
        <TeamDetail
          team={team}
          onBack={navigateTeams}
          onApply={setPositionId}
          onCycle={cycleTeam}
        />
      ) : isTeamsPage ? (
        <TeamSelection onSelect={navigateTeam} />
      ) : (
        <HomePage onTeams={navigateTeams} onDraft={navigateDraft} />
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
