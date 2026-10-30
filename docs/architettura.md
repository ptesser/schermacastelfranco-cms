# Architettura

## Scelte

- **WordPress come pannello** su Netsons (PHP + MySQL già inclusi nel piano). Scelto perché i volontari lo conoscono, ha utenti e ruoli illimitati e non richiede licenze.
- **Astro** genera il sito pubblico leggendo l'API REST di WordPress (`/wp-json/wp/v2/`). L'HTML è scritto a mano: l'accessibilità non dipende da un tema.
- **Cloudflare Pages** ospita il sito statico gratuitamente. WordPress richiama il *deploy hook* a ogni pubblicazione (plugin WP Webhooks).
- **WordPress subito**, non in un secondo momento: i contenuti stanno nel database, e il circolo può inserirli mentre si sviluppa il sito.

## Regola per il codice Astro

Le pagine leggono i contenuti solo attraverso le collezioni di Astro con uno schema dei campi. Il caricamento da WordPress sta in un unico loader. Se un giorno si cambia CMS, si sostituisce solo il loader.

## Alternative scartate

| Opzione | Motivo |
| --- | --- |
| TinaCMS | Gratis solo per 2 utenti, servizio esterno obbligatorio |
| Sanity | Contenuti e immagini su cloud esterno |
| Sveltia / Decap CMS | Ogni volontario deve avere un account GitHub |
| WordPress classico | Tema accessibile da scrivere comunque, sito pubblico esposto |
| ProcessWire | Poco conosciuto dai volontari |
| Kirby | Licenza a pagamento |

## Design

Variante B del mockup: fondo `#F5F5F0`, testo `#111111`, rosso del circolo `#A94442`, carattere Archivo, bordi neri da 2 px, nessuna ombra. Menu a scomparsa sotto i 960 px.
