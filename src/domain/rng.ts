/** Generatore pseudo-casuale con seme (mulberry32): stessi semi, stessi dati demo. */
export type Rng = () => number

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash FNV-1a di una stringa, per ricavare un seme da un id. */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1))
export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]
export const chance = (rng: Rng, p: number) => rng() < p

export function weightedPick<T>(rng: Rng, items: readonly T[], weight: (t: T) => number): T {
  let total = 0
  for (const it of items) total += weight(it)
  let r = rng() * total
  for (const it of items) {
    r -= weight(it)
    if (r <= 0) return it
  }
  return items[items.length - 1]
}

export function shuffle<T>(rng: Rng, list: readonly T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Estrae `n` elementi distinti, con pesi. */
export function sampleWeighted<T>(rng: Rng, items: readonly T[], n: number, weight: (t: T) => number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < n && pool.length) {
    const it = weightedPick(rng, pool, weight)
    out.push(it)
    pool.splice(pool.indexOf(it), 1)
  }
  return out
}
