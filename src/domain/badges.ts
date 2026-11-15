import { CATEGORY_IDS, type CategoryId, categoryById } from '@/content/categories'

/**
 * Badge di Baratto Skill. Sono di tre tipi:
 * - famiglie a livelli (Bronzo, Argento, Oro, Platino, Diamante) su una statistica: "Scambista II" = 5 scambi;
 * - badge di categoria: insegnare o imparare in ciascuna delle 14 categorie, a due livelli;
 * - badge speciali, da ottenere una volta sola.
 * I nomi e le descrizioni sono nelle traduzioni (src/i18n/<lingua>/messages.ts → badges).
 */
export interface Stats {
  completed: number
  hoursGiven: number
  hoursReceived: number
  skillsTaught: number
  skillsLearned: number
  categoriesTaught: number
  categoriesLearned: number
  languagesTaught: number
  languagesLearned: number
  reviewsGiven: number
  fiveStars: number
  peopleMet: number
  citiesMet: number
  triads: number
  online: number
  live: number
  weekend: number
  morning: number
  evening: number
  gifts: number
  paidWithHours: number
  far: number
  near: number
  messages: number
  saved: number
  countersAccepted: number
  /** fasce orarie libere nella settimana (0–21) */
  freeSlots: number
  profileComplete: number
  bio: number
  premium: number
  pioneer: number
  /** scambi conclusi insegnando / imparando, per categoria */
  catTaught: Partial<Record<CategoryId, number>>
  catLearned: Partial<Record<CategoryId, number>>
}

export const EMPTY_STATS: Stats = {
  completed: 0,
  hoursGiven: 0,
  hoursReceived: 0,
  skillsTaught: 0,
  skillsLearned: 0,
  categoriesTaught: 0,
  categoriesLearned: 0,
  languagesTaught: 0,
  languagesLearned: 0,
  reviewsGiven: 0,
  fiveStars: 0,
  peopleMet: 0,
  citiesMet: 0,
  triads: 0,
  online: 0,
  live: 0,
  weekend: 0,
  morning: 0,
  evening: 0,
  gifts: 0,
  paidWithHours: 0,
  far: 0,
  near: 0,
  messages: 0,
  saved: 0,
  countersAccepted: 0,
  freeSlots: 0,
  profileComplete: 0,
  bio: 0,
  premium: 0,
  pioneer: 0,
  catTaught: {},
  catLearned: {},
}

export type BadgeGroup = 'exchanges' | 'time' | 'people' | 'skills' | 'categories' | 'special'
export const BADGE_GROUPS: BadgeGroup[] = ['exchanges', 'time', 'people', 'skills', 'categories', 'special']

/** Statistiche numeriche (tutte tranne i conteggi per categoria). */
export type NumericStat = Exclude<keyof Stats, 'catTaught' | 'catLearned'>

interface Family {
  key: string
  metric: NumericStat
  targets: number[]
  icon: string
  color: string
  group: BadgeGroup
}

