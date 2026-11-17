# Baratto Skill

**Io ti insegno, tu mi insegni.** Baratto Skill è un'app per scambiare competenze con le persone della propria zona: un'ora di inglese in cambio di un'ora di aiuto con il PC, una lezione di chitarra per una mensola montata. Niente soldi: le ore si accumulano in una **banca del tempo** (un'ora vale un'ora, qualunque cosa insegni).

- **Sito:** https://backinbusinesss.github.io/baratto-skill/ (in inglese su `/en/`)
- **App (PWA installabile):** https://backinbusinesss.github.io/baratto-skill/app/

> È un **progetto dimostrativo**: profili, chat, risposte alle proposte, account, pagamenti e videochiamate sono simulati nel browser. Nessun dato lascia il dispositivo. Le parti da collegare a servizi veri sono isolate in tre "prese" (vedi sotto).

---

## Cosa c'è dentro

### Sito di presentazione (`/` e `/en/`)
- Hero con la "bacheca di quartiere": volantini scritti a mano con le linguette da strappare.
- **Demo interattiva**: scegli cosa sai fare, cosa vuoi imparare e una città, e vedi chi chiuderebbe lo scambio.
- Mappa dell'Italia con i profili demo, il catalogo delle competenze, la banca del tempo, le storie, i prezzi e le FAQ.
- Pagine legali: [privacy](src/app/privacy/page.tsx), [cookie](src/app/cookie/page.tsx), [termini](src/app/termini/page.tsx).

### Web app (`/app/`)
| Schermata | Percorso | Cosa fa |
|---|---|---|
| Onboarding | `/app/` (senza profilo) | 5 passi: nome, comune e raggio, cosa sai fare (con livello), cosa vuoi imparare, disponibilità e modalità. Oppure **entra come ospite** con il profilo demo di Giulia (Bologna). |
| Bacheca | `/app/` | Saluto, scambi perfetti vicini, prossimo appuntamento, proposte in arrivo, **scambi a tre** (Premium), categorie. |
| Vicini | `/app/vicini/` | Ricerca per zona con **elenco o mappa**, raggio, ordinamento, filtri per categoria, competenza, modalità e (Premium) livello, disponibilità, profili verificati. |
| Persona | `/app/persona/?id=…` | Bio, competenze offerte e cercate (in verde gli incroci), disponibilità a confronto, lingue, recensioni, badge, proposta di scambio. |
| Esplora | `/app/esplora/` | Il catalogo completo, con la ricerca senza accenti e quante persone vicine offrono ogni competenza. |
| Competenza | `/app/competenza/?id=…` | Chi la insegna e chi la cerca vicino a te; aggiungila al profilo. |
| Scambi | `/app/scambi/` | In arrivo, inviate, in corso, concluse. |
| Scambio | `/app/scambio/?id=…` | Accetta, scegli l'orario, accetta un nuovo orario, segna come fatto, recensisci, videochiamata (online), esporta in calendario. |
| Chat | `/app/chat/?id=…` | Chat demo con risposte automatiche e "sta scrivendo…". |
| Agenda | `/app/agenda/` | Calendario del mese, appuntamenti in programma e passati, **esportazione `.ics`**. |
| Workshop | `/app/workshop/` | Lezioni di gruppo vicine o in videochiamata, pagate in ore; con Premium ne organizzi uno e incassi le ore di tutti i partecipanti. |
| Ore | `/app/ore/` | Saldo della banca del tempo, ore date e ricevute, grafico degli ultimi 6 mesi, movimenti. |
| Profilo | `/app/profilo/` | Modifica del profilo, **19 badge**, recensioni ricevute, chi ha visto il profilo (Premium), persone salvate, lingua, tema, account, piano. |
| Premium | `/app/premium/` | Piani, confronto, checkout demo. |

### I numeri della demo
- **420 competenze** in **14 categorie** (lingue, informatica, musica, sport, cucina, casa e fai da te, studio, arte, benessere, giardino, lavoro, moda e cucito, famiglia e animali, motori).
- **296 comuni** italiani con le coordinate: tutti i capoluoghi di provincia e i comuni principali delle 20 regioni.
- **3.000 profili** generati con un seme fisso (sempre uguali), con cognomi regionali, persone arrivate da altri paesi che insegnano la propria lingua, livelli, disponibilità, recensioni e badge.
- Più il **vicinato**: quando crei il profilo (o entri come ospite) l'app genera circa 40 persone nel tuo raggio, in parte con interessi complementari ai tuoi, e le salva nel browser. È un espediente della demo per mostrare subito abbinamenti veri anche nei comuni piccoli.

### Come funziona l'abbinamento
In [`src/domain/matching.ts`](src/domain/matching.ts):
- **scambio perfetto**: io insegno X che tu cerchi **e** tu insegni Y che io cerco;
- **può insegnarti** / **vuole imparare da te**: incrocio a metà, si compensa con le ore;
- il punteggio tiene conto di distanza, livello, fasce orarie in comune, valutazione, modalità (dal vivo / online) e del **profilo in evidenza** dei Premium.

Gli **scambi a tre** ([`triads.ts`](src/domain/triads.ts)) cercano il giro io → B → C → io quando nessuno dei due ha ciò che cerca l'altro, e le **catene a quattro** il giro io → B → X → C → io.
- **videochiamata oltre il raggio**: se nel profilo accetti la videochiamata, in Vicini puoi cercare "Vicino a me", "In videochiamata" (tutta Italia) o "Entrambi";
- **lezione di prova**: 15 minuti gratis in videochiamata, senza ore, una per persona.

