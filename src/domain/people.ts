import { CATEGORIES, type CategoryId } from '@/content/categories'
import { COMUNI, type Comune, comuneById } from '@/content/comuni'
import { SKILLS, type SkillDef } from '@/content/skills'
import { nearestComune } from './geo'
import { FEMALE, FOREIGN, MALE, surnamesFor } from './names'
import { chance, hashString, int, mulberry32, pick, type Rng, sampleWeighted, weightedPick } from './rng'
import { type Level, type Mode, type Person, type SkillLevel, availBit } from './types'

export const PEOPLE_SEED = 20261115
export const PEOPLE_COUNT = 3000
/** quanti mestieri ci sono nelle liste tradotte (src/i18n/<lingua>/content.ts) */
export const JOB_COUNT = 40

/** Le competenze più richieste: pesano di più quando si sceglie cosa cercare (e un po' cosa offrire). */
export const POPULAR = new Set(
  `english spanish german french pc-basics pc-repair smartphone-help excel spid canva social-media python
  video-editing guitar piano singing drums running swimming tennis padel yoga pilates meditation fresh-pasta bread pizza
  pastry sourdough vegan furniture-assembly small-repairs painting-walls plumbing electrical math-middle math-high
  physics homework-primary thesis drawing photography watercolor pottery-wheel vegetable-garden houseplants cv-writing
  job-interview tax-return personal-budget sewing-basics alterations knitting crochet dog-walking pet-sitting
  babysitting elderly-tech bike-repair car-maintenance driving-practice salsa italian-l2 public-speaking
  digital-marketing linkedin`.split(/\s+/),
)

/** competenze che un italiano non cerca per sé */
const NATIVE_ONLY = new Set(['italian-l2'])

const skillWeight = (s: SkillDef) => (POPULAR.has(s.id) ? 8 : 1)

/** Peso di un comune: cresce con la popolazione ma meno che in proporzione, così anche i paesi hanno qualcuno. */
const comuneWeight = (c: Comune) => Math.pow(c.pop, 0.85)

function jitter(rng: Rng, c: Comune) {
  // raggio di dispersione: da ~1 km nei paesi a ~7 km nelle grandi città
  const km = Math.min(7, 0.8 + Math.sqrt(c.pop) / 200) * Math.sqrt(rng())
  const angle = rng() * Math.PI * 2
  const dLat = (km / 111) * Math.sin(angle)
  const dLon = (km / (111 * Math.cos((c.lat * Math.PI) / 180))) * Math.cos(angle)
  return { lat: +(c.lat + dLat).toFixed(5), lon: +(c.lon + dLon).toFixed(5) }
}

function pickLevel(rng: Rng): Level {
  const r = rng()
  return r < 0.12 ? 1 : r < 0.42 ? 2 : r < 0.78 ? 3 : 4
}

