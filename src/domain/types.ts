/** 1 base · 2 intermedio · 3 avanzato · 4 esperto */
export type Level = 1 | 2 | 3 | 4
export const LEVELS: Level[] = [1, 2, 3, 4]

/** Come si fa lo scambio: dal vivo, a distanza o entrambe. */
export type Mode = 'live' | 'online' | 'both'

export interface SkillLevel {
  id: string
  level: Level
}

/**
 * Disponibilità: 7 giorni × 3 fasce (mattina, pomeriggio, sera) in una maschera di 21 bit.
 * Il bit `day * 3 + slot` vale 1 se la persona è libera (day 0 = lunedì).
 */
export type Availability = number
export const SLOTS = ['morning', 'afternoon', 'evening'] as const
export type Slot = (typeof SLOTS)[number]
export const availBit = (day: number, slot: number) => 1 << (day * 3 + slot)
export const isFree = (a: Availability, day: number, slot: number) => (a & availBit(day, slot)) !== 0
export function countBits(n: number): number {
  let c = 0
  while (n) {
    n &= n - 1
    c++
  }
  return c
}

export interface Person {
  id: string
  first: string
  last: string
  gender: 'f' | 'm'
  age: number
  comuneId: string
  lat: number
  lon: number
  offers: SkillLevel[]
  wants: string[]
  avail: Availability
  mode: Mode
  /** lingue parlate, codici ISO 639-1 */
  langs: string[]
  rating: number
  reviews: number
  hoursGiven: number
  hoursReceived: number
  premium: boolean
  verified: boolean
  /** data di iscrizione, AAAA-MM-GG */
  joined: string
  /** tempo medio di risposta in minuti */
  replyMins: number
  /** indice nelle liste dei mestieri (src/i18n/<lingua>/content.ts) */
  job: number
  /** seme per comporre la bio e le recensioni */
  seed: number
}

/** Il profilo dell'utente dell'app. */
export interface Me {
  name: string
  comuneId: string
  radiusKm: number
  offers: SkillLevel[]
  wants: string[]
  avail: Availability
  mode: Mode
  bio: string
  langs: string[]
  /** colore dell'avatar */
  hue: number
  joined: string
}
