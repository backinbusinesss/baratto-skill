import { CATEGORIES } from '@/content/categories'
import { COMUNI } from '@/content/comuni'
import { SKILLS, skillsInCategory } from '@/content/skills'
import { categories as enCat } from '@/i18n/en/categories'
import { skills as enSkills } from '@/i18n/en/skills'
import { categories as itCat } from '@/i18n/it/categories'
import { skills as itSkills } from '@/i18n/it/skills'

describe('catalogo delle competenze', () => {
  it('ha almeno 400 competenze con id unici', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(400)
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(SKILLS.length)
  })

  it('ogni categoria ha almeno 20 competenze e un nome in entrambe le lingue', () => {
    for (const c of CATEGORIES) {
      expect(skillsInCategory(c.id).length, c.id).toBeGreaterThanOrEqual(20)
      expect(itCat[c.id].name).toBeTruthy()
      expect(enCat[c.id].name).toBeTruthy()
    }
  })

  it('ogni competenza ha il nome in italiano e in inglese, e non ci sono nomi orfani', () => {
    const ids = new Set(SKILLS.map((s) => s.id))
    for (const s of SKILLS) {
      expect(itSkills[s.id], `it:${s.id}`).toBeTruthy()
      expect(enSkills[s.id], `en:${s.id}`).toBeTruthy()
    }
    expect(Object.keys(itSkills).filter((k) => !ids.has(k))).toEqual([])
    expect(Object.keys(enSkills).filter((k) => !ids.has(k))).toEqual([])
  })
})

describe('comuni', () => {
  it('sono almeno 250, con id unici e coordinate in Italia', () => {
    expect(COMUNI.length).toBeGreaterThanOrEqual(250)
    expect(new Set(COMUNI.map((c) => c.id)).size).toBe(COMUNI.length)
    for (const c of COMUNI) {
      expect(c.lat, c.name).toBeGreaterThan(35.4)
      expect(c.lat, c.name).toBeLessThan(47.2)
      expect(c.lon, c.name).toBeGreaterThan(6.5)
      expect(c.lon, c.name).toBeLessThan(18.6)
    }
  })

  it('coprono tutte le 20 regioni', () => {
    expect(new Set(COMUNI.map((c) => c.region)).size).toBe(20)
  })
})
