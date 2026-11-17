import { beforeEach, describe, expect, it } from 'vitest'
import { comuneById } from '@/content/comuni'
import { findMatches } from '@/domain/matching'
import { getPeople } from '@/domain/people'
import { balance } from '@/domain/timebank'
import { findChains, findChains4 } from '@/domain/triads'
import type { Mode, Person } from '@/domain/types'
import { simulatedSignups, suggestWorkshops, workshopCost } from '@/domain/workshops'
import { allPeople, demoMe, initialData, useApp } from '@/store/app'

const fresh = () => useApp.setState({ ...initialData('it') })

const person = (id: string, over: Partial<Person>): Person => ({
  id, first: id, last: 'X', gender: 'f', age: 30, comuneId: 'bologna', lat: 44.49, lon: 11.34,
  offers: [], wants: [], avail: 0, mode: 'live', langs: ['it'], rating: 5, reviews: 0, hoursGiven: 0, hoursReceived: 0,
  premium: false, verified: false, joined: '2026-01-01', replyMins: 10, job: 0, seed: 1, ...over,
})

describe('videochiamata: oltre il raggio', () => {
  const me = { ...demoMe(), mode: 'both' as Mode }
  const bologna = comuneById('bologna')!
  // a Palermo, ben oltre i 15 km
  const far = (mode: Person['mode']) => person(`far-${mode}`, { lat: 38.12, lon: 13.36, comuneId: 'palermo', mode, offers: [{ id: 'guitar', level: 3 }] })

  it('near: solo nel raggio; online/both: anche lontano, se entrambi accettano la videochiamata', () => {
    const people = [far('online'), far('live')]
    const ids = (reach: 'near' | 'online' | 'both', m = me) => findMatches(m, people, { center: bologna, radiusKm: 15, reach }).map((x) => x.person.id)
    expect(ids('near')).toEqual([])
    expect(ids('online')).toEqual(['far-online'])
    expect(ids('both')).toEqual(['far-online'])
    expect(ids('both', { ...me, mode: 'live' })).toEqual([])
    expect(findMatches(me, people, { center: bologna, radiusKm: 15, reach: 'both' })[0].remote).toBe(true)
  })
})

describe('catene a quattro', () => {
  it('trova io → B → X → C → io con quattro competenze diverse', () => {
    const me = { offers: [{ id: 'english', level: 3 as const }], wants: ['guitar'], avail: 0, mode: 'both' as const }
    const b = person('b', { wants: ['english'], offers: [{ id: 'yoga', level: 3 }] })
    const x = person('x', { wants: ['yoga'], offers: [{ id: 'chess', level: 3 }] })
    const c = person('c', { wants: ['chess'], offers: [{ id: 'guitar', level: 3 }] })
    const center = comuneById('bologna')!
    const chains = findChains4(me, [b, x, c], center, 20)
    expect(chains).toHaveLength(1)
    expect(chains[0].people.map((p) => p.id)).toEqual(['b', 'x', 'c'])
    expect(chains[0].skills).toEqual(['english', 'yoga', 'chess', 'guitar'])
    // findChains include la catena anche se non ci sono scambi a tre
    expect(findChains(me, [b, x, c], center, 20)[0].people).toHaveLength(3)
  })
})

describe('lezione di prova e workshop', () => {
  beforeEach(() => {
    localStorage.clear()
    fresh()
  })

  it('prova di 15 minuti: gratis, online, una per persona', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), name: 'Ada', bio: '' })
    const s = useApp.getState()
    const p = allPeople(s.neighbors).find((x) => x.mode !== 'live' && x.offers.length)!
    useApp.setState({ plan: 'premium-monthly' })
    const before = balance(s.ledger)
    const input = { personId: p.id, give: 'english', get: p.offers[0].id, hours: 1, slots: ['2026-12-01T19:00'], mode: 'live' as const, note: '', trial: true }
    const r = useApp.getState().propose(input)
    expect(r.result).toBe('ok')
    const ex = useApp.getState().exchanges.find((e) => e.id === r.id)!
    expect(ex).toMatchObject({ trial: true, give: null, mode: 'online', giveHours: 0, getHours: 0 })
    expect(useApp.getState().propose(input).result).toBe('trial-used')
    expect(balance(useApp.getState().ledger)).toBe(before)
  })

  it('partecipare costa ore e si rimborsa; organizzare è Premium e fa incassare', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), name: 'Ada', bio: '' })
    const me = useApp.getState().me!
    const list = suggestWorkshops(getPeople(), comuneById(me.comuneId)!, me.radiusKm, me.mode, new Date('2026-11-17T08:00'))
    expect(list.length).toBeGreaterThan(0)
    expect(list).toEqual(suggestWorkshops(getPeople(), comuneById(me.comuneId)!, me.radiusKm, me.mode, new Date('2026-11-17T09:30')))
    const ws = list.find((w) => w.taken < w.capacity)!
    const start = balance(useApp.getState().ledger)
    expect(useApp.getState().joinWorkshop(ws)).toBe('ok')
    expect(useApp.getState().joinWorkshop(ws)).toBe('already')
    expect(balance(useApp.getState().ledger)).toBe(start - ws.costHours)
    useApp.getState().leaveWorkshop(ws.id)
    expect(balance(useApp.getState().ledger)).toBe(start)

    const input = { skill: 'english', at: '2026-12-05T18:30', minutes: 90 as const, mode: 'live' as const, capacity: 6 }
    expect(useApp.getState().hostWorkshop(input)).toBe('premium')
    useApp.setState({ plan: 'premium-yearly' })
    const t0 = Date.now()
    expect(useApp.getState().hostWorkshop(input, t0)).toBe('ok')
    const mine = useApp.getState().workshops.find((w) => w.role === 'host')!
    const earned = useApp.getState().completeWorkshop(mine.ws.id, t0 + 10 * 3600000)
    expect(earned).toBe(workshopCost(90) * simulatedSignups(mine.ws.id, 6, t0, t0 + 10 * 3600000))
    expect(earned).toBeGreaterThan(0)
    expect(balance(useApp.getState().ledger)).toBe(start + earned)
  })
})
