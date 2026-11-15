import { content as enContent } from '@/i18n/en/content'
import { messages as enMessages } from '@/i18n/en/messages'
import { getT } from '@/i18n'
import { bioFor, reviewsFor, skillPhrase } from '@/i18n/compose'
import { content as itContent } from '@/i18n/it/content'
import { messages as itMessages } from '@/i18n/it/messages'
import { JOB_COUNT, getPeople } from '@/domain/people'

/** Struttura di un oggetto: chiavi, lunghezze delle liste e segnaposto di ogni testo. */
function shape(v: unknown, path = ''): string[] {
  if (typeof v === 'string') return [`${path}:${[...v.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')}`]
  if (Array.isArray(v)) return [`${path}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}.${i}`))]
  if (v && typeof v === 'object')
    return Object.keys(v)
      .sort()
      .flatMap((k) => shape((v as Record<string, unknown>)[k], path ? `${path}.${k}` : k))
  return [path]
}

describe('traduzioni', () => {
  it('inglese e italiano hanno le stesse chiavi, liste e segnaposto', () => {
    expect(shape(enMessages)).toEqual(shape(itMessages))
  })

  it('i contenuti demo hanno liste della stessa lunghezza e un mestiere per ogni indice', () => {
    expect(shape(enContent)).toEqual(shape(itContent))
    expect(itContent.jobs).toHaveLength(JOB_COUNT)
  })

  it('t() interpola, gestisce i plurali e ricade sulla chiave se manca', () => {
    const it = getT('it')
    const en = getT('en')
    expect(it.t('common.hours', { count: 1 })).toBe('1 ora')
    expect(it.t('common.hours', { count: 3 })).toBe('3 ore')
    expect(en.t('common.hours', { count: 1 })).toBe('1 hour')
    expect(en.t('home.morning', { name: 'Ada' })).toBe('Good morning, Ada')
    expect(it.t('nope.missing' as never)).toBe('nope.missing')
    expect(it.skill('pc-repair')).toBe('Riparazione PC')
    expect(en.cat('home')).toBe('Home & DIY')
  })

  it('le maiuscole dei nomi nelle frasi sono corrette', () => {
    expect(skillPhrase(getT('it'), 'english')).toBe('inglese')
    expect(skillPhrase(getT('en'), 'english')).toBe('English')
    expect(skillPhrase(getT('it'), 'excel')).toBe('Excel')
    expect(skillPhrase(getT('en'), 'guitar')).toBe('guitar')
  })

  it('compone bio e recensioni senza segnaposto rimasti', () => {
    for (const lang of ['it', 'en'] as const) {
      const tr = getT(lang)
      for (const p of getPeople().slice(0, 50)) {
        expect(bioFor(p, tr)).not.toMatch(/\{\w+\}/)
        for (const r of reviewsFor(p, tr)) expect(r.text).not.toMatch(/\{\w+\}/)
      }
    }
  })
})
