# Baratto Skill — piano di implementazione

> **Per chi esegue:** esecuzione "Native" (un'unica sessione, task dopo task), con una revisione finale. Gli step usano le caselle `- [ ]`.

**Obiettivo:** il sito vetrina e la PWA di Baratto Skill, pubblicati su GitHub Pages.

**Architettura:** Next.js 16 con esportazione statica. La logica pura sta in `src/domain` ed è testata con Vitest. I dati dimostrativi si generano nel client con un seme fisso. Lo stato vive in Zustand, salvato in localStorage. Le traduzioni sono file TypeScript tipizzati, uno per lingua.

**Stack:** Next 16, React 19, TypeScript, Tailwind 4, motion, lucide-react, Zustand 5, Vitest 5 con jsdom, `@fontsource-variable/fraunces` e `inter`, `world-atlas` e `topojson-client`, `d3-geo` (solo nello script degli asset).

**Spec:** `docs/superpowers/specs/2026-11-15-baratto-skill-design.md`

## Vincoli globali

- `output: 'export'`, `trailingSlash: true`, `basePath` preso da `NEXT_PUBLIC_BASE_PATH`. Ogni URL di un asset passa da `assetUrl()`.
- Nessuna route dinamica: i dettagli si aprono con la query string (`?id=`) dentro un `<Suspense>`.
- Ogni testo visibile nell'app passa da `t()`. `en` ha le stesse chiavi di `it` (`Messages` è un tipo derivato da `it`).
- Piani: Gratis con 3 proposte al mese, 2 scambi attivi e un raggio massimo di 25 km. Premium mensile a 4,99 €, annuale a 39,99 €, raggio fino a 150 km, 14 giorni di prova.
- Banca del tempo: 2 ore di benvenuto, saldo minimo −3.
- I profili si generano con il seme `20261115`. Lo stesso seme deve dare sempre lo stesso risultato.

## Punti da controllare in revisione

1. **Comune non trovato, o ricerca con gli accenti** ("forli" deve trovare Forlì): la ricerca normalizza i diacritici (test in Task 2).
2. **Utente Gratis che imposta il raggio a 100 km:** il valore viene limitato a 25 e compare l'invito al Premium (test in Task 4).
3. **Saldo a −3 e nuova proposta in cui ricevo più ore di quante ne do:** la proposta è bloccata con un messaggio chiaro (test in Task 4).
4. **localStorage vuoto o corrotto, o una versione vecchia dello store:** l'app riparte dall'onboarding senza schermata bianca. Lo store ha `version` e `migrate` (test in Task 5).
5. **Una competenza cercata uguale a una offerta:** nell'onboarding non si può selezionare, e il generatore non la produce mai (test in Task 3).

---

### Task 1: Scaffold, configurazione e design system

**File:** `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `vitest.config.ts`, `tests/setup.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/{asset,cx,theme,registerSw}.ts(x)`, `scripts/generate-sw.mjs` (adattato dal riferimento, con il prefisso della cache `bs-`), `scripts/serve-out.mjs`, `tests/scripts/sw.test.ts`, `.gitignore`

- [ ] Configurazione copiata dal riferimento. I token CSS seguono la spec: carta, inchiostro, pomodoro, basilico, zafferano, lavanda, con il tema scuro. `--font-display` è Fraunces.
- [ ] Test del service worker: `buildServiceWorker` con il prefisso `/baratto-skill` include `/baratto-skill/app/` e salta `sw.js`.
- [ ] `npm test` passa, poi commit.

### Task 2: Contenuti — competenze, categorie e comuni

**File:** `src/content/{categories,skills,comuni}.ts`, `src/i18n/{it,en}/{skills,categories}.ts`, `src/domain/geo.ts`, `tests/content/*.test.ts`, `tests/domain/geo.test.ts`

**Produce:**
- `CATEGORIES: CategoryDef[]` con `{ id: CategoryId, color: string, icon: string }`.
- `SKILLS: SkillDef[]` con `{ id: string, cat: CategoryId, online: boolean }` e `skillById(id)`.
- `COMUNI: Comune[]` con `{ id, name, prov, region, lat, lon, pop }` e `comuneById(id)`.
- `haversineKm(a, b)`, `searchComuni(q, limit)` e `comuniWithin(center, km)`.

- [ ] Test: almeno 400 competenze; id unici; ogni categoria ha almeno 20 competenze; ogni id ha il nome in `it` e in `en`; almeno 250 comuni; Milano–Roma tra 470 e 490 km; `searchComuni('forli')[0].name === 'Forlì'`.
- [ ] Implementazione, test verdi, commit.

### Task 3: Generatore dei profili

**File:** `src/domain/{rng,people,names}.ts`, `src/i18n/{it,en}/content.ts` (frammenti delle bio), `tests/domain/people.test.ts`

**Produce:** `Person` con `{ id, first, last, comuneId, lat, lon, offers: SkillLevel[], wants: string[], avail: number /* bitmask 21 */, mode, langs, rating, reviews, hoursGiven, hoursReceived, premium, verified, joined, bioSeed, badges }`, più `getPeople(): Person[]` (memoizzata, 1.200 persone) e `personById(id)`.

- [ ] Test: il risultato è deterministico; ci sono 1.200 persone; le competenze offerte e cercate non si sovrappongono mai; tutti i comuni esistono; il Premium è tra l'8% e il 16%.
- [ ] Implementazione, commit.

### Task 4: Dominio — abbinamento, triadi, ore, piani e badge

**File:** `src/domain/{matching,triads,timebank,plans,badges}.ts` e i test relativi

**Produce:**
- `scoreMatch(me: Me, p: Person, distKm): Match` con `{ person, distKm, score, kind: 'perfect' | 'theyCanTeach' | 'theyWantMine' | 'none', give: string[], get: string[], availOverlap }`.
- `findMatches(me, people, opts: { center, radiusKm, skill?, cat?, minLevel?, mode?, availOnly?, sort })`.
- `findTriads(me, people, center, radiusKm, limit)`.
- `PLANS`, `limitsFor(plan)`, `canPropose(state)`, `clampRadius(plan, km)`.
- `balance(ledger)` e `canAfford(balance, deltaHours)` (con il minimo a −3).
- `BADGES` e `earnedBadges(stats)`.

- [ ] Test: lo scambio diretto batte quello parziale; a parità di punteggio il Premium sta prima; chi è fuori dal raggio è escluso; la triade trovata è un ciclo valido; `clampRadius('free', 100) === 25`; con 3 proposte nel mese `canPropose` è false per Gratis e true per Premium; `canAfford(-3, -1)` è false.
- [ ] Commit.

### Task 5: Store, i18n e prese demo

**File:** `src/store/app.ts`, `src/i18n/{index.ts,it/messages.ts,en/messages.ts}`, `src/providers/{payments,account,video}.tsx`, `tests/i18n/parity.test.ts`, `tests/store/app.test.ts`, `tests/providers/*.test.tsx`

**Produce:**
- `useApp`, che contiene `me`, `exchanges`, `threads`, `ledger`, `plan`, `settings` (lingua e tema) e `views`, con le azioni `completeOnboarding`, `enterDemo`, `propose`, `respond`, `complete`, `review`, `sendMessage`, `setPlan`, `reset`.
- `useT()` restituisce `{ t, lang, fmtDate, fmtNum, skillName, catName }`.

- [ ] Test: le chiavi delle due lingue coincidono; uno store salvato in modo corrotto non fa crollare l'app (si riparte da `me === null`); `propose` oltre il limite restituisce `'limit'`; il checkout demo, quando va a buon fine, porta a `plan === 'premium-monthly'`.
- [ ] Commit.

### Task 6: Sito vetrina, `/en/` e pagine legali

**File:** `src/site/*`, `src/app/page.tsx`, `src/app/en/page.tsx`, `src/app/{privacy,cookie,termini}/page.tsx`, `src/app/manifest.ts`, `public/icons/*` (generate da `scripts/build-assets.ts`), `src/content/italy.ts` (il percorso SVG, generato dallo stesso script)

- [ ] Sezioni: hero con biglietti di scambio animati; "come funziona" in 3 passi; una demo interattiva di abbinamento (scegli cosa sai fare e cosa cerchi, e appaiono le persone); la mappa dell'Italia con i punti; le categorie con il conteggio; la banca del tempo; i prezzi; le FAQ; la chiamata all'azione e il footer.
- [ ] Test di rendering della home (titolo e link a `/app/`), poi commit.

### Task 7: L'app

**File:** `src/app/app/**/page.tsx`, `src/features/**`, `src/ui/**`

Le schermate sono: onboarding, home, esplora (catalogo e dettaglio di una competenza), persone (lista e mappa con raggio e filtri), persona, scambi e scambio, chat, calendario (con l'esportazione `.ics`), ore, profilo (modifica, badge, recensioni, impostazioni) e premium.

- [ ] Test di rendering per l'onboarding (si va avanti di passo) e per la home con l'ospite demo. Commit dopo ogni gruppo di schermate.

### Task 8: Verifica, pubblicazione e README

- [ ] `npm test`, `npm run typecheck` e `npm run build` con `NEXT_PUBLIC_BASE_PATH=/baratto-skill` passano.
- [ ] Controllo nel browser integrato a 375×812 e su desktop, sul sito e su ogni schermata dell'app.
- [ ] `.github/workflows/deploy.yml`, README in italiano, `gh repo create backinbusinesss/baratto-skill --public`, push, attivazione delle Pages e controllo dell'URL pubblico.
