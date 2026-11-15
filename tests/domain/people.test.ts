import { comuneById, COMUNI } from '@/content/comuni'
import { skillById } from '@/content/skills'
import { haversineKm } from '@/domain/geo'
import { generatePeople, getPeople, PEOPLE_COUNT, personById } from '@/domain/people'

describe('profili demo', () => {
  const people = getPeople()

  it('sono 3.000 e lo stesso seme dà sempre gli stessi profili', () => {
    expect(people).toHaveLength(PEOPLE_COUNT)
    const again = generatePeople()
    expect(again.map((p) => `${p.id}${p.first}${p.last}${p.comuneId}`)).toEqual(
      people.map((p) => `${p.id}${p.first}${p.last}${p.comuneId}`),
    )
    expect(personById(people[42].id)).toBe(people[42])
  })

  it('id unici e almeno una persona in ogni comune', () => {
    expect(new Set(people.map((p) => p.id)).size).toBe(people.length)
    const comuni = new Set(people.map((p) => p.comuneId))
    expect(comuni.size).toBe(COMUNI.length)
  })

  it('offerte e richieste sono competenze del catalogo e non si sovrappongono mai', () => {
    for (const p of people) {
      expect(p.offers.length).toBeGreaterThanOrEqual(2)
      expect(p.wants.length).toBeGreaterThanOrEqual(1)
      const offered = new Set(p.offers.map((o) => o.id))
      expect(offered.size).toBe(p.offers.length)
      for (const id of [...offered, ...p.wants]) expect(skillById(id), id).toBeDefined()
      for (const w of p.wants) expect(offered.has(w), `${p.id} ${w}`).toBe(false)
    }
  })

  it('stanno vicino al proprio comune', () => {
    for (const p of people) expect(haversineKm(p, comuneById(p.comuneId)!)).toBeLessThan(8)
  })

  it('il Premium è tra l’8% e il 16% e le valutazioni sono sensate', () => {
    const share = people.filter((p) => p.premium).length / people.length
    expect(share).toBeGreaterThan(0.08)
    expect(share).toBeLessThan(0.16)
    for (const p of people) {
      if (p.reviews === 0) expect(p.rating).toBe(0)
      else {
        expect(p.rating).toBeGreaterThanOrEqual(3.4)
        expect(p.rating).toBeLessThanOrEqual(5)
      }
      expect(p.avail).toBeGreaterThan(0)
    }
  })
})
