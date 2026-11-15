'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { comuneById } from '@/content/comuni'
import { findMatches } from '@/domain/matching'
import { generateNeighbors, getPeople, personById as basePersonById } from '@/domain/people'
import { canPropose, clampRadius, type PlanId, type ProposeCheck } from '@/domain/plans'
import { hashString, mulberry32, pick } from '@/domain/rng'
import { bestSlots } from '@/domain/slots'
import { balance, canAfford, exchangeDelta, type LedgerEntry, WELCOME_HOURS } from '@/domain/timebank'
import { availBit, type Me, type Mode, type Person } from '@/domain/types'
import { detectLang, getT, interpolate, type Lang } from '@/i18n'
import { skillPhrase } from '@/i18n/compose'
import { safeStorage } from '@/lib/storage'

export type Theme = 'system' | 'light' | 'dark'
export type ExchangeStatus = 'pending' | 'accepted' | 'countered' | 'declined' | 'completed' | 'cancelled'
export type Outcome = 'accept' | 'counter' | 'decline'

export interface Review {
  stars: number
  text: string
  tags: string[]
  at: string
}

export interface Exchange {
  id: string
  personId: string
  /** out = l'ho proposto io, in = me l'hanno proposto */
  direction: 'out' | 'in'
  status: ExchangeStatus
  createdAt: string
  /** competenza che insegno io (null = pago in ore) */
  give: string | null
  /** competenza che imparo io (null = regalo di ore) */
  get: string | null
  giveHours: number
  getHours: number
  slots: string[]
  slot: string | null
  mode: 'live' | 'online'
  /** quando arriverà la risposta simulata (ms), solo per le proposte inviate in attesa */
  replyAt?: number
  outcome?: Outcome
  myReview?: Review
  theirReview?: Review
  completedAt?: string
}

export interface ChatMessage {
  id: string
  from: 'me' | 'them' | 'system'
  /** testo libero (me/them) oppure chiave di chat.system.* (system) */
  text: string
  vars?: Record<string, string>
  at: string
}

export interface Settings {
  lang: Lang
  theme: Theme
}

export interface AppData {
  version: 1
  me: Me | null
  neighbors: Person[]
  exchanges: Exchange[]
  threads: Record<string, ChatMessage[]>
  unread: Record<string, number>
  /** risposte automatiche in arrivo: persona → istante (ms) */
  pendingReplies: Record<string, number>
  ledger: LedgerEntry[]
  plan: PlanId
  planSince: string | null
  saved: string[]
  messagesSent: number
  settings: Settings
}

/** Eventi prodotti dal simulatore, per i toast. */
export type SimEvent =
  | { type: 'accepted' | 'countered' | 'declined'; personId: string; exchangeId: string }
  | { type: 'message'; personId: string }

export interface ProposeInput {
  personId: string
  give: string | null
  get: string | null
  hours: number
  slots: string[]
  mode: 'live' | 'online'
  note: string
}

export type ProposeResult = ProposeCheck | 'balance'

export interface AppActions {
  completeOnboarding(me: Me): void
  enterDemo(): void
  updateMe(patch: Partial<Me>): void
  propose(input: ProposeInput, now?: number): { result: ProposeResult; id?: string }
  respond(id: string, accept: boolean, slot?: string): void
  acceptCounter(id: string): void
  cancel(id: string): void
  complete(id: string): void
  review(id: string, r: Omit<Review, 'at'>): void
  sendMessage(personId: string, text: string, now?: number): void
  markRead(personId: string): void
  toggleSaved(personId: string): void
  setPlan(plan: PlanId): void
  setLang(lang: Lang): void
  setTheme(theme: Theme): void
  /** fa avanzare la simulazione: risposte alle proposte e messaggi automatici */
  tick(now?: number): SimEvent[]
  reset(): void
}

export type AppState = AppData & AppActions

