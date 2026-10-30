# Content types

Registered by the must-use plugin in `wordpress/mu-plugins/` with ACF (free) fields, exposed in the REST API. The same fields are the Astro collection schemas in `src/content.config.ts`.

| Type | WordPress | Fields | Migration source |
| --- | --- | --- | --- |
| News | `post` | title, date, location, category (`race`, `event`, `notice`), featured image + alt, body, results (textarea, one `Athlete | Category | Placement` per line: ACF free has no repeater) | `migration/news/` |
| Events | `event` | title, date, location, link | — |
| Courses | `course` | title, weapon, age range, schedule, price, instructor, description, order | `migration/data/courses.json` |
| Staff | `staff` | name, role, qualification, photo + alt, bio, order | `migration/data/staff.json` |
| Documents | `document` | title, year, file, description, archived | `migration/data/documents.json` |
| Albums | `album` | title, date, cover (featured image), photos = media attached to the album, external link | `migration/data/albums.json` |
| Sponsors | `sponsor` | name, logo, url, order | `migration/data/sponsors.json` |
| Club settings | "Dati del circolo" page, `GET /wp-json/scherma/v1/club` | contacts, PEC, IBAN, venue, opening hours, tax code | `migration/data/club.json` |
| External links | not in WordPress yet (rarely change) | name, url | `migration/data/links.json` |

## Roles

- **Administrator:** developer.
- **Editor:** the Maestro and club officers. Publish and edit all content.
- **Author:** volunteers who write news only.

## Accessibility rules in the admin

- Publishing is refused when the featured image has no alt text.
- Block editor limited to H2/H3 headings, paragraphs, lists, links, images.
- Documents in PDF with selectable text only.
