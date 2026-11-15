import type { CategoryId } from '@/content/categories'
import type { BadgeDef } from '@/domain/badges'
import { interpolate, type Translator } from './index'

type Pair = readonly string[]

function pair(tr: Translator, b: BadgeDef): Pair {
  const m = tr.m.badges
  if (b.kind === 'family') return m.families[b.key as keyof typeof m.families]
  if (b.kind === 'teach') return m.teach
  if (b.kind === 'learn') return m.learn
  return m.special[b.key as keyof typeof m.special]
}

/** "Bronzo", "Argento"… (vuoto per gli speciali). */
export function tierLabel(tr: Translator, b: BadgeDef): string {
  return b.tier ? tr.m.badges.tiers[b.tier - 1] : ''
}

/** "Scambista · Oro", "Cucina · Maestro · Bronzo", "Pioniere". */
export function badgeName(tr: Translator, b: BadgeDef): string {
  const base = interpolate(pair(tr, b)[0], { cat: b.kind === 'family' || b.kind === 'special' ? '' : tr.cat(b.key as CategoryId) })
  return b.tier ? `${base} · ${tierLabel(tr, b)}` : base
}

/** Nome senza livello, per i titoli dei gruppi e le vetrine. */
export function badgeBaseName(tr: Translator, b: BadgeDef): string {
  return interpolate(pair(tr, b)[0], { cat: b.kind === 'teach' || b.kind === 'learn' ? tr.cat(b.key as CategoryId) : '' })
}

export function badgeDesc(tr: Translator, b: BadgeDef): string {
  return interpolate(pair(tr, b)[1], { n: b.target, cat: b.kind === 'teach' || b.kind === 'learn' ? tr.cat(b.key as CategoryId) : '' })
}