export const STORAGE_KEY = 'baratto-skill:v1'

export function initialData(lang: Lang = 'it'): AppData {
  return {
    version: 1,
    me: null,
    neighbors: [],
    exchanges: [],
    threads: {},
    unread: {},
    pendingReplies: {},
    ledger: [],
    plan: 'free',
    planSince: null,
    saved: [],
    messagesSent: 0,
    settings: { lang, theme: 'system' },
  }
}

let counter = 0
export const uid = (p: string) => `${p}${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`
const iso = (ms: number) => new Date(ms).toISOString()

/** Cerca una persona tra quelle demo e quelle del vicinato dell'utente. */
export function findPerson(neighbors: Person[], id: string): Person | undefined {
  return neighbors.find((p) => p.id === id) ?? basePersonById(id)
}

export const allPeople = (neighbors: Person[]) => (neighbors.length ? [...getPeople(), ...neighbors] : getPeople())

export const isActive = (e: Exchange) => e.status === 'pending' || e.status === 'accepted' || e.status === 'countered'

/** Scambi che occupano un posto del piano: confermati, o proposti da me e in attesa. */
export const countsTowardLimit = (e: Exchange) => e.status === 'accepted' || (e.direction === 'out' && (e.status === 'pending' || e.status === 'countered'))

export function proposalsThisMonth(exchanges: Exchange[], now = Date.now()): number {
  const key = iso(now).slice(0, 7)
  return exchanges.filter((e) => e.direction === 'out' && e.createdAt.slice(0, 7) === key).length
}

/** Esito simulato, deterministico per proposta: 70% sì, 20% altro orario, 10% no. */
export function outcomeFor(id: string): Outcome {
  const r = mulberry32(hashString(id))()
  return r < 0.7 ? 'accept' : r < 0.9 ? 'counter' : 'decline'
}

function sys(text: string, vars: Record<string, string> | undefined, at: number): ChatMessage {
  return { id: uid('m'), from: 'system', text, vars, at: iso(at) }
}

function push(threads: Record<string, ChatMessage[]>, personId: string, ...msgs: ChatMessage[]) {
  return { ...threads, [personId]: [...(threads[personId] ?? []), ...msgs] }
}

/** Valida i dati letti dal disco: se qualcosa non torna si riparte da capo. */
export function sanitize(raw: unknown, lang: Lang = 'it'): AppData {
  const base = initialData(lang)
  if (!raw || typeof raw !== 'object') return base
  const d = raw as Partial<AppData>
  if (d.version !== 1) return base
  const meOk =
    d.me === null ||
    (!!d.me &&
      typeof d.me.name === 'string' &&
      Array.isArray(d.me.offers) &&
      Array.isArray(d.me.wants) &&
      !!comuneById(d.me.comuneId ?? ''))
  if (!meOk) return base
  return {
    ...base,
    ...d,
    me: d.me ?? null,
    neighbors: Array.isArray(d.neighbors) ? d.neighbors : [],
    exchanges: Array.isArray(d.exchanges) ? d.exchanges : [],
    threads: d.threads && typeof d.threads === 'object' ? d.threads : {},
    unread: d.unread && typeof d.unread === 'object' ? d.unread : {},
    pendingReplies: d.pendingReplies && typeof d.pendingReplies === 'object' ? d.pendingReplies : {},
    ledger: Array.isArray(d.ledger) ? d.ledger : [],
    saved: Array.isArray(d.saved) ? d.saved : [],
    plan: d.plan === 'premium-monthly' || d.plan === 'premium-yearly' ? d.plan : 'free',
    settings: {
      lang: d.settings?.lang === 'en' ? 'en' : d.settings?.lang === 'it' ? 'it' : lang,
      theme: d.settings?.theme === 'light' || d.settings?.theme === 'dark' ? d.settings.theme : 'system',
    },
  }
}

