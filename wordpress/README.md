# WordPress (headless admin)

WordPress runs on Netsons at `https://cms.schermacastelfranco.it` and is used only as the admin panel. The public site is built by Astro from its REST API.

## What lives here

```
mu-plugins/
  scherma.php                 loader (must-use plugin)
  scherma/
    post-types.php            course, staff, document, album, sponsor, event + news categories
    acf.php                   loads/saves ACF field groups from acf-json/
    acf-json/                 field groups, versioned
    club-settings.php         "Dati del circolo" page + GET /wp-json/scherma/v1/club
    editorial.php             alt text required on featured images, comments off
    headless.php              redirects public visits to the Astro site, noindex
    deploy-hook.php           calls the Cloudflare Pages deploy hook on publish (throttled) + Settings › Pubblicazione sito
```

## Install

1. WordPress › Plugins: install and activate **Advanced Custom Fields** (free).
2. WordPress › Settings › Permalinks: choose **Post name** and save, so `/wp-json/` works.
3. Upload `mu-plugins/scherma.php` and the `mu-plugins/scherma/` folder to `wp-content/mu-plugins/` (cPanel File Manager or SFTP). Create `mu-plugins` if it does not exist.
4. Add to `wp-config.php`, above `/* That's all, stop editing! */`:

   ```php
   define('SCHERMA_PUBLIC_URL', 'https://www.schermacastelfranco.it'); // at launch; defaults to the test site
   ```

5. WordPress › Settings › **Pubblicazione sito** (admins only): paste the Cloudflare Pages deploy hook URL. It is stored in the database, never in git and never exposed through the REST API. Defining `SCHERMA_DEPLOY_HOOK_URL` in `wp-config.php` instead also works and takes precedence.

Must-use plugins load automatically and cannot be deactivated from the admin.

## Editing field groups

Change fields in the admin (ACF › Field Groups): ACF writes the updated JSON into `acf-json/` on the server. Download it and commit it here, or edit the JSON in the repository and upload it.

## REST endpoints used by Astro

| Content | Endpoint |
| --- | --- |
| News | `/wp-json/wp/v2/posts?_embed` (category slugs: `race`, `event`, `notice`) |
| Courses | `/wp-json/wp/v2/courses` |
| Staff | `/wp-json/wp/v2/staff?_embed` |
| Documents | `/wp-json/wp/v2/documents` |
| Albums | `/wp-json/wp/v2/albums?_embed`, photos: `/wp-json/wp/v2/media?parent={id}` |
| Sponsors | `/wp-json/wp/v2/sponsors?_embed` |
| Events | `/wp-json/wp/v2/events` |
| Club settings | `/wp-json/scherma/v1/club` |

ACF values are under the `acf` key of each item.
