# RYN eSport Community Site

Sito statico React per una community gaming/e-sport, con form candidature protetto da Cloudflare Turnstile e inoltro sicuro a Discord tramite Cloudflare Worker.

## Architettura

- `frontend/`: selettore roster e pagine team React + Vite + TypeScript strict. Il build produce file statici in `frontend/dist`, caricabili su Aruba Linux.
- worker/: Cloudflare Worker con candidature e Draft Room. Ogni lobby live usa una Durable Object SQLite con WebSocket, timer e stato persistente.
- `scripts/`: script amministrativo per generare un Discord Community Invite con `role_ids`.
- `.github/workflows/deploy-aruba.yml`: workflow manuale/opzionale su `main` per build e upload FTPS del solo contenuto di `frontend/dist`.

Nessun database, nessun runtime Node.js su Aruba, nessun segreto nel bundle frontend.

## Requisiti

- Node.js 20+
- npm
- Account Cloudflare con Workers e Turnstile
- Server Discord con permessi per webhook e inviti
- Hosting Aruba Linux con accesso FTP/FTPS

## Installazione

```bash
npm install
```

## Sviluppo locale

```bash
npm run dev
npm run dev:frontend
npm run dev:worker
```

`npm run dev` avvia frontend e Worker insieme. In sviluppo Vite inoltra `/apply` a `http://localhost:8787`, evitando problemi CORS locali.

## Variabili frontend

Copia `frontend/.env.example` in `frontend/.env`:

```env
VITE_APPLICATION_API_URL=
VITE_DRAFT_API_URL=
VITE_TURNSTILE_SITE_KEY=
VITE_DISCORD_INVITE_URL=https://discord.gg/...
```

Solo variabili pubbliche devono iniziare con `VITE_`. Non inserire webhook Discord, bot token, Turnstile secret o credenziali Aruba nel frontend.

## Secret Worker

Copia `worker/.dev.vars.example` in `worker/.dev.vars` per sviluppo locale:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TURNSTILE_SECRET_KEY=...
TURNSTILE_HOSTNAMES=localhost
ALLOWED_ORIGINS=http://localhost:5173,https://example.com
```

In produzione configura i secret con Wrangler:

```bash
npx wrangler secret put DISCORD_WEBHOOK_URL
npx wrangler secret put TURNSTILE_SECRET_KEY
```

`ALLOWED_ORIGINS` e `TURNSTILE_HOSTNAMES` possono stare in `wrangler.jsonc` o nelle variabili ambiente Cloudflare. Usa valori separati da virgola e non usare `*` per `/apply`.

## Webhook Discord

1. Apri il canale privato per le candidature.
2. Crea un Incoming Webhook dalle integrazioni del canale.
3. Copia l URL solo nel Worker, mai nel frontend.
4. Verifica che il canale sia accessibile solo ai responsabili della community.

Il Worker invia un embed con mention neutralizzate e `allowed_mentions` vuoto.

## Turnstile

1. Crea un widget Cloudflare Turnstile.
2. Inserisci la site key in `VITE_TURNSTILE_SITE_KEY`.
3. Inserisci la secret key in `TURNSTILE_SECRET_KEY` del Worker.
4. In sviluppo puoi usare le chiavi di test Cloudflare.

La verifica server-side usa Siteverify e richiede `success`, azione `application` e un hostname presente in `TURNSTILE_HOSTNAMES`.

## Deploy Worker

```bash
cd worker
npx wrangler deploy
```

Dopo il deploy, imposta VITE_APPLICATION_API_URL con l URL pubblico del Worker, senza slash finale. La Draft Room usa lo stesso Worker; VITE_DRAFT_API_URL serve solo se vuoi pubblicarla su un servizio differente.

Il primo deploy applica la migrazione v1 e crea il binding Durable Object DRAFT_ROOMS. Mantieni ALLOWED_ORIGINS aggiornato con il dominio pubblico del sito.

## Community Invite Discord con ruolo

Lo script `scripts/create-discord-community-invite.mjs` crea un invite con `role_ids` per assegnare il ruolo `Community`.

Variabili richieste:

```bash
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
DISCORD_COMMUNITY_ROLE_ID=
DISCORD_INVITE_MAX_AGE=0
DISCORD_INVITE_MAX_USES=0
```

Esecuzione:

```bash
node scripts/create-discord-community-invite.mjs
```

Il bot richiede `Create Instant Invite` e `Manage Roles`. Il ruolo del bot deve essere gerarchicamente superiore al ruolo `Community`. Lo script non avvia bot persistenti e non va incluso nel deploy Aruba.

Se l interfaccia Discord consente Community Invite con ruoli, puoi generare manualmente un invito equivalente dal canale e selezionare il ruolo `Community`.

Copia il link finale in:

```env
VITE_DISCORD_INVITE_URL=https://discord.gg/...
```

## Deploy frontend su Aruba

Build:

```bash
npm run build
```

Preview locale:

```bash
npm run preview
```

Carica su Aruba solo il contenuto di `frontend/dist` nella root web configurata dal pannello Aruba. Non caricare `node_modules`, file `.env`, sorgenti, Worker, script o credenziali.

Controlli consigliati:

- HTTPS attivo.
- Dominio e redirect `www` configurati dal pannello Aruba.
- Asset caricati correttamente.
- Anchor link funzionanti.
- Form collegato al Worker pubblico.

Il sito usa route hash (`#/team/...`): resta statico e non richiede rewrite SPA su Aruba.