function pickAvail(rng: Rng): number {
  // profili tipo: chi lavora (sere e weekend), studenti (pomeriggi), pensionati (mattine), misti
  const kind = int(rng, 0, 3)
  let mask = 0
  for (let d = 0; d < 7; d++) {
    const weekend = d >= 5
    for (let s = 0; s < 3; s++) {
      const p =
        kind === 0
          ? weekend ? 0.7 : s === 2 ? 0.65 : 0.05
          : kind === 1
            ? s === 1 ? 0.75 : weekend ? 0.5 : 0.15
            : kind === 2
              ? s === 0 ? 0.8 : s === 1 ? 0.45 : 0.1
              : 0.35
      if (chance(rng, p)) mask |= availBit(d, s)
    }
  }
  return mask || availBit(5, 0) | availBit(6, 1)
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

/** Spinta verso interessi complementari: `teach` = competenze che la persona offrirà, `learn` = che cercherà. */
interface Bias {
  teach?: string
  learn?: string
}

function makePerson(rng: Rng, id: string, seed: number, comune: Comune, bias: Bias = {}): Person {
  const foreign = chance(rng, 0.1) ? pick(rng, FOREIGN) : null
  const gender: 'f' | 'm' = foreign ? foreign.g : chance(rng, 0.52) ? 'f' : 'm'
  const first = foreign ? foreign.first : pick(rng, gender === 'f' ? FEMALE : MALE)
  const { local, common } = surnamesFor(comune.region)
  const last = foreign ? foreign.last : chance(rng, 0.45) ? pick(rng, local) : pick(rng, common)

  // 1–2 categorie "del cuore" da cui arriva la maggior parte delle competenze offerte
  const favCats = sampleWeighted(rng, CATEGORIES, chance(rng, 0.6) ? 2 : 1, () => 1).map((c) => c.id)
  const nOffers = int(rng, 2, 5)
  const offerIds = new Set<string>()
  if (foreign) offerIds.add(foreign.skill)
  if (bias.teach) offerIds.add(bias.teach)
  let guard = 0
  while (offerIds.size < nOffers && guard++ < 50) {
    const fromFav = chance(rng, 0.75)
    const pool = fromFav ? SKILLS.filter((s) => favCats.includes(s.cat)) : SKILLS
    offerIds.add(weightedPick(rng, pool, skillWeight).id)
  }
  const offers: SkillLevel[] = [...offerIds].map((sid) => ({
    id: sid,
    level: foreign && sid === foreign.skill ? 4 : sid === bias.teach ? (Math.max(2, pickLevel(rng)) as Level) : pickLevel(rng),
  }))

  const nWants = int(rng, 1, 4)
  const wants: string[] = bias.learn && !offerIds.has(bias.learn) ? [bias.learn] : []
  guard = 0
  while (wants.length < nWants && guard++ < 50) {
    const s = weightedPick(rng, SKILLS, (s) => (POPULAR.has(s.id) ? 20 : 1) * (favCats.includes(s.cat as CategoryId) ? 0.6 : 1))
    if (!foreign && NATIVE_ONLY.has(s.id)) continue
    if (!offerIds.has(s.id) && !wants.includes(s.id)) wants.push(s.id)
  }
  // chi arriva da fuori spesso cerca l'italiano
  if (foreign && !bias.learn && !wants.includes('italian-l2') && !offerIds.has('italian-l2') && chance(rng, 0.5))
    wants[0] = 'italian-l2'

  const onlineAble = offers.some((o) => SKILLS.find((s) => s.id === o.id)?.online)
  const mode: Mode = onlineAble ? pick(rng, ['live', 'both', 'both', 'online'] as Mode[]) : 'live'

  const langs = ['it']
  if (foreign && foreign.lang !== 'it') langs.unshift(foreign.lang)
  if (!langs.includes('en') && chance(rng, 0.45)) langs.push('en')
  if (chance(rng, 0.12)) langs.push(pick(rng, ['fr', 'es', 'de']))

  const reviews = chance(rng, 0.12) ? 0 : int(rng, 1, 48)
  const rating = reviews === 0 ? 0 : Math.round((4 + rng() * 1 - (chance(rng, 0.1) ? 0.6 : 0)) * 10) / 10
  const hoursGiven = reviews === 0 ? int(rng, 0, 2) : int(rng, reviews, reviews * 3)
  const hoursReceived = Math.max(0, hoursGiven + int(rng, -6, 5))

  const joinedDaysAgo = int(rng, 3, 900)
  const joined = new Date(Date.UTC(2026, 10, 15) - joinedDaysAgo * 86400000)

  return {
    id,
    first,
    last,
    gender,
    age: int(rng, 17, 78),
    comuneId: comune.id,
    ...jitter(rng, comune),
    offers,
    wants,
    avail: pickAvail(rng),
    mode,
    langs,
    rating: reviews === 0 ? 0 : Math.min(5, Math.max(3.4, rating)),
    reviews,
    hoursGiven,
    hoursReceived,
    premium: chance(rng, 0.12),
    verified: chance(rng, 0.55),
    joined: isoDate(joined),
    replyMins: pick(rng, [5, 10, 15, 30, 45, 60, 120, 180, 360]),
    job: int(rng, 0, JOB_COUNT - 1),
    seed,
  }
}

/** Genera le persone demo: almeno una per comune, il resto in proporzione agli abitanti. */
export function generatePeople(seed = PEOPLE_SEED, count = PEOPLE_COUNT): Person[] {
  const rng = mulberry32(seed)
  const comuni: Comune[] = [...COMUNI]
  for (let i = comuni.length; i < count; i++) comuni.push(weightedPick(rng, COMUNI, comuneWeight))
  return comuni
    .slice(0, count)
    .map((c, i) => makePerson(rng, `p${(i + 1).toString(36).padStart(3, '0')}`, hashString(`${seed}:${i}`), c))
}

/**
 * Il "vicinato" demo: persone in più nel comune dell'utente, generate una volta all'onboarding
 * e salvate nello store. Una parte insegna ciò che l'utente cerca, una parte cerca ciò che
 * l'utente insegna, qualcuna entrambe le cose: così la demo mostra subito abbinamenti veri.
 */
export function generateNeighbors(
  me: { offers: { id: string }[]; wants: string[] },
  comuneId: string,
  salt: string,
  count = 40,
  radiusKm = 12,
): Person[] {
  const comune = comuneById(comuneId)!
  const base = hashString(`vicinato:${comuneId}:${salt}`)
  const rng = mulberry32(base)
  const myOffers = me.offers.map((o) => o.id)
  const out: Person[] = []
  for (let i = 0; i < count; i++) {
    const r = rng()
    const bias: Bias = {}
    if (me.wants.length && (r < 0.3 || (r >= 0.55 && r < 0.75))) bias.teach = pick(rng, me.wants)
    if (myOffers.length && r >= 0.3 && r < 0.75) bias.learn = pick(rng, myOffers)
    if (bias.teach && bias.teach === bias.learn) delete bias.learn
    const p = makePerson(rng, `n${base.toString(36)}-${i}`, hashString(`${base}:${i}`), comune, bias)
    // sparsi nel raggio (metà entro un terzo, come in città), ognuno nel comune più vicino
    const km = (rng() < 0.5 ? rng() / 3 : rng()) * radiusKm * 0.95
    const angle = rng() * Math.PI * 2
    p.lat = +(comune.lat + (km / 111) * Math.sin(angle)).toFixed(5)
    p.lon = +(comune.lon + (km / (111 * Math.cos((comune.lat * Math.PI) / 180))) * Math.cos(angle)).toFixed(5)
    p.comuneId = nearestComune(p).id
    out.push(p)
  }
  return out
}

let cache: Person[] | null = null
let byId: Map<string, Person> | null = null

export function getPeople(): Person[] {
  if (!cache) {
    cache = generatePeople()
    byId = new Map(cache.map((p) => [p.id, p]))
  }
  return cache
}

export function personById(id: string): Person | undefined {
  getPeople()
  return byId!.get(id)
}

export const personComune = (p: Person) => comuneById(p.comuneId)!
export const fullName = (p: { first: string; last: string }) => `${p.first} ${p.last}`
export const shortName = (p: { first: string; last: string }) => `${p.first} ${p.last[0]}.`
