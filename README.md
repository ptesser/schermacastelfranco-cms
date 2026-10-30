# schermacastelfranco-cms

New website for **Circolo Scherma Castelfranco Veneto A.S.D.** (schermacastelfranco.it).

## Architecture

| Part | Technology | Where |
| --- | --- | --- |
| Admin panel | Headless WordPress (admin only, no public theme) | Netsons, `cms.schermacastelfranco.it` |
| Public site | Astro static pages, mobile first, WCAG 2.2 AA | Cloudflare Pages |
| Updates | WordPress calls the Cloudflare deploy hook on publish | — |

See [docs/architecture.md](docs/architecture.md).

## Repository layout

```
docs/                 decisions, content types, hosting, content to collect
migration/            all content from the current site, ready to import into WordPress
  news/               7 articles (2015–2016), Markdown with front matter
  data/               club, courses, staff, documents, albums, sponsors, links (JSON)
  media/races/        article photos
  media/documents/    PDF, DOC and ZIP downloads from the current site
  media/site/         header, portrait, historic photos, sponsor logos
```

Repository, code and docs are in English; website copy is in Italian.

## References

- Proposal: https://claude.ai/artifact/JsCAGNJGoD6RhEw298ZZJp
- Mockup: https://claude.ai/artifact/6oaS3BzPRfmN6JEt7Uj7D5