## GitHub Actions

Il workflow `.github/workflows/deploy-aruba.yml` esegue `npm ci`, lint, typecheck, test, build e pubblica solo `frontend/dist/` via FTPS.

Secret richiesti:

```text
ARUBA_FTP_SERVER
ARUBA_FTP_USERNAME
ARUBA_FTP_PASSWORD
ARUBA_FTP_REMOTE_DIR
```

Copia hostname, username e directory dal pannello Aruba. Il workflow non inventa directory e non usa pulizia remota distruttiva.

## Test e qualita

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Copertura inclusa:

- Frontend: validazione form, posizione selezionata, invio corretto, errore API, blocco doppio invio, consenso privacy, Turnstile mancante, URL non validi.
- Worker: richiesta valida, JSON non valido, campo obbligatorio mancante, honeypot, origine non autorizzata, Turnstile fallito, Discord fallito, metodo non consentito, payload troppo grande.

## Troubleshooting

- `403 Origine non autorizzata`: aggiungi il dominio reale in `ALLOWED_ORIGINS`.
- `Verifica anti-spam non riuscita`: controlla site key frontend, secret Worker e dominio Turnstile.
- `Servizio candidature temporaneamente non disponibile`: verifica webhook Discord e permessi del canale.
- Asset mancanti su Aruba: carica il contenuto di `frontend/dist`, non la cartella `dist` come sottocartella.

## Sicurezza

- Nessun segreto nel repository.
- Nessun segreto in variabili `VITE_*`.
- Nessun dato personale in `localStorage`.
- Nessun database.
- Nessun log Worker con Riot ID, username Discord, motivazione o link OP.GG.
- Honeypot, Turnstile, limiti body, CORS e rate limit restano attivi insieme.
- Il rate limit locale serve solo per sviluppo. In produzione configura il binding Rate Limiting Cloudflare compatibile con l interfaccia `RATE_LIMITER`.

## Privacy

Il form raccoglie i dati necessari per valutare candidature amatoriali e li inoltra al canale Discord riservato ai contitolari Federico Falconi e Gabriel Peluso e ai coach autorizzati. L'informativa completa e pubblicata nella route `#/privacy` e collegata dal form e dal footer.

L'indirizzo `privacy@vostrodominio.it` e intenzionalmente indicato come non attivo. Quando sara disponibile il dominio ufficiale, seguire [la procedura Cloudflare Email Routing](docs/privacy-email-routing.md), sostituire l'indirizzo modello e impostare `emailReady` a `true` in `frontend/src/data/siteConfig.ts`.

## Costi previsti

- Aruba Linux: secondo piano hosting scelto.
- Cloudflare Workers/Turnstile: compatibile con piani gratuiti per volumi bassi, salvo superamento limiti.
- Discord webhook/invite: nessun costo.
- GitHub Actions: dipende dai minuti disponibili sul piano GitHub.

## Checklist pre-produzione

- [ ] Sostituire nomi team, roster, immagini e contatti in `frontend/src/data/siteConfig.ts`.
- [x] Creare e collegare l'informativa privacy per le candidature.
- [ ] FIXME dominio: attivare `privacy@<dominio>` con Cloudflare Email Routing e aggiornare `siteConfig.ts`.
- [ ] Creare webhook Discord nel canale privato.
- [ ] Configurare secret Worker con Wrangler.
- [ ] Configurare `ALLOWED_ORIGINS` con dominio definitivo.
- [ ] Creare widget Turnstile e impostare site key/secret.
- [ ] Generare invite Discord con ruolo `Community`.
- [ ] Inserire `VITE_DISCORD_INVITE_URL` nel frontend.
- [ ] Eseguire `npm run build`.
- [ ] Verificare `npm run preview`.
- [ ] Caricare solo `frontend/dist` su Aruba.
- [ ] Verificare HTTPS e redirect `www`.
- [ ] Configurare i secret GitHub Actions se usi deploy automatico.

## RYN Draft Room

La pagina #/draft crea una lobby pick/ban competitiva e genera quattro link separati:

- capitano Team Blu;
- capitano Team Rosso;
- spettatore in sola lettura;
- amministratore con pausa, ripristino, annullamento e reset.

Le lobby usano la sequenza competitiva completa da 20 azioni, timer server-side, riconnessione automatica e scadenza dopo sette giorni. I token di accesso viaggiano nel frammento hash del link e nel Worker vengono conservati soltanto come hash SHA-256.

Campioni e icone arrivano dal Data Dragon ufficiale Riot, utilizzando automaticamente l ultima versione disponibile e la localizzazione italiana.

Per provarla in locale avvia npm run dev, apri http://localhost:5173/#/draft, crea una lobby e usa i link generati in finestre o browser differenti.
