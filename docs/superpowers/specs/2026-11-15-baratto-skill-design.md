# Baratto Skill — design

> Data: 15/11/2026. Stato: approvato in autonomia. La richiesta dell'utente era già dettagliata e l'utente ha chiesto di procedere da solo: le scelte segnate **[mia scelta]** sono decisioni prese da chi costruisce e si possono cambiare.

## Perché

Baratto Skill è un'app per scambiarsi competenze con le persone della propria zona, senza soldi: io ti insegno un'ora di inglese e tu mi dai un'ora di aiuto con il PC. Le ore si accumulano in una **banca del tempo**. Si guadagna con un **abbonamento Premium** che mette il profilo in evidenza e toglie il limite agli scambi.

L'utente vuole un progetto "molto molto elaborato", con centinaia di opzioni, tradotto e "figo". Il risultato si giudica da tre cose: un catalogo che sembra vero, abbinamenti che si capiscono a colpo d'occhio e una grafica con una personalità sua.

## Obiettivi

- Un **sito di presentazione** su `/`, anche in inglese su `/en/`, con le pagine privacy, cookie e termini.
- Una **PWA** su `/app/` che si installa e funziona anche offline.
- Un **catalogo** di oltre 400 competenze in 14 categorie, con il nome in italiano e in inglese.
- Il **comune** di ogni persona (oltre 250 comuni italiani con le coordinate) e la **ricerca per raggio** in km, con una mappa dell'Italia disegnata in SVG.
- **Profili dimostrativi**: circa 1.200 persone generate in modo deterministico, con competenze offerte e cercate, livello, disponibilità, modalità (in presenza o online), recensioni e badge.
- **Abbinamento**: "io insegno X e cerco Y, tu insegni Y e cerchi X", con un punteggio che si può spiegare, più gli **scambi a tre** (A→B→C→A).
- **Scambi**: proposta, accettazione, rifiuto, controproposta, conclusione e recensione. Le risposte dell'altra persona sono simulate.
- **Chat dimostrativa** con risposte automatiche e l'indicatore "sta scrivendo".
- **Calendario** degli appuntamenti, con l'esportazione `.ics`.
- **Banca del tempo**: il saldo delle ore, l'elenco dei movimenti e un grafico.
- **Recensioni** e circa 18 **badge**.
- **Premium**: un piano gratuito con dei limiti e due piani a pagamento, mensile e annuale.
- **Prese demo**, isolate in un file ciascuna: `payments.tsx` (pronta per Stripe), `account.tsx` (pronta per gli account su un server) e `video.tsx` (videochiamata per gli scambi online).
- **Lingue**: italiano principale e inglese, con le traduzioni in file separati e un test che ne controlla la parità.
- **Pubblicazione**: repository GitHub pubblico `backinbusinesss/baratto-skill`, GitHub Pages con una Action a ogni push su `main`, e un README in italiano.

## Cosa non si fa

- Nessun backend, nessun vero pagamento, nessuna vera messaggistica.
- Nessuna mappa a tasselli esterna (come OSM): solo la mappa SVG locale.
- Non tutti i circa 7.900 comuni italiani, ma i capoluoghi e i comuni principali. Il formato dei dati è pronto per aggiungerne altri.

## Cosa lo renderebbe un fallimento

- Un aspetto da template SaaS generico, viola e con le card tutte uguali.
- Dati finti che si vedono finti: nomi ripetuti, bio uguali, città sbagliate.
- Frasi a metà tra italiano e inglese, o chiavi di traduzione mancanti.
- La PWA che si rompe sotto un sottopercorso di GitHub Pages.

## Vincoli

- Lo stack è lo stesso di Indovina Tutto: Next.js 16 con `output: 'export'` e `trailingSlash`, React 19, TypeScript, Tailwind 4, motion, lucide-react, Zustand salvato in localStorage, Vitest e `NEXT_PUBLIC_BASE_PATH`.
- L'esportazione è statica, quindi le pagine con un parametro usano la query string (`/app/persona/?id=…`) invece delle route dinamiche, per non generare 1.200 pagine.
- Va bene su un telefono a 375×812 e su desktop.

