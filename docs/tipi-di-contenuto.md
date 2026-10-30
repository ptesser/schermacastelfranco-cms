# Tipi di contenuto in WordPress

Creati con ACF (versione gratuita). Tutti esposti nell'API REST.

| Tipo | Slug | Campi | Note |
| --- | --- | --- | --- |
| Notizie | `post` (articoli standard) | titolo, data, luogo, categoria (Gara, Evento, Comunicazione), immagine in evidenza + alt, testo, risultati (ripetitore: atleta, categoria, piazzamento) | Migrazione: `migrazione/notizie/` |
| Appuntamenti | `appuntamento` | titolo, data, luogo, link | Home |
| Corsi | `corso` | arma, fascia d'età, giorni e orari, costo, istruttore, descrizione | `migrazione/dati/corsi.json` |
| Staff | `staff` | nome, ruolo, qualifica, foto + alt, breve presentazione, ordine | `migrazione/dati/staff.json` |
| Documenti | `documento` | titolo, anno, file PDF, descrizione, archiviato sì/no | `migrazione/dati/documenti.json` |
| Album | `album` | titolo, data, foto (galleria) con alt, link esterno | `migrazione/dati/album.json` |
| Sponsor | `sponsor` | nome, logo + alt, sito, ordine | `migrazione/dati/sponsor.json` |
| Impostazioni circolo | pagina opzioni | contatti, PEC, IBAN, sede, orari, codice fiscale | `migrazione/dati/circolo.json` |

## Ruoli

- **Amministratore:** sviluppatore.
- **Editore:** Maestro e referenti del circolo. Pubblicano e modificano tutti i contenuti.
- **Autore:** volontari che scrivono solo notizie.

## Regole di accessibilità nel pannello

- Testo alternativo obbligatorio al caricamento di ogni immagine.
- Editor a blocchi limitato a titoli H2/H3, paragrafi, elenchi, link, immagini.
- Documenti solo in PDF con testo selezionabile.
