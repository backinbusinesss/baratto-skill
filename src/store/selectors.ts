import type { CategoryId } from '@/content/categories'
import { comuneById } from '@/content/comuni'
import { skillById } from '@/content/skills'
import { EMPTY_STATS, type Stats } from '@/domain/badges'
import { haversineKm } from '@/domain/geo'
import { isPremium } from '@/domain/plans'
import { slotOf } from '@/domain/slots'
import { countBits } from '@/domain/types'
import type { AppData, Exchange } from './app'
import { findPerson, isActive } from './app'

/** Le statistiche dell'utente, da cui nascono i badge. */
export function myStats(s: AppData): Stats {
  const done = s.exchanges.filter((e) => e.status === 'completed')
  const taught = new Set(done.map((e) => e.give).filter(Boolean) as string[])
  const learned = new Set(done.map((e) => e.get).filter(Boolean) as string[])
  const catTaught: Partial<Record<CategoryId, number>> = {}
  const catLearned: Partial<Record<CategoryId, number>> = {}
  for (const e of done) {
    const ct = e.give ? skillById(e.give)?.cat : undefined
    const cl = e.get ? skillById(e.get)?.cat : undefined
    if (ct) catTaught[ct] = (catTaught[ct] ?? 0) + 1
    if (cl) catLearned[cl] = (catLearned[cl] ?? 0) + 1
  }
  const home = s.me ? comuneById(s.me.comuneId) : undefined
  const people = done.map((e) => findPerson(s.neighbors, e.personId)).filter((p) => !!p)
  const dist = people.map((p) => (home ? haversineKm(home, p) : 0))
  const slots = done.filter((e) => e.slot).map((e) => slotOf(e.slot!))
  const lang = (ids: Set<string>) => [...ids].filter((id) => skillById(id)?.cat === 'languages').length
  return {
    ...EMPTY_STATS,
    completed: done.length,
    hoursGiven: done.reduce((n, e) => n + e.giveHours, 0),
    hoursReceived: done.reduce((n, e) => n + e.getHours, 0),
    skillsTaught: taught.size,
    skillsLearned: learned.size,
    categoriesTaught: Object.keys(catTaught).length,
    categoriesLearned: Object.keys(catLearned).length,
    languagesTaught: lang(taught),
    languagesLearned: lang(learned),
    reviewsGiven: done.filter((e) => e.myReview).length,
    fiveStars: done.filter((e) => e.theirReview?.stars === 5).length,
    peopleMet: new Set(done.map((e) => e.personId)).size,
    citiesMet: new Set(people.map((p) => p.comuneId)).size,
    online: done.filter((e) => e.mode === 'online').length,
    live: done.filter((e) => e.mode === 'live').length,
    weekend: slots.filter((x) => x.day >= 5).length,
    morning: slots.filter((x) => x.slot === 0).length,
    evening: slots.filter((x) => x.slot === 2).length,
    gifts: done.filter((e) => e.give && !e.get).length,
    paidWithHours: done.filter((e) => e.get && !e.give).length,
    far: dist.filter((d) => d > 10).length,
    near: dist.filter((d) => d < 1).length,
    messages: s.messagesSent,
    saved: s.saved.length,
    countersAccepted: done.filter((e) => e.direction === 'out' && e.outcome === 'counter').length,
    freeSlots: s.me ? countBits(s.me.avail) : 0,
    profileComplete: profileCompleteness(s) >= 1 ? 1 : 0,
    bio: s.me && s.me.bio.trim().length >= 40 ? 1 : 0,
    premium: isPremium(s.plan) ? 1 : 0,
    pioneer: 1,
    catTaught,
    catLearned,
  }
}

/** Media e numero delle recensioni ricevute. */
export function myRating(s: AppData): { avg: number; count: number } {
  const r = s.exchanges.map((e) => e.theirReview?.stars).filter((x): x is number => !!x)
  return { avg: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : 0, count: r.length }
}

export function profileCompleteness(s: AppData): number {
  const me = s.me
  if (!me) return 0
  const checks = [me.name, me.offers.length > 0, me.wants.length > 0, me.avail !== 0, me.bio.trim().length >= 20, me.offers.length >= 3]
  return checks.filter(Boolean).length / checks.length
}

export const unreadTotal = (s: AppData) => Object.values(s.unread).reduce((a, b) => a + b, 0)
export const incomingPending = (s: AppData) => s.exchanges.filter((e) => e.direction === 'in' && e.status === 'pending')

/** Appuntamenti confermati (con orario), dal più vicino. */
export function appointments(s: AppData): Exchange[] {
  return s.exchanges
    .filter((e) => (e.status === 'accepted' || e.status === 'completed') && e.slot)
    .sort((a, b) => a.slot!.localeCompare(b.slot!))
}

export function nextAppointment(s: AppData, now = new Date()): Exchange | undefined {
  return appointments(s).find((e) => e.status === 'accepted' && new Date(e.slot!) >= new Date(now.getTime() - 3 * 3600000))
}

export const activeCount = (s: AppData) => s.exchanges.filter(isActive).length