## Approcci considerati

1. **Next.js con esportazione statica, dati generati con un seme nel client** (scelto). È lo stesso stack del progetto di riferimento: funziona su Pages senza server e i dati restano coerenti tra una visita e l'altra.
2. **Vite e React SPA.** È più leggero, ma non c'è il rendering statico del sito vetrina, che serve per la SEO, e si perde l'allineamento con Indovina Tutto.
3. **Next.js con un backend finto** (MSW o JSON statici da scaricare). È più "realistico", ma aggiunge complessità senza dare niente all'utente: le prese demo isolano già il punto dove si collegherà un server vero.

## Design

### Identità visiva **[mia scelta]**

Il tema è un **"mercato di quartiere"**, un taccuino e una bacheca di paese, lontano dal look SaaS.

- **Colori.** Fondo carta `#F5EFE3`, testo inchiostro `#17140F`, accento pomodoro `#E5533B`, basilico `#2E6A4F`, zafferano `#F1B238`, lavanda `#8E7CC3` per le cose Premium. Il tema scuro è "notte in piazza": fondo `#14120F` e gli stessi accenti, un po' più chiari.
- **Font.** Fraunces Variable per i titoli (serif editoriale, con un tocco morbido) e Inter Variable per il testo.
- **Motivi grafici.** Il **biglietto di scambio**: una card con il bordo perforato e due metà, "do" e "ricevo", unite da frecce che si incrociano. Poi i timbri circolari per i badge, la grana della carta in SVG, gli adesivi ruotati e le etichette scritte a mano. Le categorie hanno ognuna un colore e un'icona lucide.
- **Avatar.** Sono generati in SVG a partire dal nome: forme geometriche, colori presi dalla palette e le iniziali. Nessuna foto finta di persone vere.
- **Animazioni** con motion: gli ingressi delle sezioni, le card dei match che entrano in sequenza, l'animazione del "match" (due biglietti che si uniscono) e il contatore delle ore.

### Struttura dei file

```
src/
  app/                    route Next (sito vetrina, /en/, legali, /app/…)
  site/                   componenti del sito vetrina
  ui/                     componenti condivisi dell'app (Avatar, Ticket, SkillChip, Sheet…)
  features/               schermate dell'app (home, esplora, persone, scambi, chat, calendario, ore, profilo, premium)
  domain/                 logica pura e testata: geo, matching, triadi, banca ore, badge, limiti del piano, generatore dei profili, rng
  content/                catalogo competenze (id e categoria), comuni, forma dell'Italia
  i18n/
    it/ en/               messages.ts (interfaccia), skills.ts (nomi delle competenze), categories.ts, content.ts (bio, frasi della chat)
    index.ts              useT(), formattazione di date e numeri, cambio lingua
  providers/              payments.tsx, account.tsx, video.tsx (prese demo)
  store/                  Zustand persistito: utente, scambi, chat, movimenti ore, piano, impostazioni
```

### Dati

- **Competenze:** `{ id, cat, tags?, online: boolean }`. I nomi stanno in `i18n/<lingua>/skills.ts`, indicizzati per id. Le 14 categorie sono: lingue, informatica e tecnologia, musica, sport e movimento, cucina, casa e fai da te, studio e ripetizioni, arte e creatività, benessere, giardinaggio e natura, lavoro e carriera, moda e cucito, famiglia e animali, motori e mobilità.
- **Comuni:** `[nome, siglaProvincia, regione, lat, lon, popolazione]`. La popolazione pesa quante persone generare in ogni comune.
- **Profili:** generati con mulberry32 e un seme fisso. Ogni profilo ha nome e cognome (liste italiane, con un 10% di nomi stranieri per realismo), comune e quartiere, da 2 a 5 competenze offerte con il livello (base, intermedio, avanzato, esperto) e da 1 a 4 cercate, disponibilità su una griglia di 7 giorni per 3 fasce, modalità, lingue parlate, valutazione e recensioni, ore date e ricevute, badge, Premium (circa il 12%), data di iscrizione, verificato. La bio è composta da frammenti nella lingua corrente.

