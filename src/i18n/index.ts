import type { CategoryId } from '@/content/categories'
import { categories as enCategories } from './en/categories'
import { content as enContent } from './en/content'
import { messages as enMessages } from './en/messages'
import { skills as enSkills } from './en/skills'
import { categories as itCategories } from './it/categories'
import { type Content, content as itContent } from './it/content'
import { type Messages, messages as itMessages } from './it/messages'
import { skills as itSkills } from './it/skills'

export type Lang = 'it' | 'en'
export const LANGS: Lang[] = ['it', 'en']
export const LANG_LABEL: Record<Lang, string> = { it: 'Italiano', en: 'English' }

interface Dict {
  messages: Messages
  skills: Record<string, string>
  categories: Record<CategoryId, { name: string; blurb: string }>
  content: Content
  locale: string
}

const DICTS: Record<Lang, Dict> = {
  it: { messages: itMessages, skills: itSkills, categories: itCategories, content: itContent, locale: 'it-IT' },
  en: { messages: enMessages, skills: enSkills, categories: enCategories, content: enContent, locale: 'en-GB' },
}

export type Vars = Record<string, string | number>

type Plural = { one: string; other: string }
const isPlural = (v: unknown): v is Plural => !!v && typeof v === 'object' && 'one' in v && 'other' in v

/** Le chiavi "a.b.c" delle foglie traducibili (stringhe e plurali). */
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends Plural
      ? `${P}${K}`
      : T[K] extends readonly unknown[]
        ? never
        : Leaves<T[K], `${P}${K}.`>
}[keyof T & string]

export type MessageKey = Leaves<Messages>

function lookup(obj: unknown, key: string): unknown {
  let cur: unknown = obj
  for (const part of key.split('.')) {
    if (cur && typeof cur === 'object' && part in cur) cur = (cur as Record<string, unknown>)[part]
    else return undefined
  }
  return cur
}

export function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

export interface Translator {
  lang: Lang
  locale: string
  /** testo tradotto; con `count` sceglie singolare o plurale */
  t(key: MessageKey, vars?: Vars): string
  /** l'albero dei messaggi, per le liste (giorni, FAQ…) */
  m: Messages
  c: Content
  skill(id: string): string
  cat(id: CategoryId): string
  catBlurb(id: CategoryId): string
  num(n: number, digits?: number): string
  date(d: Date | string, opts?: Intl.DateTimeFormatOptions): string
  /** "sab 21 nov, 19:00" */
  slot(iso: string): string
  /** "chitarra, inglese e Excel" */
  list(items: string[]): string
  /** "5 minuti", "2 ore" */
  duration(mins: number): string
}

const cache = new Map<Lang, Translator>()

export function getT(lang: Lang): Translator {
  const hit = cache.get(lang)
  if (hit) return hit
  const d = DICTS[lang] ?? DICTS.it
  const plural = new Intl.PluralRules(d.locale)
  const tr: Translator = {
    lang,
    locale: d.locale,
    m: d.messages,
    c: d.content,
    t(key, vars) {
      let v = lookup(d.messages, key)
      if (v === undefined) v = lookup(DICTS.it.messages, key)
      if (isPlural(v)) {
        const n = Number(vars?.count ?? 0)
        v = plural.select(n) === 'one' ? v.one : v.other
      }
      return typeof v === 'string' ? interpolate(v, vars) : key
    },
    skill: (id) => d.skills[id] ?? DICTS.it.skills[id] ?? id,
    cat: (id) => d.categories[id]?.name ?? id,
    catBlurb: (id) => d.categories[id]?.blurb ?? '',
    num: (n, digits = 1) => n.toLocaleString(d.locale, { maximumFractionDigits: digits }),
    date: (x, opts = { day: 'numeric', month: 'long', year: 'numeric' }) =>
      new Date(x).toLocaleDateString(d.locale, opts),
    slot: (iso) => {
      const dt = new Date(iso)
      const day = dt.toLocaleDateString(d.locale, { weekday: 'short', day: 'numeric', month: 'short' })
      const time = dt.toLocaleTimeString(d.locale, { hour: '2-digit', minute: '2-digit' })
      return `${day}, ${time}`
    },
    list: (items) => new Intl.ListFormat(d.locale, { style: 'long', type: 'conjunction' }).format(items),
    duration: (mins) =>
      mins < 60 ? tr.t('common.minutes', { count: mins }) : tr.t('common.hoursTime', { count: Math.round(mins / 60) }),
  }
  cache.set(lang, tr)
  return tr
}

/** Lingua preferita del browser, se è tra quelle disponibili. */
export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'it'
  const l = (navigator.language || 'it').slice(0, 2).toLowerCase()
  return l === 'it' ? 'it' : 'en'
}
