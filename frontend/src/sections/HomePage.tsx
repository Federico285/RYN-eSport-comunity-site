import { ArrowDown, ArrowRight, Trophy, Users } from "lucide-react";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

type HomePageProps = {
  onTeams: () => void;
};

const achievements = [
  { value: "1st", label: "Community Cup", season: "Spring split" },
  { value: "18", label: "Serie vinte", season: "Ultima stagione" },
  { value: "72%", label: "Win rate", season: "Tornei ufficiali" },
];

export function HomePage({ onTeams }: HomePageProps) {
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
            <a className="home-secondary" href="#chi-siamo">
              Chi siamo <ArrowDown aria-hidden="true" size={18} />
            </a>
          </div>
        </div>
        <span className="home-scroll-marker">Scroll to discover</span>
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

      <section className="wins-section" id="risultati">
        <div className="wins-heading">
          <div>
            <p className="home-kicker">Il percorso</p>
            <h2>Cosa abbiamo vinto</h2>
          </div>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risultati
            di esempio da sostituire con tornei, date e piazzamenti reali.
          </p>
        </div>
        <figure className="victory-feature">
          <img
            src={publicAsset("assets/ryn-victory.png")}
            alt="I giocatori RYN sollevano il trofeo dopo la finale"
          />
          <figcaption>
            <span>Highlight</span>
            <strong>Community Cup Champions</strong>
            <small>Finale nazionale - Milano</small>
          </figcaption>
        </figure>
        <div className="achievement-row">
          {achievements.map((achievement) => (
            <article key={achievement.label}>
              <strong>{achievement.value}</strong>
              <div>
                <h3>{achievement.label}</h3>
                <p>{achievement.season}</p>
              </div>
            </article>
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
        <small>(c) 2026 RYN. Placeholder legale.</small>
      </footer>
    </main>
  );
}