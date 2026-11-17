import type { CategoryId } from '@/content/categories'
import { skillById } from '@/content/skills'
import { haversineKm, type LatLon } from './geo'
import { type Availability, countBits, type Level, type Mode, type Person, type SkillLevel } from './types'

/**
 * - perfect: io insegno qualcosa che cerchi e tu insegni qualcosa che cerco (scambio diretto)
 * - theyTeach: tu insegni qualcosa che cerco (posso ripagarti in ore)
 * - theyLearn: cerchi qualcosa che insegno io (puoi ripagarmi in ore)
 */
export type MatchKind = 'perfect' | 'theyTeach' | 'theyLearn' | 'none'

export interface Seeker {
  offers: SkillLevel[]
  wants: string[]
  avail: Availability
  mode: Mode
}

export interface Match {
  person: Person
  distKm: number
  score: number
  kind: MatchKind
  /** cosa posso insegnare io a questa persona */
  give: string[]
  /** cosa questa persona può insegnare a me, con il suo livello */
  get: SkillLevel[]
  /** fasce orarie libere in comune */
  availOverlap: number
  /** fuori dal mio raggio, raggiungibile solo in videochiamata */
  remote: boolean
}

const KIND_SCORE: Record<MatchKind, number> = { perfect: 100, theyTeach: 55, theyLearn: 30, none: 0 }

export function matchKind(give: unknown[], get: unknown[]): MatchKind {
  if (give.length && get.length) return 'perfect'
  if (get.length) return 'theyTeach'
  if (give.length) return 'theyLearn'
  return 'none'
}

/** Entrambi accettano la videochiamata: la distanza non conta più. */
export const canMeetOnline = (a: Mode, b: Mode) => a !== 'live' && b !== 'live'

/** Gli scambi dal vivo con chi fa solo online (e viceversa) non funzionano. */
export function modesCompatible(a: Mode, b: Mode): boolean {
  return a === 'both' || b === 'both' || a === b
}

export function scoreMatch(me: Seeker, p: Person, distKm: number, radiusKm: number): Match {
  const myOffers = new Set(me.offers.map((o) => o.id))
  const give = p.wants.filter((w) => myOffers.has(w))
  const get = p.offers.filter((o) => me.wants.includes(o.id)).sort((a, b) => b.level - a.level)
  const kind = matchKind(give, get)
  const availOverlap = countBits(me.avail & p.avail)
  let score = KIND_SCORE[kind]
  if (kind !== 'none') {
    score += (give.length + get.length - 1) * 8
    score += (get[0]?.level ?? 0) * 4
    score += Math.max(0, 1 - distKm / Math.max(radiusKm, 1)) * 20
    score += Math.min(availOverlap, 6) * 2
    if (p.reviews > 0) score += (p.rating - 4) * 8
    if (!modesCompatible(me.mode, p.mode)) score -= 25
    if (p.verified) score += 2
    if (p.premium) score += 6
  }
  return { person: p, distKm, score: Math.round(score * 10) / 10, kind, give, get, availOverlap, remote: distKm > radiusKm }
}

export type SortKey = 'best' | 'near' | 'rating' | 'new'
export type Reach = 'near' | 'online' | 'both'

/** La portata di default: chi ha attivato la videochiamata cerca anche fuori dal raggio. */
export const defaultReach = (mode: Mode): Reach => (mode === 'live' ? 'near' : 'both')

export interface MatchQuery {
  center: LatLon
  radiusKm: number
  /** solo chi offre (o cerca) questa competenza */
  skill?: string
  skillSide?: 'offers' | 'wants'
  /** solo chi offre almeno una competenza di questa categoria */
  cat?: CategoryId
  minLevel?: Level
  mode?: 'any' | 'live' | 'online'
  /**
   * near: solo nel raggio · online: chiunque accetti la videochiamata, ovunque sia ·
   * both: nel raggio oppure in videochiamata da tutta Italia. Default: near.
   */
  reach?: Reach
  /** solo chi ha almeno una fascia libera in comune con me */
  availOnly?: boolean
  verifiedOnly?: boolean
  /** testo libero sul nome */
  text?: string
  sort?: SortKey
  /** quante persone tenere (dopo l'ordinamento) */
  limit?: number
  /** esclude queste persone (es. già in uno scambio) */
  exclude?: Set<string>
}

/**
 * Cerca le persone nel raggio e le ordina. Senza filtri per competenza o categoria
 * restituisce solo chi ha qualcosa da scambiare con me; con un filtro, tutti quelli che lo soddisfano.
 * I profili Premium "in evidenza" salgono a parità di punteggio (vedi scoreMatch).
 */
export function findMatches(me: Seeker, people: Person[], q: MatchQuery): Match[] {
  const out: Match[] = []
  const text = q.text?.trim().toLowerCase()
  for (const p of people) {
    if (q.exclude?.has(p.id)) continue
    const d = haversineKm(q.center, p)
    const reach = q.reach ?? 'near'
    const inRadius = d <= q.radiusKm
    const video = canMeetOnline(me.mode, p.mode)
    if (reach === 'near' && !inRadius) continue
    if (reach === 'online' && !video) continue
    if (reach === 'both' && !inRadius && !video) continue
    if (q.skill) {
      if (q.skillSide === 'wants') {
        if (!p.wants.includes(q.skill)) continue
      } else {
        const o = p.offers.find((x) => x.id === q.skill)
        if (!o || (q.minLevel && o.level < q.minLevel)) continue
      }
    }
    if (q.cat && !p.offers.some((o) => skillById(o.id)?.cat === q.cat && (!q.minLevel || o.level >= q.minLevel)))
      continue
    if (!q.skill && !q.cat && q.minLevel && !p.offers.some((o) => o.level >= q.minLevel!)) continue
    if (q.mode === 'live' && p.mode === 'online') continue
    if (q.mode === 'online' && p.mode === 'live') continue
    if (q.verifiedOnly && !p.verified) continue
    if (q.availOnly && (me.avail & p.avail) === 0) continue
    if (text && !`${p.first} ${p.last}`.toLowerCase().includes(text)) continue
    const m = scoreMatch(me, p, d, q.radiusKm)
    if (!q.skill && !q.cat && !text && m.kind === 'none') continue
    out.push(m)
  }
  const sort = q.sort ?? 'best'
  out.sort((a, b) => {
    if (sort === 'near') return a.distKm - b.distKm
    if (sort === 'rating') return b.person.rating - a.person.rating || b.person.reviews - a.person.reviews
    if (sort === 'new') return b.person.joined.localeCompare(a.person.joined)
    return b.score - a.score || Number(b.person.premium) - Number(a.person.premium) || a.distKm - b.distKm
  })
  return q.limit ? out.slice(0, q.limit) : out
}

/** Conteggio rapido per tipo, per i riepiloghi. */
export function countKinds(matches: Match[]): Record<MatchKind, number> {
  const c: Record<MatchKind, number> = { perfect: 0, theyTeach: 0, theyLearn: 0, none: 0 }
  for (const m of matches) c[m.kind]++
  return c
}
