# schermacastelfranco-cms

Nuovo sito del **Circolo Scherma Castelfranco Veneto A.S.D.** (schermacastelfranco.it).

## Architettura

| Pezzo | Tecnologia | Dove |
| --- | --- | --- |
| Pannello di gestione | WordPress "headless" (solo pannello, nessun tema pubblico) | Netsons, `cms.schermacastelfranco.it` |
| Sito pubblico | Astro, pagine statiche, mobile first, WCAG 2.2 AA | Cloudflare Pages |
| Aggiornamento | A ogni pubblicazione WordPress richiama il deploy hook di Cloudflare | — |

Dettagli in [docs/architettura.md](docs/architettura.md).

## Contenuto del repository

```
docs/                  decisioni, tipi di contenuto, hosting, cose da raccogliere
migrazione/            tutto il contenuto del sito attuale, pronto da caricare in WordPress
  notizie/             7 articoli (2015–2016) in Markdown con dati in testa
  dati/                circolo, corsi, staff, documenti, album, sponsor, link esterni (JSON)
  media/gare/          foto degli articoli
  media/documenti/     PDF, DOC e ZIP scaricabili dal sito attuale
  media/struttura/     intestazione, ritratto, foto storiche, loghi sponsor
```

Il sito Astro (`src/`) verrà aggiunto nella fase di sviluppo.

## Riferimenti

- Proposta: https://claude.ai/artifact/JsCAGNJGoD6RhEw298ZZJp
- Mockup: https://claude.ai/artifact/6oaS3BzPRfmN6JEt7Uj7D5
