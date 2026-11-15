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