/** Le famiglie a livelli: una soglia per livello, dal Bronzo in su. */
export const FAMILIES: Family[] = [
  { key: 'exchanges', metric: 'completed', targets: [1, 5, 15, 40, 100], icon: 'handshake', color: '#2E6A4F', group: 'exchanges' },
  { key: 'live', metric: 'live', targets: [1, 5, 20, 50], icon: 'users', color: '#1E9A6A', group: 'exchanges' },
  { key: 'online', metric: 'online', targets: [1, 5, 20, 50], icon: 'video', color: '#3A6FD8', group: 'exchanges' },
  { key: 'triads', metric: 'triads', targets: [1, 3, 10], icon: 'triangle', color: '#8E7CC3', group: 'exchanges' },
  { key: 'diplomat', metric: 'countersAccepted', targets: [1, 5, 15], icon: 'scale', color: '#4B5BA6', group: 'exchanges' },
  { key: 'givers', metric: 'hoursGiven', targets: [3, 10, 25, 60, 150], icon: 'hand-heart', color: '#E08A1E', group: 'time' },
  { key: 'learners', metric: 'hoursReceived', targets: [3, 10, 25, 60, 150], icon: 'brain', color: '#D24D7E', group: 'time' },
  { key: 'gifts', metric: 'gifts', targets: [1, 5, 15], icon: 'gift', color: '#E5533B', group: 'time' },
  { key: 'investor', metric: 'paidWithHours', targets: [1, 5, 15], icon: 'hourglass', color: '#B4683C', group: 'time' },
  { key: 'early', metric: 'morning', targets: [1, 5, 20], icon: 'sunrise', color: '#F1B238', group: 'time' },
  { key: 'night', metric: 'evening', targets: [1, 5, 20], icon: 'moon', color: '#3A6FD8', group: 'time' },
  { key: 'weekend', metric: 'weekend', targets: [1, 5, 20], icon: 'sun', color: '#E08A1E', group: 'time' },
  { key: 'neighbours', metric: 'peopleMet', targets: [3, 10, 25, 60], icon: 'house', color: '#4F8A2B', group: 'people' },
  { key: 'cities', metric: 'citiesMet', targets: [2, 5, 10], icon: 'map', color: '#2B7A9E', group: 'people' },
  { key: 'near', metric: 'near', targets: [1, 5, 15], icon: 'door-open', color: '#3E9C8F', group: 'people' },
  { key: 'far', metric: 'far', targets: [1, 5, 15], icon: 'route', color: '#5B6470', group: 'people' },
  { key: 'critic', metric: 'reviewsGiven', targets: [1, 5, 20, 50], icon: 'message-square-heart', color: '#C2477A', group: 'people' },
  { key: 'stars', metric: 'fiveStars', targets: [1, 5, 20, 50], icon: 'star', color: '#F1B238', group: 'people' },
  { key: 'chatty', metric: 'messages', targets: [10, 50, 200, 500], icon: 'messages-square', color: '#3E9C8F', group: 'people' },
  { key: 'collector', metric: 'saved', targets: [1, 5, 15], icon: 'bookmark', color: '#4B5BA6', group: 'people' },
  { key: 'mentor', metric: 'skillsTaught', targets: [2, 5, 10, 20], icon: 'graduation-cap', color: '#2B7A9E', group: 'skills' },
  { key: 'student', metric: 'skillsLearned', targets: [2, 5, 10, 20], icon: 'book-open', color: '#8E5CC3', group: 'skills' },
  { key: 'allrounder', metric: 'categoriesTaught', targets: [2, 4, 7, 14], icon: 'shapes', color: '#8E5CC3', group: 'skills' },
  { key: 'curious', metric: 'categoriesLearned', targets: [2, 4, 7, 14], icon: 'telescope', color: '#D24D7E', group: 'skills' },
  { key: 'polyglot', metric: 'languagesTaught', targets: [1, 2, 4], icon: 'languages', color: '#E5533B', group: 'skills' },
  { key: 'globetrotter', metric: 'languagesLearned', targets: [1, 2, 4], icon: 'globe', color: '#1E6FC2', group: 'skills' },
]

/** Soglie dei badge di categoria. */
export const CATEGORY_TARGETS = [1, 10]

interface Special {
  key: string
  metric: NumericStat
  target: number
  icon: string
  color: string
}

export const SPECIALS: Special[] = [
  { key: 'pioneer', metric: 'pioneer', target: 1, icon: 'flag', color: '#E5533B' },
  { key: 'calling-card', metric: 'profileComplete', target: 1, icon: 'id-card', color: '#2B7A9E' },
  { key: 'storyteller', metric: 'bio', target: 1, icon: 'pen-line', color: '#C2477A' },
  { key: 'always-free', metric: 'freeSlots', target: 12, icon: 'calendar-check', color: '#1E9A6A' },
  { key: 'supporter', metric: 'premium', target: 1, icon: 'crown', color: '#8E7CC3' },
  { key: 'pillar', metric: 'completed', target: 250, icon: 'landmark', color: '#10162F' },
]

/** Colori dei livelli: Bronzo, Argento, Oro, Platino, Diamante. */
export const TIER_COLORS = ['#B4683C', '#8A93A6', '#D9A21B', '#5B7BD8', '#3DD69B']

export type BadgeKind = 'family' | 'teach' | 'learn' | 'special'

export interface BadgeDef {
  id: string
  kind: BadgeKind
  /** chiave della famiglia o dello speciale, oppure id della categoria */
  key: string
  group: BadgeGroup
  target: number
  /** livello da 1 (Bronzo); 0 per gli speciali */
  tier: number
  /** quanti livelli ha la sua famiglia */
  tiers: number
  icon: string
  color: string
  value(s: Stats): number
}

export const BADGES: BadgeDef[] = [
  ...FAMILIES.flatMap((f) =>
    f.targets.map((target, i) => ({
      id: `${f.key}-${i + 1}`,
      kind: 'family' as const,
      key: f.key,
      group: f.group,
      target,
      tier: i + 1,
      tiers: f.targets.length,
      icon: f.icon,
      color: f.color,
      value: (s: Stats) => s[f.metric],
    })),
  ),
  ...CATEGORY_IDS.flatMap((cat) =>
    (['teach', 'learn'] as const).flatMap((kind) =>
      CATEGORY_TARGETS.map((target, i) => ({
        id: `${kind}-${cat}-${i + 1}`,
        kind,
        key: cat,
        group: 'categories' as const,
        target,
        tier: i + 1,
        tiers: CATEGORY_TARGETS.length,
        icon: categoryById(cat).icon,
        color: categoryById(cat).color,
        value: (s: Stats) => (kind === 'teach' ? s.catTaught[cat] : s.catLearned[cat]) ?? 0,
      })),
    ),
  ),
  ...SPECIALS.map((sp) => ({
    id: sp.key,
    kind: 'special' as const,
    key: sp.key,
    group: 'special' as const,
    target: sp.target,
    tier: 0,
    tiers: 0,
    icon: sp.icon,
    color: sp.color,
    value: (s: Stats) => s[sp.metric],
  })),
]

