import { ArrowLeft, ExternalLink, Mail, ShieldCheck } from "lucide-react";
import { siteConfig } from "../data/siteConfig";

type PrivacyPageProps = {
  onBack: () => void;
};

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  const privacyEmail = siteConfig.privacy.emailTemplate;

  return (
    <main className="privacy-page">
      <div className="privacy-shell">
        <button className="privacy-back" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" size={18} /> Torna alla home
        </button>

        <header className="privacy-hero">
          <p className="privacy-kicker">Trasparenza e riservatezza</p>
          <h1>Informativa privacy</h1>
          <p>
            Informativa resa ai sensi dell&apos;articolo 13 del Regolamento UE
            2016/679 (GDPR) per le candidature amatoriali ai roster RYN.
          </p>
          <span>Ultimo aggiornamento: {siteConfig.privacy.lastUpdated}</span>
        </header>

        <aside className="privacy-summary" aria-label="Riepilogo privacy">
          <ShieldCheck aria-hidden="true" size={25} />
          <div>
            <strong>Accesso limitato</strong>
            <p>
              Le candidature sono consultabili soltanto da Federico Falconi,
              Gabriel Peluso e dai coach autorizzati del team interessato.
            </p>
          </div>
        </aside>

        <section className="privacy-section">
          <h2>1. Contitolari del trattamento</h2>
          <p>
            I contitolari del trattamento sono <strong>Federico Falconi</strong>{" "}
            e <strong>Gabriel Peluso</strong>, persone fisiche che gestiscono
            congiuntamente la community amatoriale RYN e determinano finalita e
            modalita del trattamento delle candidature.
          </p>
          <div className="privacy-contact-card">
            <Mail aria-hidden="true" size={21} />
            <div>
              <strong>Contatto privacy previsto</strong>
              {siteConfig.privacy.emailReady ? (
                <a href={"mailto:" + privacyEmail}>{privacyEmail}</a>
              ) : (
                <>
                  <span>{privacyEmail}</span>
                  <small>
                    Indirizzo non ancora attivo: sara abilitato quando RYN avra
                    un dominio ufficiale. Fino ad allora, le richieste possono
                    essere rivolte direttamente ai contitolari tramite i
                    recapiti gia utilizzati nei rapporti con la community.
                  </small>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="privacy-section">
          <h2>2. Dati raccolti</h2>
          <p>Il modulo puo raccogliere:</p>
          <ul>
            <li>Riot ID, Riot Tag e username Discord;</li>
            <li>team e posizione per cui viene inviata la candidatura;</li>
            <li>eta e conferma del requisito minimo di 16 anni;</li>
            <li>disponibilita, esperienza e motivazione;</li>
            <li>link al profilo OP.GG e consenso privacy;</li>
            <li>
              dati tecnici necessari alla sicurezza della richiesta, inclusi
              esito Turnstile, indirizzo IP e metadati di rete trattati dai
              fornitori tecnici.
            </li>
          </ul>
          <p className="privacy-warning">
            Non inserire nei campi liberi dati sanitari, informazioni su
            convinzioni religiose o politiche, orientamento sessuale o altri
            dati appartenenti a categorie particolari.
          </p>
        </section>

        <section className="privacy-section">
          <h2>3. Finalita e basi giuridiche</h2>
          <ul>
            <li>
              valutare la candidatura, contattare il candidato e organizzare
              l&apos;eventuale ingresso nel roster, sulla base del consenso
              espresso nel modulo (art. 6, par. 1, lett. a GDPR);
            </li>
            <li>
              prevenire spam, abusi e richieste automatizzate, sulla base del
              legittimo interesse alla sicurezza del servizio (art. 6, par. 1,
              lett. f GDPR);
            </li>
            <li>
              per i candidati ammessi, gestire operativamente il roster durante
              l&apos;effettiva partecipazione alla community, sulla base del
              legittimo interesse alla gestione della squadra (art. 6, par. 1,
              lett. f GDPR).
            </li>
          </ul>
          <p>
            Non vengono svolti processi decisionali esclusivamente automatizzati
            ne attivita di profilazione. La selezione viene effettuata da
            persone.
          </p>
        </section>

        <section className="privacy-section">
          <h2>4. Conferimento e modalita del trattamento</h2>
          <p>
            I campi indicati come obbligatori sono necessari per esaminare la
            candidatura; senza tali dati non e possibile inviarla. Esperienza e
            motivazione possono essere lasciate vuote.
          </p>
          <p>
            La candidatura viene inoltrata dal sito a un canale Discord privato
            dedicato. Il sito non conserva una copia delle candidature in un
            proprio database. I dati possono essere consultati esclusivamente
            dai contitolari e dai coach autorizzati, tenuti alla riservatezza e
            limitatamente al team interessato.
          </p>
        </section>

        <section className="privacy-section">
          <h2>5. Fornitori e trasferimenti</h2>
          <p>
            Per l&apos;erogazione del servizio possono essere coinvolti Discord
            (ricezione delle candidature), Cloudflare (Worker e Turnstile) e
            GitHub (hosting delle pagine statiche). Questi fornitori possono
            trattare dati tecnici anche fuori dallo Spazio Economico Europeo,
            applicando le garanzie previste dalla normativa e descritte nelle
            rispettive informative.
          </p>
          <div className="privacy-external-links">
            <a
              href="https://discord.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Discord <ExternalLink aria-hidden="true" size={14} />
            </a>
            <a
              href="https://www.cloudflare.com/turnstile-privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Cloudflare Turnstile{" "}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy GitHub <ExternalLink aria-hidden="true" size={14} />
            </a>
          </div>
        </section>

        <section className="privacy-section">
          <h2>6. Conservazione</h2>
          <ul>
            <li>
              <strong>Candidature non selezionate:</strong> la candidatura
              completa viene cancellata entro 6 mesi dalla ricezione.
            </li>
            <li>
              <strong>Candidati ammessi:</strong> terminata la selezione, sono
              mantenuti soltanto Riot ID, Riot Tag, username Discord e ruolo per
              il tempo dell&apos;effettiva permanenza nel roster. Questi dati
              sono cancellati entro 30 giorni dall&apos;uscita o dalla rimozione
              dal team.
            </li>
            <li>
              <strong>Dati tecnici:</strong> eventuali log sono conservati dai
              fornitori per i tempi indicati nelle loro informative e
              configurazioni di servizio.
            </li>
          </ul>
          <p>
            L&apos;ingresso nel roster non garantisce alcuna permanenza minima o
            futura nella squadra.
          </p>
        </section>

        <section className="privacy-section">
          <h2>7. Sicurezza e persone autorizzate</h2>
          <p>
            Il canale candidature e riservato ai contitolari e ai coach
            autorizzati. L&apos;accesso viene rimosso quando una persona non
            ricopre piu il ruolo di coach; e vietato inoltrare o copiare le
            candidature fuori dal canale. Gli autorizzati ricevono istruzioni
            sulla riservatezza e possono usare i dati soltanto per la selezione.
          </p>
        </section>

        <section className="privacy-section">
          <h2>8. Minori</h2>
          <p>
            Le candidature non sono destinate a persone di eta inferiore a 16
            anni. Qualora i contitolari vengano a conoscenza di una candidatura
            inviata da un minore di 16 anni, provvederanno a cancellarla.
          </p>
        </section>

        <section className="privacy-section">
          <h2>9. Diritti dell&apos;interessato</h2>
          <p>
            Il candidato puo chiedere accesso, rettifica, cancellazione,
            limitazione, opposizione e, quando applicabile, portabilita dei
            dati. Puo inoltre revocare il consenso in qualsiasi momento, senza
            pregiudicare i trattamenti gia effettuati. Le richieste possono
            essere rivolte ai contitolari usando il contatto indicato sopra.
          </p>
          <p>
            E sempre possibile proporre reclamo al{" "}
            <a
              href="https://www.garanteprivacy.it/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Garante per la protezione dei dati personali{" "}
              <ExternalLink aria-hidden="true" size={14} />
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
