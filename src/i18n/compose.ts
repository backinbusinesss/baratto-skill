import { comuneById } from '@/content/comuni'
import { FEMALE, MALE } from '@/domain/names'
import { mulberry32, pick, int } from '@/domain/rng'
import type { Person } from '@/domain/types'
import { interpolate, type Translator } from './index'

/** Prime parole che restano maiuscole dentro una frase: marchi, sigle, nomi propri. */
const PROPER = new Set(
  `Excel Word PowerPoint Canva WordPress Photoshop Lightroom Linux LinkedIn Arduino Raspberry Google Mac Python Java
  JavaScript React SQL HTML SEO SPID DJ Pilates Feldenkrais Montessori Agile INVALSI Email Tai Qi`.split(/\s+/),
)
/** In inglese anche lingue e aggettivi di nazionalità sono maiuscoli. */
const PROPER_EN = /^(English|Spanish|French|German|Portuguese|Russian|Mandarin|Japanese|Korean|Arabic|Hindi|Turkish|Modern|Dutch|Swedish|Norwegian|Danish|Finnish|Polish|Romanian|Ukrainian|Albanian|Serbo|Hungarian|Czech|Hebrew|Persian|Swahili|Latin|Ancient|Italian|Neapolitan|Esperanto|Indian|Mexican|Chinese|Middle|Emilian|Sicilian|Argentine|Nordic|Montessori)\b/

function skillInSentence(name: string, lang: string): string {
  const first = name.split(/[\s(]/)[0]
  if (PROPER.has(first) || /^[A-Z0-9]{2,}/.test(first)) return name
  if (lang === 'en' && PROPER_EN.test(name)) return name
  return name.charAt(0).toLowerCase() + name.slice(1)
}

export function skillPhrase(tr: Translator, id: string): string {
  return skillInSentence(tr.skill(id), tr.lang)
}

/** La bio di un profilo demo, composta nella lingua corrente a partire dal suo seme. */
export function bioFor(p: Person, tr: Translator): string {
  const rng = mulberry32(p.seed)
  const city = comuneById(p.comuneId)?.name ?? ''
  const c = tr.c
  const parts = [
    interpolate(pick(rng, c.bioOpen), { name: p.first, city }),
    c.jobs[p.job % c.jobs.length],
    interpolate(pick(rng, c.bioOffer), { offer: skillPhrase(tr, p.offers[0].id) }),
    p.wants[0] ? interpolate(pick(rng, c.bioWant), { want: skillPhrase(tr, p.wants[0]) }) : '',
    pick(rng, c.bioClose),
  ]
  return parts.filter(Boolean).join(' ')
}

export interface DemoReview {
  author: string
  stars: number
  text: string
  date: string
  skill: string
}

/** Le recensioni (al massimo `max`) di un profilo demo, coerenti con la sua media. */
export function reviewsFor(p: Person, tr: Translator, max = 6): DemoReview[] {
  if (!p.reviews) return []
  const rng = mulberry32(p.seed ^ 0x5eed)
  const n = Math.min(max, p.reviews)
  const out: DemoReview[] = []
  for (let i = 0; i < n; i++) {
    const skill = pick(rng, p.offers).id
    const first = pick(rng, rng() < 0.5 ? FEMALE : MALE)
    const lastInitial = String.fromCharCode(65 + int(rng, 0, 20))
    const stars = Math.max(3, Math.min(5, Math.round(p.rating + (rng() - 0.4))))
    const daysAgo = i * int(rng, 6, 25) + int(rng, 1, 5)
    out.push({
      author: `${first} ${lastInitial}.`,
      stars,
      text: interpolate(pick(rng, tr.c.reviews), { skill: skillPhrase(tr, skill) }),
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      skill,
    })
  }
  return out
}
