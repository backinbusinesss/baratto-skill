import { comuneById } from '@/content/comuni'
import { BADGES, badgeProgress, EMPTY_STATS, earnedBadges, FAMILIES, newlyEarned, topEarned } from '@/domain/badges'
import { getT } from '@/i18n'
import { badgeDesc, badgeName } from '@/i18n/badges'
import { haversineKm } from '@/domain/geo'
import { findMatches, modesCompatible, scoreMatch, type Seeker } from '@/domain/matching'
import { generateNeighbors, getPeople } from '@/domain/people'
import { canPropose, clampRadius, formatPrice, yearlySavingPct } from '@/domain/plans'
import { balance, canAfford, exchangeDelta, type LedgerEntry, monthlySeries, WELCOME_HOURS } from '@/domain/timebank'
import { findTriads } from '@/domain/triads'
import type { Person } from '@/domain/types'

const bologna = comuneById('bologna')!

function person(over: Partial<Person>): Person {
  return {
    id: 'x',
    first: 'Test',
    last: 'Persona',
    gender: 'f',
    age: 30,
    comuneId: 'bologna',
    lat: bologna.lat,
    lon: bologna.lon,
    offers: [],
    wants: [],
    avail: 0b111,
    mode: 'both',
    langs: ['it'],
    rating: 4.5,
    reviews: 10,
    hoursGiven: 10,
    hoursReceived: 10,
    premium: false,
    verified: false,
    joined: '2026-01-01',
    replyMins: 10,
    job: 0,
    seed: 1,
    ...over,
  }
}

const me: Seeker = { offers: [{ id: 'english', level: 3 }], wants: ['pc-repair'], avail: 0b111, mode: 'both' }

describe('abbinamento', () => {
  it('riconosce lo scambio diretto e i casi a metà', () => {
    const perfect = scoreMatch(me, person({ offers: [{ id: 'pc-repair', level: 3 }], wants: ['english'] }), 1, 25)
    const teach = scoreMatch(me, person({ offers: [{ id: 'pc-repair', level: 3 }], wants: ['yoga'] }), 1, 25)
    const learn = scoreMatch(me, person({ offers: [{ id: 'yoga', level: 3 }], wants: ['english'] }), 1, 25)
    const none = scoreMatch(me, person({ offers: [{ id: 'yoga', level: 3 }], wants: ['pizza'] }), 1, 25)
    expect([perfect.kind, teach.kind, learn.kind, none.kind]).toEqual(['perfect', 'theyTeach', 'theyLearn', 'none'])
    expect(perfect.give).toEqual(['english'])
    expect(perfect.get.map((g) => g.id)).toEqual(['pc-repair'])
    expect(perfect.score).toBeGreaterThan(teach.score)
    expect(teach.score).toBeGreaterThan(learn.score)
  })

  it('a parità di tutto il resto il profilo Premium sta più in alto', () => {
    const base = { offers: [{ id: 'pc-repair', level: 3 as const }], wants: ['english'] }
    const people = [person({ ...base, id: 'a' }), person({ ...base, id: 'b', premium: true })]
    const res = findMatches(me, people, { center: bologna, radiusKm: 10 })
    expect(res.map((m) => m.person.id)).toEqual(['b', 'a'])
  })

  it('esclude chi è fuori dal raggio e chi non ha niente da scambiare', () => {
    const roma = comuneById('roma')!
    const people = [
      person({ id: 'far', lat: roma.lat, lon: roma.lon, offers: [{ id: 'pc-repair', level: 3 }], wants: ['english'] }),
      person({ id: 'nothing', offers: [{ id: 'yoga', level: 2 }], wants: ['pizza'] }),
    ]
    expect(findMatches(me, people, { center: bologna, radiusKm: 25 })).toEqual([])
  })

  it('filtra per competenza, livello e modalità', () => {
    const people = [
      person({ id: 'lo', offers: [{ id: 'guitar', level: 1 }] }),
      person({ id: 'hi', offers: [{ id: 'guitar', level: 4 }] }),
      person({ id: 'web', offers: [{ id: 'guitar', level: 4 }], mode: 'online' }),
    ]
    const res = findMatches(me, people, { center: bologna, radiusKm: 5, skill: 'guitar', minLevel: 3, mode: 'live' })
    expect(res.map((m) => m.person.id)).toEqual(['hi'])
    expect(modesCompatible('live', 'online')).toBe(false)
    expect(modesCompatible('both', 'online')).toBe(true)
  })

  it('sui dati demo un utente di Bologna trova scambi diretti nel raggio di 25 km', () => {
    const demo: Seeker = {
      offers: [{ id: 'english', level: 3 }, { id: 'photography', level: 2 }, { id: 'fresh-pasta', level: 4 }],
      wants: ['pc-repair', 'guitar', 'yoga', 'bike-repair'],
      avail: 0b111111111111111111111,
      mode: 'both',
    }
    const people = [...getPeople(), ...generateNeighbors(demo, 'bologna', 'test')]
    const res = findMatches(demo, people, { center: bologna, radiusKm: 25 })
    expect(res.length).toBeGreaterThan(20)
    expect(res.filter((m) => m.kind === 'perfect').length).toBeGreaterThan(3)
    expect(findTriads(demo, people, bologna, 25).length).toBeGreaterThan(0)
  })

  it('il vicinato è deterministico, nel comune giusto e senza sovrapposizioni', () => {
    const a = generateNeighbors(me, 'lecce', 'abc')
    const b = generateNeighbors(me, 'lecce', 'abc')
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id))
    expect(new Set(a.map((p) => p.id)).size).toBe(a.length)
    for (const p of a) {
      expect(haversineKm(p, comuneById('lecce')!)).toBeLessThan(12)
      expect(comuneById(p.comuneId)).toBeDefined()
      for (const w of p.wants) expect(p.offers.some((o) => o.id === w)).toBe(false)
    }
    expect(a.some((p) => p.offers.some((o) => o.id === 'pc-repair'))).toBe(true)
  })
})

