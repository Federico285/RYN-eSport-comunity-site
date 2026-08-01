import { useEffect, useState, type FocusEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
} from "lucide-react";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type HomePageProps = {
  onTeams: () => void;
  onDraft: () => void;
};

const newsItems = [
  {
    id: "community-cup",
    eyebrow: "Risultati",
    title: "Community Cup Champions",
    meta: "Finale nazionale · Milano",
    image: "assets/ryn-victory.png",
    alt: "I giocatori RYN sollevano il trofeo dopo la finale",
    tone: "gold",
  },
  {
    id: "new-support",
    eyebrow: "Roster update",
    title: "Benvenuto al nuovo Support",
    meta: "Team X · Nuovo ingresso",
    image: "assets/ryn-new-support-v1.webp",
    alt: "Ritratto promozionale per l'annuncio del nuovo support di Team X",
    tone: "cyan",
  },
];

const NEWS_ROTATION_DELAY = 6500;

export function HomePage({ onTeams, onDraft }: HomePageProps) {
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [isNewsPaused, setIsNewsPaused] = useState(false);
  const activeNews = newsItems[activeNewsIndex];

  useEffect(() => {
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isNewsPaused || prefersReducedMotion) {
      return undefined;
    }

    const rotation = window.setInterval(() => {
      setActiveNewsIndex((current) => (current + 1) % newsItems.length);
    }, NEWS_ROTATION_DELAY);

    return () => window.clearInterval(rotation);
  }, [isNewsPaused]);

  const showPreviousNews = () => {
    setActiveNewsIndex(
      (current) => (current - 1 + newsItems.length) % newsItems.length,
    );
  };

  const showNextNews = () => {
    setActiveNewsIndex((current) => (current + 1) % newsItems.length);
  };

  const resumeAfterFocusLeaves = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsNewsPaused(false);
    }
  };

  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <img
          src={publicAsset("assets/ryn-victory.png")}
          alt="Il team RYN celebra una vittoria sul palco"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-content">
          <p className="home-kicker">RYN eSport Community</p>
          <h1 id="home-title">Competere insieme. Crescere davvero.</h1>
          <p>
            Una community italiana costruita attorno a team solidi, metodo e
            passione competitiva.
          </p>
          <div className="home-actions">
            <button className="home-primary" type="button" onClick={onTeams}>
              Scopri i team <ArrowRight aria-hidden="true" size={19} />
            </button>
            <button className="home-secondary" type="button" onClick={onDraft}>
              draft tool <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
        <a className="home-scroll-marker" href="#chi-siamo">
          <span>Scorri per scoprire</span>
          <ArrowDown aria-hidden="true" size={22} />
        </a>
      </section>

      <section className="about-section" id="chi-siamo">
        <div className="section-number">01</div>
        <div className="about-heading">
          <p className="home-kicker">La community</p>
          <h2>Chi siamo</h2>
        </div>
        <div className="about-copy">
          <p className="about-lead">
            RYN nasce per dare struttura al talento e trasformare la voglia di
            competere in un percorso condiviso.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            posuere, justo non fermentum feugiat, libero erat consequat neque,
            vitae facilisis magna sem at erat. Costruiamo un ambiente in cui
            allenamento, confronto e responsabilita hanno lo stesso peso.
          </p>
        </div>
      </section>

      <section className="vision-section" id="visione">
        <div className="vision-visual" aria-hidden="true">
          <span>RYN</span>
        </div>
        <div className="vision-copy">
          <p className="home-kicker">La direzione</p>
          <h2>Cosa vogliamo</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vogliamo
            roster riconoscibili, uno staff presente e un percorso che permetta
            a ogni player di misurare la propria crescita.
          </p>
          <div className="vision-points">
            <div>
              <Users aria-hidden="true" />
              <strong>Persone prima del rank</strong>
              <span>Comunicazione, rispetto e obiettivi chiari.</span>
            </div>
            <div>
              <Trophy aria-hidden="true" />
              <strong>Competizione con metodo</strong>
              <span>Scrim, review e preparazione costante.</span>
            </div>
          </div>
        </div>
      </section>

      <section
        className="wins-section"
        id="news"
        aria-roledescription="carosello"
        aria-label="News RYN"
        onMouseEnter={() => setIsNewsPaused(true)}
        onMouseLeave={() => setIsNewsPaused(false)}
        onFocusCapture={() => setIsNewsPaused(true)}
        onBlurCapture={resumeAfterFocusLeaves}
      >
        <div className="wins-heading">
          <div>
            <p className="home-kicker">Dalla community</p>
            <h2>News</h2>
          </div>
          <p>
            Risultati, nuovi ingressi e aggiornamenti dai roster della community
            RYN.
          </p>
        </div>
        <figure
          className={`victory-feature news-tone-${activeNews.tone}`}
          key={activeNews.id}
        >
          <img
            className="news-feature-image"
            src={publicAsset(activeNews.image)}
            alt={activeNews.alt}
          />
          <figcaption>
            <span>{activeNews.eyebrow}</span>
            <strong>{activeNews.title}</strong>
            <small>{activeNews.meta}</small>
          </figcaption>
          <div className="news-carousel-controls">
            <button
              type="button"
              aria-label="Notizia precedente"
              onClick={showPreviousNews}
            >
              <ChevronLeft aria-hidden="true" size={21} />
            </button>
            <span aria-hidden="true">
              {String(activeNewsIndex + 1).padStart(2, "0")} /{" "}
              {String(newsItems.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              aria-label="Notizia successiva"
              onClick={showNextNews}
            >
              <ChevronRight aria-hidden="true" size={21} />
            </button>
          </div>
        </figure>
        <div
          className="news-row"
          role="tablist"
          aria-label="Seleziona una notizia"
        >
          {newsItems.map((newsItem, index) => (
            <button
              className={index === activeNewsIndex ? "is-active" : undefined}
              key={newsItem.id}
              type="button"
              role="tab"
              aria-selected={index === activeNewsIndex}
              onClick={() => setActiveNewsIndex(index)}
            >
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <div>
                <h3>{newsItem.eyebrow}</h3>
                <p>{newsItem.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="home-roster-cta">
        <p className="home-kicker">Trova il tuo posto</p>
        <h2>Tre team. Una sola direzione.</h2>
        <button className="home-primary" type="button" onClick={onTeams}>
          Entra nei roster <ArrowRight aria-hidden="true" size={19} />
        </button>
      </section>

      <footer className="home-footer">
        <strong>RYN</strong>
        <span>eSport Community</span>
        <div className="home-footer-legal">
          <small>&copy; 2026 RYN</small>
          <a href="#/privacy">Privacy</a>
        </div>
        <small className="developer-credit">
          Powered by <strong>Federico Falconi</strong>
        </small>
      </footer>
    </main>
  );
}