### Abbinamento

La funzione `score(me, other, ctx)` restituisce `{ total, reasons[] }`:

- Lo **scambio diretto** ("perfect") vale molto: esiste una competenza che io offro e l'altro cerca, **e** una che l'altro offre e io cerco.
- Vale meno se il bisogno va in una sola direzione.
- La **distanza** riduce il punteggio in modo lineare dentro il raggio.
- Contano anche la **sovrapposizione delle disponibilità**, il **livello** (avanzato o esperto conta di più), la **valutazione** e la **modalità** compatibile.
- I profili **Premium in evidenza** salgono in classifica e hanno l'etichetta "In evidenza".
- Le **triadi** sono cicli di lunghezza 3 tra le persone nel raggio. La ricerca è limitata: per ogni B che cerca qualcosa che offro, si cerca un C che offre quello che cerco io e cerca quello che offre B.

### Piani e limiti

| | Gratis | Premium mensile | Premium annuale |
|---|---|---|---|
| Prezzo | 0 € | 4,99 €/mese | 39,99 €/anno (-33%) |
| Nuove proposte al mese | 3 | illimitate | illimitate |
| Scambi attivi insieme | 2 | illimitati | illimitati |
| Raggio massimo | 25 km | 150 km | 150 km |
| Profilo in evidenza | no | sì | sì |
| Scambi a tre, filtri avanzati, chi ha visto il profilo | no | sì | sì |

Ci sono 14 giorni di prova gratuita. Il checkout demo è nella presa dei pagamenti.

### Banca del tempo

Si parte con 2 ore di benvenuto. Insegnare un'ora dà +1, ricevere un'ora toglie 1. Il saldo può scendere fino a −3 ("fido di quartiere"), poi si possono solo dare ore. Una proposta "diretta" (1:1) pareggia: entrambi danno e ricevono la stessa durata.

### Flusso dello scambio

Proposta (do X, ricevo Y, durata, 2 o 3 orari proposti, messaggio) → l'altra persona risponde in modo simulato dopo 2–6 s: accetta (70%), propone un altro orario (20%) o rifiuta (10%), sempre con una frase nella lingua corrente. Quando lo scambio è accettato nasce un appuntamento nel calendario. Dopo l'orario, oppure con "segna come fatto" nella demo, lo scambio si conclude, si muovono le ore, si lascia una recensione e si sbloccano i badge. Ci sono anche 3 proposte in arrivo già pronte dopo l'onboarding.

### Onboarding

È in 5 passi: nome, comune e raggio, cosa sai fare (con il livello), cosa vuoi imparare, disponibilità. Si può anche saltare tutto ed entrare come "ospite demo", con un profilo già compilato (Giulia, a Bologna).

### Lingue

`useT()` legge la lingua dallo store (rilevata da `navigator.language` e poi scelta dall'utente). Il sito vetrina è prerenderizzato in due versioni: `/` in italiano e `/en/` in inglese. Le pagine legali esistono solo in italiano, con una nota per chi legge in inglese. Un test verifica che le chiavi delle due lingue siano identiche e che ogni competenza abbia il nome in entrambe.

### Test

Vitest su: geo (haversine, comuni nel raggio), rng e generatore (determinismo, niente duplicati, competenze offerte diverse da quelle cercate), matching (casi diretto e parziale, ordinamento, effetto del Premium), triadi, banca del tempo, limiti del piano, badge, parità delle traduzioni, service worker, e test di rendering delle prese e di alcune schermate.

## Lasciato a chi costruisce

Il testo dei contenuti, il numero esatto delle competenze per categoria, le micro-interazioni e la disposizione delle singole schermate.
