# Netsons hosting — checked on 2026-10-30

| Item | Value |
| --- | --- |
| Plan | Hosting Web 100 (cPanel), server `hostingweb77.netsons.net` |
| Hosting renewal | 2027-05-27 |
| PEC renewal | 2027-07-09 (`schermacastelfranco@pec.netsons.org`) |
| Disk | 1.49 GB used of 100 GB |
| MySQL databases | 0 of 10 |
| Subdomains | unlimited |
| PHP on current site | 5.5 (end of life since 2016) |
| PHP available | 5.1 – 8.5, per domain via MultiPHP Manager |
| Mailboxes on the domain | `info@schermacastelfranco.it` |

## Admin panel setup

1. cPanel › Domains › Create A New Domain: `cms.schermacastelfranco.it`, document root `cms.schermacastelfranco.it` (outside `public_html`).
2. MultiPHP Manager: set `cms.schermacastelfranco.it` to PHP 8.4. Keep the main domain on 5.5 while the old site is online.
3. SSL: certificate for `cms.` (AutoSSL or Let's Encrypt).
4. Install WordPress on `cms.`, Italian locale.

## DNS warning

`info@` relies on the Netsons MX records. If nameservers move to Cloudflare, copy every record first, MX included. Recommended path: only `www` as a CNAME to Cloudflare Pages.
