import { haversineKm, type LatLon } from './geo'
import type { Seeker } from './matching'
import type { Person } from './types'

/**
 * Uno scambio a tre: io insegno `toB` a B, B insegna `toC` a C, C insegna `toMe` a me.
 * Serve quando nessuno dei due ha quello che cerca l'altro, ma un terzo chiude il cerchio.
 */
export interface Triad {
  b: Person
  c: Person
  toB: string
  toC: string
  toMe: string
  /** somma delle distanze del giro, in km */
  loopKm: number
}

export function findTriads(me: Seeker, people: Person[], center: LatLon, radiusKm: number, limit = 6): Triad[] {
  const near = people.filter((p) => haversineKm(center, p) <= radiusKm)
  const myOffers = new Set(me.offers.map((o) => o.id))
  // B: chi cerca qualcosa che insegno io
  const bs = near.filter((p) => p.wants.some((w) => myOffers.has(w)))
  // C: chi insegna qualcosa che cerco io
  const cs = near.filter((p) => p.offers.some((o) => me.wants.includes(o.id)))
  const out: Triad[] = []
  for (const b of bs) {
    const bOffers = new Set(b.offers.map((o) => o.id))
    for (const c of cs) {
      if (c.id === b.id) continue
      const toC = c.wants.find((w) => bOffers.has(w))
      if (!toC) continue
      const toB = b.wants.find((w) => myOffers.has(w))!
      const toMe = c.offers.find((o) => me.wants.includes(o.id))!.id
      if (new Set([toB, toC, toMe]).size < 3) continue
      out.push({ b, c, toB, toC, toMe, loopKm: haversineKm(center, b) + haversineKm(b, c) + haversineKm(c, center) })
    }
  }
  out.sort((x, y) => x.loopKm - y.loopKm)
  // una sola triade per persona B, così i suggerimenti sono vari
  const seen = new Set<string>()
  return out.filter((t) => (seen.has(t.b.id) || seen.has(t.c.id) ? false : (seen.add(t.b.id), seen.add(t.c.id), true))).slice(0, limit)
}

/**
 * Una catena di scambi: io insegno skills[0] a people[0], people[0] insegna skills[1] a people[1], …,
 * l'ultimo insegna skills[n] a me. Con 2 persone è uno scambio a tre, con 3 una catena a quattro.
 */
export interface Chain {
  people: Person[]
  skills: string[]
  loopKm: number
}

export const triadToChain = (t: Triad): Chain => ({ people: [t.b, t.c], skills: [t.toB, t.toC, t.toMe], loopKm: t.loopKm })

/** Lunghezza del giro: io → p1 → … → pn → io. */
function loopLength(center: LatLon, ps: Person[]): number {
  let km = haversineKm(center, ps[0])
  for (let i = 1; i < ps.length; i++) km += haversineKm(ps[i - 1], ps[i])
  return km + haversineKm(ps[ps.length - 1], center)
}

/**
 * Catene a quattro (io → B → X → C → io), per quando non esiste nessun giro a tre.
 * Indicizza chi cerca cosa, così il costo resta basso anche con migliaia di profili.
 */
export function findChains4(me: Seeker, people: Person[], center: LatLon, radiusKm: number, limit = 6): Chain[] {
  const near = people.filter((p) => haversineKm(center, p) <= radiusKm)
  const myOffers = new Set(me.offers.map((o) => o.id))
  const wantsBy = new Map<string, Person[]>()
  for (const p of near) for (const w of p.wants) (wantsBy.get(w) ?? wantsBy.set(w, []).get(w)!).push(p)
  const isC = (p: Person) => p.offers.some((o) => me.wants.includes(o.id))
  const bs = near.filter((p) => p.wants.some((w) => myOffers.has(w))).slice(0, 80)
  const out: Chain[] = []
  let steps = 0
  outer: for (const b of bs) {
    const toB = b.wants.find((w) => myOffers.has(w))!
    for (const ob of b.offers) {
      for (const x of wantsBy.get(ob.id) ?? []) {
        if (x.id === b.id) continue
        for (const ox of x.offers) {
          for (const c of wantsBy.get(ox.id) ?? []) {
            if (++steps > 200000) break outer
            if (c.id === b.id || c.id === x.id || !isC(c)) continue
            const toMe = c.offers.find((o) => me.wants.includes(o.id))!.id
            const skills = [toB, ob.id, ox.id, toMe]
            if (new Set(skills).size < 4) continue
            const ps = [b, x, c]
            out.push({ people: ps, skills, loopKm: loopLength(center, ps) })
            if (out.length >= limit * 20) break outer
          }
        }
      }
    }
  }
  out.sort((a, b) => a.loopKm - b.loopKm)
  const seen = new Set<string>()
  return out
    .filter((ch) => (ch.people.some((p) => seen.has(p.id)) ? false : (ch.people.forEach((p) => seen.add(p.id)), true)))
    .slice(0, limit)
}

/** I giri suggeriti: prima gli scambi a tre, poi le catene a quattro (almeno una, se esiste). */
export function findChains(me: Seeker, people: Person[], center: LatLon, radiusKm: number, limit = 3): Chain[] {
  const triads = findTriads(me, people, center, radiusKm, limit).map(triadToChain)
  const used = new Set(triads.flatMap((t) => t.people.map((p) => p.id)))
  const fours = findChains4(me, people, center, radiusKm, limit + 3).filter((c) => !c.people.some((p) => used.has(p.id)))
  const keep = Math.min(triads.length, limit - Math.min(1, fours.length))
  return [...triads.slice(0, keep), ...fours].slice(0, limit)
}