### Banca del tempo e piani
- 2 ore di benvenuto; un'ora insegnata = +1, un'ora ricevuta = −1; si può andare in rosso fino a **−3** ([`timebank.ts`](src/domain/timebank.ts)).
- **Gratis**: 3 nuove proposte al mese, 2 scambi in corso, raggio fino a 25 km.
- **Premium** (4,99 €/mese o 39,99 €/anno, 14 giorni di prova): profilo in evidenza, proposte e scambi illimitati, raggio fino a 150 km, scambi a tre, filtri avanzati, chi ha visto il profilo ([`plans.ts`](src/domain/plans.ts)).

### Lingue
Italiano (principale) e inglese. Le traduzioni sono in file separati, uno per lingua:
```
src/i18n/it/messages.ts   testi dell'interfaccia (il tipo delle altre lingue nasce da qui)
src/i18n/it/skills.ts     nomi delle 420 competenze
src/i18n/it/categories.ts nomi e descrizioni delle categorie
src/i18n/it/content.ts    frasi per bio, chat, risposte e recensioni demo
src/i18n/en/…             gli stessi file in inglese
```
Per aggiungere una lingua: copia la cartella `en`, traduci, registrala in [`src/i18n/index.ts`](src/i18n/index.ts). Il compilatore e il test [`tests/i18n/parity.test.ts`](tests/i18n/parity.test.ts) segnalano chiavi, liste o segnaposto mancanti.

---

## Le tre "prese" da collegare

| Presa | File | Oggi | Domani |
|---|---|---|---|
| **Pagamenti** | [`src/providers/payments.tsx`](src/providers/payments.tsx) | Checkout finto con la carta di prova, nessun addebito; attiva il piano nello store. | Stripe: il server crea una Checkout Session in modalità `subscription` (con `trial_period_days: 14`), il webhook aggiorna il piano dell'account. Basta un `PaymentGateway` vero. |
| **Account** | [`src/providers/account.tsx`](src/providers/account.tsx) | Email salvata solo nel browser, "accesso" immediato. | Un `AccountBackend` vero (Supabase, Firebase Auth, Auth.js…): link magico via email, sessione, sincronizzazione del profilo. |
| **Video** | [`src/providers/video.tsx`](src/providers/video.tsx) | Chiamata finta con l'avatar e l'anteprima locale della fotocamera. | Daily / Jitsi / LiveKit / Twilio Video: un `CallUi` che entra nella stanza dello scambio. |

Le schermate usano solo `usePayments()`, `useAccount()` e `useVideo()`: collegando i servizi non cambiano.

---

## Sviluppo

Serve Node.js 24 o più recente.

```bash
npm install
```

```bash
npm run dev
```
Apre il sito su http://localhost:3000 (l'app su `/app/`).

```bash
npm test
```
Esegue i test (Vitest): catalogo e comuni, geografia, generatore dei profili, abbinamento, scambi a tre, banca del tempo, piani, badge, traduzioni, store e simulatore, rendering di sito e app, prese demo, service worker.

```bash
npm run typecheck
```

```bash
npm run build
```
Esporta il sito statico in `out/`, poi `scripts/flatten-rsc.mjs` sistema i file della navigazione per gli hosting statici e `scripts/generate-sw.mjs` genera il service worker (offline).

Per provare la build come su GitHub Pages, sotto `/baratto-skill/`:
```bash
NEXT_PUBLIC_BASE_PATH=/baratto-skill npm run build && npm run serve
```
(su Git Bash per Windows anteporre `MSYS_NO_PATHCONV=1`), poi apri http://localhost:3125/baratto-skill/.

```bash
npm run assets
```
Rigenera la sagoma dell'Italia (`src/content/italy.ts`, da world-atlas), le icone della PWA e l'immagine `og.png`.

### Struttura
```
src/
  app/          pagine (Next.js App Router, esportazione statica)
  site/         sito di presentazione
  features/     schermate dell'app
  ui/           componenti condivisi (volantino, biglietto, mappa, griglia orari…)
  domain/       logica pura e testata (geo, profili, abbinamento, ore, piani, badge, orari, .ics)
  content/      catalogo competenze, categorie, comuni, mappa
  i18n/         traduzioni
  providers/    prese demo: pagamenti, account, video
  store/        stato salvato nel browser (Zustand) e simulatore
tests/          test Vitest
scripts/        asset, service worker, file per hosting statico, server di prova
docs/superpowers/  design e piano di lavoro
```

### Stack
Next.js 16 (export statico), React 19, TypeScript, Tailwind CSS 4, motion, lucide-react, Zustand, Vitest + Testing Library. Caratteri: Archivo (con l'asse della larghezza, per i titoli da manifesto) e Caveat (la "scrittura a mano" dei volantini), inclusi nel sito.

## Pubblicazione

Ogni push su `main` avvia [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): test, controllo dei tipi, build con il sottopercorso giusto e pubblicazione su GitHub Pages. Si può rilanciare a mano da **Actions → Pubblica su GitHub Pages → Run workflow**.

## Crediti
- Sagoma dell'Italia: [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, licenza ISC).
- Icone: [Lucide](https://lucide.dev) (ISC).
- Caratteri: Archivo e Caveat (SIL Open Font License) via Fontsource.
- Coordinate e abitanti dei comuni: valori arrotondati, indicativi.