/** Il profilo demo di Giulia, a Bologna: serve a provare l'app senza compilare nulla. */
export function demoMe(): Me {
  let avail = 0
  for (let d = 0; d < 5; d++) avail |= availBit(d, 2)
  avail |= availBit(5, 0) | availBit(5, 1) | availBit(6, 0) | availBit(2, 1)
  return {
    name: 'Giulia',
    comuneId: 'bologna',
    radiusKm: 15,
    offers: [
      { id: 'english', level: 3 },
      { id: 'fresh-pasta', level: 4 },
      { id: 'photography', level: 2 },
      { id: 'canva', level: 3 },
    ],
    wants: ['pc-repair', 'guitar', 'yoga', 'bike-repair'],
    avail,
    mode: 'both',
    bio: '',
    langs: ['it', 'en'],
    hue: 12,
    joined: '2026-09-02',
  }
}

/** Crea uno scambio "in arrivo" da una persona del vicinato, con il suo messaggio. */
function incomingFrom(p: Person, me: Me, lang: Lang, now: number, threads: Record<string, ChatMessage[]>) {
  const tr = getT(lang)
  const give = me.offers.find((o) => p.wants.includes(o.id))?.id ?? null
  const get = p.offers.find((o) => me.wants.includes(o.id))?.id ?? null
  const id = uid('x')
  const ex: Exchange = {
    id,
    personId: p.id,
    direction: 'in',
    status: 'pending',
    createdAt: iso(now),
    give,
    get,
    giveHours: give ? 1 : 0,
    getHours: get ? 1 : 0,
    slots: bestSlots(me.avail, p.avail, new Date(now), 3),
    slot: null,
    mode: p.mode === 'online' ? 'online' : 'live',
  }
  const rng = mulberry32(hashString(id))
  const text = interpolate(pick(rng, tr.c.incoming), {
    name: me.name,
    give: give ? skillPhrase(tr, give) : '…',
    get: get ? skillPhrase(tr, get) : '…',
  })
  const t = push(threads, p.id, sys('incoming', { name: p.first }, now), {
    id: uid('m'),
    from: 'them',
    text,
    at: iso(now + 1000),
  })
  return { ex, threads: t }
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData(detectLang()),

      completeOnboarding(me) {
        const now = Date.now()
        const lang = get().settings.lang
        const neighbors = generateNeighbors(me, me.comuneId, `${me.name}:${now}`, 40, me.radiusKm)
        let threads: Record<string, ChatMessage[]> = {}
        const center = comuneById(me.comuneId)!
        const perfect = findMatches(me, neighbors, { center, radiusKm: me.radiusKm }).filter((m) => m.kind === 'perfect')
        const exchanges: Exchange[] = []
        for (const m of perfect.slice(0, 2)) {
          const r = incomingFrom(m.person, me, lang, now, threads)
          exchanges.push(r.ex)
          threads = r.threads
        }
        set({
          ...initialData(lang),
          settings: get().settings,
          me: { ...me, joined: me.joined || iso(now).slice(0, 10) },
          neighbors,
          exchanges,
          threads,
          unread: Object.fromEntries(exchanges.map((e) => [e.personId, 1])),
          ledger: [{ id: uid('l'), at: iso(now), hours: WELCOME_HOURS, kind: 'welcome' }],
        })
      },

      enterDemo() {
        const now = Date.now()
        const lang = get().settings.lang
        const tr = getT(lang)
        const me = { ...demoMe(), bio: lang === 'it'
          ? 'Faccio la fotografa e cucino pasta fresca come la mia nonna. Ho vissuto due anni a Dublino: l’inglese è la mia seconda casa. Cerco qualcuno che mi salvi dal PC e mi insegni due accordi di chitarra!'
          : 'I’m a photographer and I make fresh pasta like my grandma. I lived in Dublin for two years: English is my second home. Looking for someone to rescue me from my PC and teach me a few guitar chords!' }
        const neighbors = generateNeighbors(me, me.comuneId, 'giulia-demo', 48, me.radiusKm)
        const center = comuneById(me.comuneId)!
        const ms = findMatches(me, neighbors, { center, radiusKm: me.radiusKm })
        const perfect = ms.filter((m) => m.kind === 'perfect')
        const teach = ms.filter((m) => m.kind === 'theyTeach')
        const learn = ms.filter((m) => m.kind === 'theyLearn')
        let threads: Record<string, ChatMessage[]> = {}
        const exchanges: Exchange[] = []
        const ledger: LedgerEntry[] = [
          { id: uid('l'), at: iso(now - 60 * 86400000), hours: WELCOME_HOURS, kind: 'welcome' },
        ]
        const DAY = 86400000
        const day = (n: number, h: number) => {
          const d = new Date(now + n * DAY)
          d.setHours(h, 0, 0, 0)
          return d
        }
        const local = (d: Date) => {
          const p = (x: number) => String(x).padStart(2, '0')
          return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:00`
        }
        // tre scambi conclusi nelle settimane passate, con recensioni
        const pastPeople = [perfect[2], teach[0], learn[0]].filter(Boolean)
        pastPeople.forEach((m, i) => {
          const p = m.person
          const give = m.give[0] ?? null
          const getS = m.get[0]?.id ?? null
          const when = day(-(9 + i * 11), i === 1 ? 10 : 19)
          const id = uid('x')
          const giveHours = give ? 1 + (i === 2 ? 0.5 : 0) : 0
          const getHours = getS ? 1 : 0
          exchanges.push({
            id,
            personId: p.id,
            direction: i === 1 ? 'out' : 'in',
            status: 'completed',
            createdAt: iso(when.getTime() - 5 * DAY),
            give,
            get: getS,
            giveHours,
            getHours,
            slots: [local(when)],
            slot: local(when),
            mode: 'live',
            completedAt: iso(when.getTime() + 2 * 3600000),
            myReview: { stars: 5, text: tr.c.reviews[(i * 5) % tr.c.reviews.length].replace('{skill}', getS ? skillPhrase(tr, getS) : '…'), tags: [tr.m.review.tags[i], tr.m.review.tags[i + 2]], at: iso(when.getTime() + 3 * 3600000) },
            theirReview: { stars: i === 1 ? 4 : 5, text: tr.c.reviews[(i * 3 + 1) % tr.c.reviews.length].replace('{skill}', give ? skillPhrase(tr, give) : '…'), tags: [], at: iso(when.getTime() + 5 * 3600000) },
          })
          if (giveHours) ledger.push({ id: uid('l'), at: iso(when.getTime() + 2 * 3600000), hours: giveHours, kind: 'gave', exchangeId: id, personId: p.id, skill: give! })
          if (getHours) ledger.push({ id: uid('l'), at: iso(when.getTime() + 2 * 3600000), hours: -getHours, kind: 'received', exchangeId: id, personId: p.id, skill: getS! })
          threads = push(
            threads,
            p.id,
            { id: uid('m'), from: 'them', text: tr.c.replies[i], at: iso(when.getTime() - 4 * DAY) },
            { id: uid('m'), from: 'me', text: tr.c.replies[(i + 4) % tr.c.replies.length], at: iso(when.getTime() - 4 * DAY + 600000) },
            sys('accepted', { when: tr.slot(local(when)) }, when.getTime() - 3 * DAY),
            sys('completed', {}, when.getTime() + 2 * 3600000),
            { id: uid('m'), from: 'them', text: tr.c.replies[5], at: iso(when.getTime() + 3 * 3600000) },
          )
        })
        // uno scambio confermato tra due giorni
        const up = perfect[0]
        if (up) {
          const when = day(2, 19)
          const id = uid('x')
          exchanges.push({
            id,
            personId: up.person.id,
            direction: 'out',
            status: 'accepted',
            createdAt: iso(now - 2 * DAY),
            give: up.give[0],
            get: up.get[0].id,
            giveHours: 1,
            getHours: 1,
            slots: [local(when)],
            slot: local(when),
            mode: 'live',
          })
          threads = push(
            threads,
            up.person.id,
            sys('proposal', {}, now - 2 * DAY),
            { id: uid('m'), from: 'them', text: interpolate(tr.c.accept[0], { when: tr.slot(local(when)) }), at: iso(now - 2 * DAY + 3600000) },
            sys('accepted', { when: tr.slot(local(when)) }, now - 2 * DAY + 3600000),
            { id: uid('m'), from: 'me', text: tr.c.replies[3], at: iso(now - DAY) },
            { id: uid('m'), from: 'them', text: tr.c.replies[2], at: iso(now - DAY + 900000) },
          )
        }
        // due proposte in arrivo
        for (const m of [perfect[1], perfect[3] ?? learn[1]].filter(Boolean)) {
          const r = incomingFrom(m.person, me, lang, now - 3 * 3600000, threads)
          exchanges.push(r.ex)
          threads = r.threads
        }
        set({
          ...initialData(lang),
          settings: get().settings,
          me,
          neighbors,
          exchanges,
          threads,
          unread: Object.fromEntries(exchanges.filter((e) => e.direction === 'in' && e.status === 'pending').map((e) => [e.personId, 1])),
          ledger,
          saved: teach.slice(1, 3).map((m) => m.person.id),
          messagesSent: 7,
        })
      },

      updateMe(patch) {
        const s = get()
        if (!s.me) return
        const me = { ...s.me, ...patch }
        me.radiusKm = clampRadius(s.plan, me.radiusKm)
        let neighbors = s.neighbors
        if (patch.comuneId && patch.comuneId !== s.me.comuneId && !neighbors.some((p) => p.comuneId === patch.comuneId)) {
          neighbors = [...neighbors, ...generateNeighbors(me, patch.comuneId, `${me.name}:${patch.comuneId}`, 40, me.radiusKm)]
        }
        set({ me, neighbors })
      },

      propose(input, now = Date.now()) {
        const s = get()
        const check = canPropose({
          plan: s.plan,
          proposalsThisMonth: proposalsThisMonth(s.exchanges, now),
          activeExchanges: s.exchanges.filter(countsTowardLimit).length,
        })
        if (check !== 'ok') return { result: check }
        const giveHours = input.give ? input.hours : 0
        const getHours = input.get ? input.hours : 0
        if (!canAfford(balance(s.ledger), exchangeDelta(giveHours, getHours))) return { result: 'balance' }
        const p = findPerson(s.neighbors, input.personId)
        const id = uid('x')
        const ex: Exchange = {
          id,
          personId: input.personId,
          direction: 'out',
          status: 'pending',
          createdAt: iso(now),
          give: input.give,
          get: input.get,
          giveHours,
          getHours,
          slots: input.slots,
          slot: null,
          mode: input.mode,
          outcome: outcomeFor(id),
          // risposta simulata tra 4 e 9 secondi
          replyAt: now + 4000 + (hashString(id) % 5000),
        }
        let threads = push(s.threads, input.personId, sys('proposal', {}, now))
        if (input.note.trim()) threads = push(threads, input.personId, { id: uid('m'), from: 'me', text: input.note.trim(), at: iso(now + 1) })
        set({ exchanges: [ex, ...s.exchanges], threads, messagesSent: s.messagesSent + (input.note.trim() ? 1 : 0) })
        void p
        return { result: 'ok', id }
      },

      respond(id, accept, slot) {
        const s = get()
        const now = Date.now()
        const ex = s.exchanges.find((e) => e.id === id)
        if (!ex) return
        const chosen = slot ?? ex.slots[0] ?? null
        const tr = getT(s.settings.lang)
        set({
          exchanges: s.exchanges.map((e) => (e.id === id ? { ...e, status: accept ? 'accepted' : 'declined', slot: accept ? chosen : null } : e)),
          threads: push(
            s.threads,
            ex.personId,
            accept && chosen ? sys('accepted', { when: tr.slot(chosen) }, now) : sys('declined', {}, now),
          ),
          pendingReplies: accept ? { ...s.pendingReplies, [ex.personId]: now + 2500 } : s.pendingReplies,
        })
      },

      acceptCounter(id) {
        const s = get()
        const ex = s.exchanges.find((e) => e.id === id)
        if (!ex || !ex.slot) return
        const tr = getT(s.settings.lang)
        set({
          exchanges: s.exchanges.map((e) => (e.id === id ? { ...e, status: 'accepted' } : e)),
          threads: push(s.threads, ex.personId, sys('accepted', { when: tr.slot(ex.slot) }, Date.now())),
        })
      },

      cancel(id) {
        set({ exchanges: get().exchanges.map((e) => (e.id === id && isActive(e) ? { ...e, status: 'cancelled', replyAt: undefined } : e)) })
      },

      complete(id) {
        const s = get()
        const now = Date.now()
        const ex = s.exchanges.find((e) => e.id === id)
        if (!ex || ex.status !== 'accepted') return
        const tr = getT(s.settings.lang)
        const rng = mulberry32(hashString(id + 'review'))
        const ledger = [...s.ledger]
        if (ex.giveHours) ledger.push({ id: uid('l'), at: iso(now), hours: ex.giveHours, kind: 'gave', exchangeId: id, personId: ex.personId, skill: ex.give ?? undefined })
        if (ex.getHours) ledger.push({ id: uid('l'), at: iso(now), hours: -ex.getHours, kind: 'received', exchangeId: id, personId: ex.personId, skill: ex.get ?? undefined })
        const theirReview: Review = {
          stars: rng() < 0.8 ? 5 : 4,
          text: interpolate(pick(rng, tr.c.reviews), { skill: ex.give ? skillPhrase(tr, ex.give) : skillPhrase(tr, ex.get ?? 'english') }),
          tags: [],
          at: iso(now + 60000),
        }
        set({
          ledger,
          exchanges: s.exchanges.map((e) => (e.id === id ? { ...e, status: 'completed', completedAt: iso(now), theirReview } : e)),
          threads: push(s.threads, ex.personId, sys('completed', {}, now)),
          pendingReplies: { ...s.pendingReplies, [ex.personId]: now + 3000 },
        })
      },

      review(id, r) {
        set({ exchanges: get().exchanges.map((e) => (e.id === id ? { ...e, myReview: { ...r, at: iso(Date.now()) } } : e)) })
      },

      sendMessage(personId, text, now = Date.now()) {
        const s = get()
        const body = text.trim()
        if (!body) return
        set({
          threads: push(s.threads, personId, { id: uid('m'), from: 'me', text: body, at: iso(now) }),
          messagesSent: s.messagesSent + 1,
          // risponde dopo 2–5 secondi (se non sta già per rispondere)
          pendingReplies: s.pendingReplies[personId] ? s.pendingReplies : { ...s.pendingReplies, [personId]: now + 2000 + (hashString(body) % 3000) },
        })
      },

      markRead(personId) {
        const u = get().unread
        if (!u[personId]) return
        const { [personId]: _, ...rest } = u
        set({ unread: rest })
      },

      toggleSaved(personId) {
        const saved = get().saved
        set({ saved: saved.includes(personId) ? saved.filter((x) => x !== personId) : [...saved, personId] })
      },

      setPlan(plan) {
        const s = get()
        set({
          plan,
          planSince: plan === 'free' ? null : iso(Date.now()),
          me: s.me && plan === 'free' ? { ...s.me, radiusKm: clampRadius('free', s.me.radiusKm) } : s.me,
        })
      },

      setLang(lang) {
        set({ settings: { ...get().settings, lang } })
      },

      setTheme(theme) {
        set({ settings: { ...get().settings, theme } })
      },

      tick(now = Date.now()) {
        const s = get()
        const events: SimEvent[] = []
        const tr = getT(s.settings.lang)
        let threads = s.threads
        let unread = s.unread
        let changed = false
        const exchanges = s.exchanges.map((e) => {
          if (e.direction !== 'out' || e.status !== 'pending' || !e.replyAt || e.replyAt > now) return e
          changed = true
          const outcome = e.outcome ?? outcomeFor(e.id)
          const rng = mulberry32(hashString(e.id + 'reply'))
          const p = findPerson(s.neighbors, e.personId)
          let next: Exchange
          let text: string
          if (outcome === 'accept') {
            const slot = e.slots[Math.floor(rng() * e.slots.length)] ?? null
            next = { ...e, status: 'accepted', slot, replyAt: undefined }
            text = interpolate(pick(rng, tr.c.accept), { when: slot ? tr.slot(slot) : '' })
            threads = push(threads, e.personId, { id: uid('m'), from: 'them', text, at: iso(now) }, sys('accepted', { when: slot ? tr.slot(slot) : '' }, now + 1))
          } else if (outcome === 'counter') {
            const me = s.me
            const alt = me && p ? bestSlots(me.avail, p.avail, new Date(now + 3 * 86400000), 1)[0] : null
            const slot = alt ?? e.slots[0] ?? null
            next = { ...e, status: 'countered', slot, replyAt: undefined }
            text = interpolate(pick(rng, tr.c.counter), { when: slot ? tr.slot(slot) : '' })
            threads = push(threads, e.personId, { id: uid('m'), from: 'them', text, at: iso(now) }, sys('countered', { when: slot ? tr.slot(slot) : '' }, now + 1))
          } else {
            next = { ...e, status: 'declined', replyAt: undefined }
            text = pick(rng, tr.c.decline)
            threads = push(threads, e.personId, { id: uid('m'), from: 'them', text, at: iso(now) }, sys('declined', {}, now + 1))
          }
          unread = { ...unread, [e.personId]: (unread[e.personId] ?? 0) + 1 }
          events.push({ type: outcome === 'accept' ? 'accepted' : outcome === 'counter' ? 'countered' : 'declined', personId: e.personId, exchangeId: e.id })
          return next
        })
        const pendingReplies = { ...s.pendingReplies }
        for (const [personId, at] of Object.entries(s.pendingReplies)) {
          if (at > now) continue
          changed = true
          delete pendingReplies[personId]
          const n = (threads[personId] ?? []).length
          const text = tr.c.replies[(hashString(personId) + n) % tr.c.replies.length]
          threads = push(threads, personId, { id: uid('m'), from: 'them', text, at: iso(now) })
          unread = { ...unread, [personId]: (unread[personId] ?? 0) + 1 }
          events.push({ type: 'message', personId })
        }
        if (changed) set({ exchanges, threads, unread, pendingReplies })
        return events
      },

      reset() {
        set({ ...initialData(get().settings.lang), settings: get().settings })
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => {
        const { completeOnboarding, enterDemo, updateMe, propose, respond, acceptCounter, cancel, complete, review, sendMessage, markRead, toggleSaved, setPlan, setLang, setTheme, tick, reset, ...data } = s
        return data
      },
      migrate: (persisted) => sanitize(persisted),
      merge: (persisted, current) => ({ ...current, ...sanitize(persisted, current.settings.lang) }),
    },
  ),
)

/** Chi sta scrivendo adesso (la risposta arriva entro 2,5 secondi). */
export function isTyping(pendingAt: number | undefined, now: number): boolean {
  return !!pendingAt && pendingAt - now < 2500 && pendingAt > now
}

export type { Mode }
