import { Gamepad2, MessageCircle, Swords } from "lucide-react";
import { LinkButton } from "../components/Button";
import { siteConfig } from "../data/siteConfig";

type HeaderProps = {
  onHome: () => void;
  onTeams: () => void;
  onDraft: () => void;
};

export function Header({ onHome, onTeams, onDraft }: HeaderProps) {
  return (
    <header className="top-banner">
      <button className="brand-button" type="button" onClick={onHome}>
        <span className="brand-mark">RYN</span>
        <span className="brand-name">eSport Community</span>
      </button>
      <p>{siteConfig.tagline}</p>
      <div className="header-actions">
        <button className="teams-link" type="button" onClick={onTeams}>
          <Swords aria-hidden="true" size={17} />
          <span>Team</span>
        </button>
        <button
          className="teams-link draft-link"
          type="button"
          onClick={onDraft}
        >
          <Gamepad2 aria-hidden="true" size={17} />
          <span>Draft</span>
        </button>
        <LinkButton
          href={siteConfig.discordInviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="discord-button"
        >
          <MessageCircle aria-hidden="true" size={18} />
          <span>Discord</span>
        </LinkButton>
      </div>
    </header>
  );
}