const BY_ID = new Map(BADGES.map((b) => [b.id, b]))
export const badgeById = (id: string) => BY_ID.get(id)

export function badgeProgress(b: BadgeDef, s: Stats): { value: number; pct: number; earned: boolean } {
  const value = b.value(s)
  return { value, pct: Math.min(1, value / b.target), earned: value >= b.target }
}

export function earnedBadges(s: Stats): string[] {
  return BADGES.filter((b) => b.value(s) >= b.target).map((b) => b.id)
}

/** Badge ottenuti passando da `before` ad `after` (per le notifiche). */
export function newlyEarned(before: Stats, after: Stats): BadgeDef[] {
  const had = new Set(earnedBadges(before))
  return BADGES.filter((b) => !had.has(b.id) && b.value(after) >= b.target)
}

/** Per ogni famiglia o categoria, il badge più alto ottenuto (per le vetrine compatte). */
export function topEarned(s: Stats): BadgeDef[] {
  const best = new Map<string, BadgeDef>()
  for (const b of BADGES) {
    if (b.value(s) < b.target) continue
    const k = `${b.kind}:${b.key}`
    const cur = best.get(k)
    if (!cur || b.tier > cur.tier) best.set(k, b)
  }
  return [...best.values()].sort((a, b) => b.tier - a.tier)
}

/** Statistiche stimate di un profilo demo (a partire da recensioni, ore e competenze). */
export function demoStats(p: {
  reviews: number
  rating: number
  hoursGiven: number
  hoursReceived: number
  offers: { id: string }[]
  wants: string[]
  premium: boolean
  joined: string
  seed: number
  langs: string[]
  mode: string
  avail: number
}, catOf: (skill: string) => CategoryId | undefined): Stats {
  const r = p.reviews
  const catTaught: Partial<Record<CategoryId, number>> = {}
  const catLearned: Partial<Record<CategoryId, number>> = {}
  p.offers.forEach((o, i) => {
    const c = catOf(o.id)
    if (c) catTaught[c] = (catTaught[c] ?? 0) + Math.max(0, Math.round(r / (i + 1.6)))
  })
  p.wants.forEach((w, i) => {
    const c = catOf(w)
    if (c) catLearned[c] = (catLearned[c] ?? 0) + Math.max(0, Math.round(r / (i + 3)))
  })
  let free = 0
  for (let n = p.avail; n; n &= n - 1) free++
  const pick = (k: number) => (p.seed >> k) & 3
  return {
    ...EMPTY_STATS,
    completed: r,
    hoursGiven: p.hoursGiven,
    hoursReceived: p.hoursReceived,
    skillsTaught: Math.min(p.offers.length, Math.ceil(r / 3)),
    skillsLearned: Math.min(p.wants.length + 2, Math.ceil(r / 4)),
    categoriesTaught: Object.values(catTaught).filter(Boolean).length,
    categoriesLearned: Object.values(catLearned).filter(Boolean).length,
    languagesTaught: p.langs.length >= 3 && r > 4 ? 2 : p.langs.length >= 2 && r > 2 ? 1 : 0,
    languagesLearned: pick(1) === 0 && r > 6 ? 1 : 0,
    reviewsGiven: Math.round(r * 0.8),
    fiveStars: p.rating >= 4.6 ? Math.round(r * 0.7) : Math.round(r * 0.3),
    peopleMet: Math.round(r * 0.75),
    citiesMet: Math.min(10, Math.ceil(r / 8)),
    triads: p.seed % 7 === 0 && r > 10 ? 1 + (p.seed % 3) : 0,
    online: p.mode === 'live' ? 0 : Math.round(r * (p.mode === 'online' ? 0.9 : 0.4)),
    live: p.mode === 'online' ? 0 : Math.round(r * (p.mode === 'live' ? 0.9 : 0.6)),
    weekend: Math.round(r * 0.3),
    morning: pick(3) === 0 ? Math.round(r * 0.5) : Math.round(r * 0.1),
    evening: pick(3) === 1 ? Math.round(r * 0.5) : Math.round(r * 0.15),
    gifts: pick(5) === 2 ? Math.round(r / 5) : 0,
    paidWithHours: pick(7) === 1 ? Math.round(r / 6) : 0,
    far: pick(9) === 3 ? Math.round(r / 5) : 0,
    near: Math.round(r * 0.25),
    messages: r * 6,
    saved: pick(11),
    countersAccepted: Math.round(r / 7),
    freeSlots: free,
    profileComplete: 1,
    bio: 1,
    premium: p.premium ? 1 : 0,
    pioneer: p.joined < '2025-01-01' ? 1 : 0,
    catTaught,
    catLearned,
  }
}
