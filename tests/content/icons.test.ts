import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CATEGORIES } from '@/content/categories'
import { CATEGORY_LEARN_ICONS, SKILL_ICONS } from '@/content/skillIcons'
import { SKILLS } from '@/content/skills'
import { BADGES } from '@/domain/badges'
import { CUSTOM_ICON_NAMES } from '@/ui/customIcons'
import { LUCIDE } from '@/ui/icons.generated'

const valid = (name: string) =>
  name.startsWith('flag:')
    ? existsSync(join(process.cwd(), 'public', 'flags', `${name.slice(5)}.svg`))
    : name.startsWith('x-')
      ? CUSTOM_ICON_NAMES.includes(name)
      : name in LUCIDE

describe('icone', () => {
  it('ogni competenza ha la sua icona, e non ci sono icone di competenze inesistenti', () => {
    const ids = new Set(SKILLS.map((s) => s.id))
    for (const s of SKILLS) expect(SKILL_ICONS[s.id], s.id).toBeTruthy()
    expect(Object.keys(SKILL_ICONS).filter((k) => !ids.has(k))).toEqual([])
  })

  it('ogni icona usata esiste: lucide generata, disegnata o bandiera con il suo file', () => {
    const all = [
      ...Object.entries(SKILL_ICONS),
      ...Object.entries(CATEGORY_LEARN_ICONS),
      ...CATEGORIES.map((c) => [c.id, c.icon] as const),
      ...BADGES.map((b) => [b.id, b.icon] as const),
    ]
    for (const [k, name] of all) expect(valid(name), `${k} → ${name}`).toBe(true)
  })

  it('le icone sono varie: almeno 300 diverse per 420 competenze', () => {
    expect(new Set(Object.values(SKILL_ICONS)).size).toBeGreaterThanOrEqual(300)
  })
})
