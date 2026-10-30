# Hosting Netsons — situazione verificata il 30/10/2026

| Voce | Valore |
| --- | --- |
| Piano | Hosting Web 100 (cPanel), server `hostingweb77.netsons.net` |
| Scadenza hosting | 27/05/2027 |
| Scadenza PEC | 09/07/2027 (`schermacastelfranco@pec.netsons.org`) |
| Disco | 1,49 GB usati su 100 GB |
| Database MySQL | 0 su 10 |
| Sottodomini | illimitati |
| PHP sito attuale | 5.5 (non più supportato dal 2016) |
| PHP disponibili | 5.1 – 8.5, selezionabili per dominio dal MultiPHP Manager |
| Email sul dominio | `info@schermacastelfranco.it` |

## Passi per il pannello

1. cPanel › Domains › Create A New Domain: `cms.schermacastelfranco.it`, cartella `cms.schermacastelfranco.it` (fuori da `public_html`).
2. MultiPHP Manager: `cms.schermacastelfranco.it` su PHP 8.4. Il dominio principale resta su 5.5 finché il sito vecchio è online.
3. SSL: certificato per `cms.` (AutoSSL o Let's Encrypt).
4. Installazione WordPress su `cms.`, lingua italiana.

## Attenzione ai DNS

La casella `info@` usa i record MX di Netsons. Se si spostano i nameserver su Cloudflare, copiare prima tutti i record, MX compresi. Strada consigliata: solo `www` in CNAME verso Cloudflare Pages.
