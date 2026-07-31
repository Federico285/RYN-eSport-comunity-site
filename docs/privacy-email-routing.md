# Email privacy con Cloudflare Email Routing

> FIXME(domain): completare questa configurazione quando RYN avra acquistato o importato il dominio ufficiale in Cloudflare.

Indirizzo modello attuale: `privacy@vostrodominio.it` (non attivo).

L'obiettivo e ricevere le richieste privacy su un indirizzo pubblico RYN senza pubblicare gli indirizzi personali dei contitolari. Per il solo inoltro delle email in entrata e sufficiente Cloudflare Email Routing, disponibile senza costi aggiuntivi. Non serve un Worker email.

## Attivazione quando sara disponibile il dominio

1. Aggiungere il dominio ufficiale a Cloudflare e completare la configurazione DNS.
2. Nel pannello Cloudflare aprire **Email Routing** e avviare la configurazione del dominio.
3. Inserire come destinazione una casella controllata da entrambi i contitolari, oppure una casella condivisa dedicata, e confermarla tramite il messaggio di verifica.
4. Creare la regola `privacy@dominio-ufficiale` e inoltrarla alla destinazione verificata.
5. Inviare una prova da un indirizzo esterno e verificare sia la ricezione sia la cartella spam.
6. In `frontend/src/data/siteConfig.ts`, sostituire `privacy@vostrodominio.it` con l'indirizzo reale e impostare `emailReady` a `true`.
7. Pubblicare il frontend e controllare che nella pagina `#/privacy` l'indirizzo sia diventato un collegamento email.

Email Routing gestisce l'inoltro in entrata. Una risposta inviata direttamente dalla casella di destinazione puo mostrare il suo indirizzo reale. Prima di rispondere, configurare l'indirizzo RYN come mittente nella casella scelta oppure usare un servizio di invio compatibile con il dominio.

## Modello di risposta

**Oggetto:** Ricezione richiesta privacy - RYN

```text
Ciao,

abbiamo ricevuto la tua richiesta relativa ai dati personali trattati da RYN.

Per proteggere i tuoi dati potremmo chiederti soltanto le informazioni strettamente necessarie a verificare che la richiesta provenga dalla persona interessata. Ti risponderemo entro i termini previsti dal GDPR, normalmente entro un mese dalla ricezione.

Non inviare documenti o ulteriori dati personali se non ti vengono richiesti espressamente.

Federico Falconi e Gabriel Peluso
Contitolari del trattamento - RYN eSport Community
```

## Gestione operativa

- Limitare l'accesso al canale candidature a Federico, Gabriel e ai coach autorizzati del team interessato.
- Revocare immediatamente l'accesso a chi non e piu coach.
- Vietare copia e inoltro delle candidature fuori dal canale.
- Eliminare le candidature non selezionate entro 6 mesi dalla ricezione.
- Per chi entra nel roster, eliminare la candidatura completa dopo la selezione e conservare soltanto Riot ID, Riot Tag, username Discord e ruolo durante la permanenza effettiva.
- Eliminare questi dati operativi entro 30 giorni dall'uscita o dalla rimozione dal roster.
- Registrare la data di ricezione e quella di cancellazione, senza creare copie ulteriori del contenuto della candidatura.

Riferimenti: [configurare Email Routing](https://developers.cloudflare.com/email-service/get-started/route-emails/) e [prezzi Cloudflare Email Service](https://developers.cloudflare.com/email-service/platform/pricing/).
