# Architecture

## Decisions

- **WordPress as the admin panel** on Netsons (PHP + MySQL are already included in the hosting plan). Chosen because volunteers already know it, it has unlimited users and roles, and it needs no paid licence.
- **Astro** builds the public site by reading the WordPress REST API (`/wp-json/wp/v2/`). The HTML is hand-written, so accessibility does not depend on a theme.
- **Cloudflare Pages** hosts the static site for free. WordPress calls a Pages *deploy hook* on every publish (`deploy-hook.php` in the mu-plugin, throttled to one call per minute).
- **WordPress from day one**, not later: content lives in the database, and the club can enter it while the site is being built.

## Rule for the Astro code

Pages read content only through Astro content collections with a typed schema, via the helpers in `src/lib/content.ts`. Loading from WordPress lives in a single loader. Changing CMS later means replacing the loader only.

Until WordPress is ready, the collections load the files in `migration/`.

## Alternatives considered

| Option | Why not |
| --- | --- |
| TinaCMS | Free for 2 users only, mandatory external service |
| Sanity | Content and images on an external cloud |
| Sveltia / Decap CMS | Every volunteer needs a GitHub account |
| Classic WordPress | Accessible theme still to be written, public site exposed |
| ProcessWire | Unfamiliar to volunteers |
| Kirby | Paid licence |

## Design

Mockup variant B: background `#F5F5F0`, text `#111111`, club red `#A94442`, Archivo typeface (self-hosted), 2 px black borders, no shadows. Mobile first; the navigation collapses into a disclosure menu below 60rem.

## Languages

Repository, code, docs and commits are in English. Website copy is in Italian.