describe('scambi a tre', () => {
  it('trova un ciclo io → B → C → io', () => {
    const b = person({ id: 'b', offers: [{ id: 'piano', level: 3 }], wants: ['english'] })
    const c = person({ id: 'c', offers: [{ id: 'pc-repair', level: 3 }], wants: ['piano'] })
    const [t] = findTriads(me, [b, c], bologna, 10)
    expect(t).toMatchObject({ toB: 'english', toC: 'piano', toMe: 'pc-repair' })
    expect(t.b.id).toBe('b')
    expect(t.c.id).toBe('c')
  })
})

describe('banca del tempo', () => {
  it('calcola il saldo e blocca chi andrebbe sotto le −3 ore', () => {
    const ledger: LedgerEntry[] = [
      { id: '1', at: '2026-11-01T10:00:00Z', hours: WELCOME_HOURS, kind: 'welcome' },
      { id: '2', at: '2026-11-03T10:00:00Z', hours: 1.5, kind: 'gave' },
      { id: '3', at: '2026-11-05T10:00:00Z', hours: -1, kind: 'received' },
    ]
    expect(balance(ledger)).toBe(2.5)
    expect(canAfford(-3, -1)).toBe(false)
    expect(canAfford(-3, 1)).toBe(true)
    expect(canAfford(-2, -1)).toBe(true)
    expect(exchangeDelta(1, 1)).toBe(0)
    const series = monthlySeries(ledger, 2, new Date('2026-11-15T00:00:00Z'))
    expect(series.at(-1)).toEqual({ key: '2026-11', gave: 1.5, received: 1 })
  })
})

describe('piani', () => {
  it('limita raggio e proposte per chi non paga', () => {
    expect(clampRadius('free', 100)).toBe(25)
    expect(clampRadius('premium-monthly', 100)).toBe(100)
    expect(clampRadius('premium-yearly', 400)).toBe(150)
    expect(canPropose({ plan: 'free', proposalsThisMonth: 3, activeExchanges: 0 })).toBe('monthly-limit')
    expect(canPropose({ plan: 'free', proposalsThisMonth: 1, activeExchanges: 2 })).toBe('active-limit')
    expect(canPropose({ plan: 'premium-monthly', proposalsThisMonth: 99, activeExchanges: 99 })).toBe('ok')
  })

  it('mostra prezzi e risparmio dell’annuale', () => {
    expect(formatPrice(499)).toMatch(/4,99\s?€/)
    expect(yearlySavingPct()).toBe(33)
  })
})

describe('badge', () => {
  it('sono più di 150, con id unici, e si sbloccano alla soglia', () => {
    expect(BADGES.length).toBeGreaterThan(150)
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
    const s = { ...EMPTY_STATS, completed: 5, hoursGiven: 12, catTaught: { cooking: 1 } }
    const earned = earnedBadges(s)
    expect(earned).toEqual(expect.arrayContaining(['exchanges-1', 'exchanges-2', 'givers-1', 'givers-2', 'teach-cooking-1']))
    expect(earned).not.toContain('exchanges-3')
    expect(earned).not.toContain('teach-cooking-2')
    const third = BADGES.find((b) => b.id === 'exchanges-3')!
    expect(badgeProgress(third, s)).toEqual({ value: 5, pct: 5 / 15, earned: false })
  })

  it('i livelli di ogni famiglia hanno soglie crescenti', () => {
    for (const f of FAMILIES) for (let i = 1; i < f.targets.length; i++) expect(f.targets[i], f.key).toBeGreaterThan(f.targets[i - 1])
  })

  it('segnala i badge appena ottenuti e il più alto per famiglia', () => {
    const before = { ...EMPTY_STATS, completed: 4 }
    const after = { ...EMPTY_STATS, completed: 5 }
    expect(newlyEarned(before, after).map((b) => b.id)).toEqual(['exchanges-2'])
    expect(topEarned(after).find((b) => b.key === 'exchanges')?.tier).toBe(2)
  })

  it('ogni badge ha nome e descrizione in entrambe le lingue, senza segnaposto rimasti', () => {
    for (const lang of ['it', 'en'] as const) {
      const tr = getT(lang)
      for (const b of BADGES) {
        expect(badgeName(tr, b), b.id).not.toMatch(/\{|undefined/)
        expect(badgeDesc(tr, b), b.id).not.toMatch(/\{|undefined/)
      }
    }
    expect(badgeName(getT('it'), BADGES.find((b) => b.id === 'teach-cooking-2')!)).toBe('Cucina · Maestro · Argento')
  })
})
