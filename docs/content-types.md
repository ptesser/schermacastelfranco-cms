# Content types

Defined in WordPress with ACF (free) and exposed in the REST API. The same fields are the Astro collection schemas in `src/content.config.ts`.

| Type | WordPress | Fields | Migration source |
| --- | --- | --- | --- |
| News | `post` | title, date, location, category (`race`, `event`, `notice`), featured image + alt, body, results (repeater: athlete, category, placement) | `migration/news/` |
| Events | `event` | title, date, location, link | — |
| Courses | `course` | title, weapon, age range, schedule, price, instructor, description, order | `migration/data/courses.json` |
| Staff | `staff` | name, role, qualification, photo + alt, bio, order | `migration/data/staff.json` |
| Documents | `document` | title, year, file, description, archived | `migration/data/documents.json` |
| Albums | `album` | title, date, photos with alt, external link | `migration/data/albums.json` |
| Sponsors | `sponsor` | name, logo, url, order | `migration/data/sponsors.json` |
| Club settings | options page | contacts, PEC, IBAN, venue, opening hours, tax code | `migration/data/club.json` |
| External links | options page | name, url | `migration/data/links.json` |

## Roles

- **Administrator:** developer.
- **Editor:** the Maestro and club officers. Publish and edit all content.
- **Author:** volunteers who write news only.

## Accessibility rules in the admin

- Alt text required for every uploaded image.
- Block editor limited to H2/H3 headings, paragraphs, lists, links, images.
- Documents in PDF with selectable text only.
