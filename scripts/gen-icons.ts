/**
 * Genera src/ui/icons.generated.ts: importa da lucide-react solo le icone usate da competenze,
 * categorie e badge (un import per icona, così il bundle non si porta dietro tutta la libreria).
 * Si ferma con un errore se un nome non esiste in lucide.
 *
 * Uso: npm run icons
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import * as L from 'lucide-react'
import { CATEGORIES } from '../src/content/categories'
import { CATEGORY_LEARN_ICONS, SKILL_ICONS } from '../src/content/skillIcons'
import { FAMILIES, SPECIALS } from '../src/domain/badges'

const kebab = (p: string) =>
  p
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()

const lucide = L as unknown as Record<string, unknown> & { icons: Record<string, unknown> }
const byKebab = new Map<string, string>()
for (const pascal of Object.keys(lucide.icons)) byKebab.set(kebab(pascal), pascal)

const wanted = new Set<string>([
  ...Object.values(SKILL_ICONS),
  ...Object.values(CATEGORY_LEARN_ICONS),
  ...CATEGORIES.map((c) => c.icon),
  ...FAMILIES.map((f) => f.icon),
  ...SPECIALS.map((s) => s.icon),
])

const missing: string[] = []
const entries: [string, string][] = []
for (const name of [...wanted].sort()) {
  if (name.startsWith('x-') || name.startsWith('flag:')) continue
  // nome canonico, oppure l'alias esportato (es. "music" → Music)
  const alias = name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')
  const pascal = byKebab.get(name) ?? (lucide[alias] ? alias : undefined)
  if (!pascal || !lucide[pascal]) missing.push(name)
  else entries.push([name, pascal])
}
if (missing.length) {
  console.error(`icone lucide inesistenti: ${missing.join(', ')}`)
  process.exit(1)
}

const src = `/* generato da scripts/gen-icons.ts: non modificare a mano (npm run icons) */
import {
${entries.map(([, p]) => `  ${p},`).join('\n')}
  type LucideIcon,
} from 'lucide-react'

export const LUCIDE: Record<string, LucideIcon> = {
${entries.map(([k, p]) => `  '${k}': ${p},`).join('\n')}
}
`
writeFileSync(join(process.cwd(), 'src/ui/icons.generated.ts'), src)
console.log(`icone: ${entries.length} lucide`)
