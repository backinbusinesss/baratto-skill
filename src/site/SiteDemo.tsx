'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { formatKm } from '@/domain/geo'
import { findMatches } from '@/domain/matching'
import { generateNeighbors, getPeople, shortName } from '@/domain/people'
import { availBit } from '@/domain/types'
import { getT, type Lang } from '@/i18n'
import { cx } from '@/lib/cx'
import { Avatar } from '@/ui/Avatar'

const TEACH = ['english', 'excel', 'fresh-pasta', 'guitar', 'yoga', 'math-high', 'photography', 'small-repairs']
const LEARN = ['pc-repair', 'piano', 'spanish', 'bread', 'drawing', 'swimming', 'sewing-basics', 'canva']
const CITIES = ['roma', 'milano', 'napoli', 'torino', 'bologna', 'firenze', 'bari', 'palermo']

let ALL = 0
for (let d = 0; d < 7; d++) for (let s = 0; s < 3; s++) ALL |= availBit(d, s)

/** La demo interattiva del sito: scegli cosa sai fare e cosa vuoi imparare, e vedi chi c'è. */
export function SiteDemo({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const [teach, setTeach] = useState('english')
  const [learn, setLearn] = useState('pc-repair')
  const [city, setCity] = useState('roma')

  const res = useMemo(() => {
    const c = comuneById(city)!
    const me = { offers: [{ id: teach, level: 3 as const }], wants: [learn], avail: ALL, mode: 'both' as const }
    // come nell'app: ai profili demo si aggiunge il "vicinato" generato per chi cerca
    const people = [...getPeople(), ...generateNeighbors(me, city, 'sito', 40, 25)]
    const ms = findMatches(me, people, { center: c, radiusKm: 30 })
    return { perfect: ms.filter((m) => m.kind === 'perfect'), teachers: ms.filter((m) => m.kind === 'theyTeach') }
  }, [teach, learn, city])
  const show = [...res.perfect, ...res.teachers].slice(0, 3)

  const picker = (label: string, list: string[], value: string, set: (v: string) => void, name: (id: string) => string) => (
    <div>
      <p className="mb-2 text-sm font-semibold text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map((id) => (
          <button key={id} type="button" className={cx('chip', value === id && 'on')} aria-pressed={value === id} onClick={() => set(id)}>
            {name(id)}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
      <div className="space-y-5">
        {picker(tr.t('site.demoTeach'), TEACH, teach, setTeach, tr.skill)}
        {picker(tr.t('site.demoLearn'), LEARN, learn, setLearn, tr.skill)}
        {picker(tr.t('site.demoCity'), CITIES, city, setCity, (id) => comuneById(id)!.name)}
      </div>
      <div aria-live="polite">
        <p className="text-[1.6rem] font-bold leading-tight" style={{ fontStretch: '85%' }}>
          <span className="marker">{tr.t('site.demoResults', { count: res.perfect.length })}</span>{' '}
          {res.teachers.length > 0 && <span className="text-muted">{tr.t('site.demoPartial', { count: res.teachers.length })}</span>}
        </p>
        {show.length ? (
          <ul className="mt-5 space-y-3">
            {show.map((m) => (
              <li key={m.person.id} className="flex items-center gap-3 rounded-xl bg-sheet p-3 shadow-paper">
                <Avatar seed={m.person.id} name={`${m.person.first} ${m.person.last}`} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {shortName(m.person)} <span className="font-normal text-muted">· {comuneById(m.person.comuneId)?.name}, {formatKm(m.distKm, tr.locale)}</span>
                  </p>
                  <p className="truncate text-sm">
                    {m.kind === 'perfect'
                      ? tr.t('kindHints.perfect', { give: tr.skill(m.give[0]), get: tr.skill(m.get[0].id), name: m.person.first })
                      : tr.t('kindHints.theyTeach', { get: tr.skill(m.get[0].id), name: m.person.first })}
                  </p>
                </div>
                <span className={cx('hidden rounded-full px-2 py-0.5 text-xs font-bold sm:inline', m.kind === 'perfect' ? 'bg-mint-soft text-mint-ink' : 'bg-cobalt-soft text-cobalt')}>
                  {tr.m.kinds[m.kind]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 text-muted">{tr.t('site.demoNone')}</p>
        )}
        <Link href="/app/" className="btn btn-primary mt-6">
          {tr.t('site.heroCta')} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
