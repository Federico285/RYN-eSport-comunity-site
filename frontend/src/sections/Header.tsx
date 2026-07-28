import { MessageCircle } from "lucide-react";
import { LinkButton } from "../components/Button";
import { siteConfig } from "../data/siteConfig";

type HeaderProps = {
  onHome: () => void;
};

export function Header({ onHome }: HeaderProps) {
  return (
    <header className="top-banner">
      <button className="brand-button" type="button" onClick={onHome}>
        <span className="brand-mark">RYN</span>
        <span className="brand-name">eSport Community</span>
      </button>
      <p>{siteConfig.tagline}</p>
      <LinkButton
        href={siteConfig.discordInviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="discord-button"
      >
        <MessageCircle aria-hidden="true" size={18} />
        <span>Discord</span>
      </LinkButton>
    </header>
  );
}
