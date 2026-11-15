import { skillById } from '@/content/skills'
import { EMPTY_STATS, type Stats } from '@/domain/badges'
import { isPremium } from '@/domain/plans'
import { slotOf } from '@/domain/slots'
import type { AppData, Exchange } from './app'
import { isActive } from './app'

export function myStats(s: AppData): Stats {
  const done = s.exchanges.filter((e) => e.status === 'completed')
  const taught = new Set(done.map((e) => e.give).filter(Boolean) as string[])
  const cats = new Set([...taught].map((id) => skillById(id)?.cat))
  const langs = [...taught].filter((id) => skillById(id)?.cat === 'languages')
  const slotIdx = done.map((e) => (e.slot ? slotOf(e.slot).slot : -1))
  return {
    ...EMPTY_STATS,
    completed: done.length,
    hoursGiven: done.reduce((n, e) => n + e.giveHours, 0),
    hoursReceived: done.reduce((n, e) => n + e.getHours, 0),
    skillsTaught: taught.size,
    categoriesTaught: cats.size,
    languagesTaught: langs.length,
    reviewsGiven: done.filter((e) => e.myReview).length,
    fiveStars: done.filter((e) => e.theirReview?.stars === 5).length,
    peopleMet: new Set(done.map((e) => e.personId)).size,
    profileComplete: profileCompleteness(s) >= 1 ? 1 : 0,
    morning: slotIdx.filter((x) => x === 0).length,
    evening: slotIdx.filter((x) => x === 2).length,
    premium: isPremium(s.plan) ? 1 : 0,
    messages: s.messagesSent,
    pioneer: 1,
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
