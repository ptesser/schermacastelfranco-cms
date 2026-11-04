# schermacastelfranco-cms

New website for **Circolo Scherma Castelfranco Veneto A.S.D.** (schermacastelfranco.it).

## Architecture

| Part | Technology | Where |
| --- | --- | --- |
| Admin panel | Headless WordPress (admin only, no public theme) | Netsons, `cms.schermacastelfranco.it` |
| Public site | Astro static pages, mobile first, WCAG 2.2 AA | Cloudflare Pages |
| Updates | WordPress calls the Cloudflare deploy hook on publish | — |

See [docs/architecture.md](docs/architecture.md).

## Development

Requires Node 22 (see `.nvmrc`).

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # type and template checks
npm run build    # static site in dist/
```

## Deploy (Cloudflare Pages)

The site is a Cloudflare Pages project connected to this repository (`wrangler.jsonc`). Every push to `main` deploys production.

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |
| Node version | from `.nvmrc` (22) |
| Environment variable | `WP_URL`, set in `wrangler.jsonc` (`vars`) |

With `WP_URL` set the build reads content from the WordPress REST API (`src/lib/wordpress-loader.ts`); without it, from `migration/`. Locally: `WP_URL=https://cms.schermacastelfranco.it npm run build`.

Test site: `test.schermacastelfranco.it`, a CNAME at Netsons pointing to `schermacastelfranco-cms.pages.dev`. WordPress triggers a rebuild on publish through a Pages deploy hook stored in `SCHERMA_DEPLOY_HOOK_URL` (see `wordpress/README.md`).

## Code structure

```
src/
  config/navigation.ts   menu and legal links
  content.config.ts      collection schemas and loaders (only file to change when switching to WordPress)
  lib/content.ts         data helpers used by pages; pages never query collections directly
  layouts/BaseLayout     html shell, skip link, header, footer
  components/ui/         generic building blocks (Button, Card, Section, PageHeader, MediaImage, ...)
  components/            domain components (NewsCard, ImageCard)
  pages/                 one file per route
  styles/global.css      design tokens and base styles
```

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

Repository, code, docs and commits (Conventional Commits) are in English; website copy is in Italian.

## References

- Proposal: https://claude.ai/artifact/JsCAGNJGoD6RhEw298ZZJp
- Mockup: https://claude.ai/artifact/6oaS3BzPRfmN6JEt7Uj7D5
