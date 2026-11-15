'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CATEGORIES, type CategoryId, categoryById } from '@/content/categories'
import { comuneById, normalize } from '@/content/comuni'
import { SKILLS } from '@/content/skills'
import { haversineKm } from '@/domain/geo'
import { cx } from '@/lib/cx'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { CategoryIcon, SkillIcon } from '@/ui/Icon'
import { usePeople } from '../people/useMatches'

/** Quante persone nel raggio offrono / cercano ciascuna competenza. */
export function useSkillCounts() {
  const me = useApp((s) => s.me)!
  const people = usePeople()
  return useMemo(() => {
    const center = comuneById(me.comuneId)!
    const offer = new Map<string, number>()
    const want = new Map<string, number>()
    for (const p of people) {
      if (haversineKm(center, p) > me.radiusKm) continue
      for (const o of p.offers) offer.set(o.id, (offer.get(o.id) ?? 0) + 1)
      for (const w of p.wants) want.set(w, (want.get(w) ?? 0) + 1)
    }
    return { offer, want }
  }, [people, me])
}

export function Explore() {
  const tr = useT()
  const router = useRouter()
  const params = useSearchParams()
  const me = useApp((s) => s.me)!
  const cat = (params.get('cat') as CategoryId | null) ?? null
  const [q, setQ] = useState('')
  const counts = useSkillCounts()
  const mine = new Set([...me.offers.map((o) => o.id), ...me.wants])

  const visible = useMemo(() => {
    const n = normalize(q)
    return SKILLS.filter((s) => (!cat || s.cat === cat) && (!n || normalize(tr.skill(s.id)).includes(n)))
  }, [q, cat, tr])

  const groups = CATEGORIES.filter((c) => !cat || c.id === cat)
    .map((c) => ({ c, items: visible.filter((s) => s.cat === c.id).sort((a, b) => (counts.offer.get(b.id) ?? 0) - (counts.offer.get(a.id) ?? 0)) }))
    .filter((g) => g.items.length)

  return (
    <div>
      <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('explore.title')}</h1>
      <p className="mt-1 text-muted">{tr.t('explore.sub', { count: SKILLS.length, cats: CATEGORIES.length })}</p>

      <div className="relative mt-5">
        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
        <input className="field !min-h-12 !pl-11 !text-[1.05rem]" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr.t('explore.searchPlaceholder')} aria-label={tr.t('common.search')} />
      </div>

      <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        <button className={cx('chip shrink-0', !cat && 'on')} onClick={() => router.replace('/app/esplora/')}>
          {tr.t('explore.allCategories')}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={cx('chip shrink-0', cat === c.id && 'on')} onClick={() => router.replace(`/app/esplora/?cat=${c.id}`)}>
            <span style={{ color: cat === c.id ? undefined : c.color }}>
              <CategoryIcon id={c.id} size={15} />
            </span>
            {tr.cat(c.id)}
          </button>
        ))}
      </div>

      {groups.length === 0 && <p className="mt-8 text-muted">{tr.t('explore.noResults', { q })}</p>}

      {groups.map(({ c, items }) => (
        <section key={c.id} className="mt-9">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: c.color }}>
              <CategoryIcon id={c.id} size={20} />
            </span>
            <div>
              <h2 className="text-[1.35rem]">{tr.cat(c.id)}</h2>
              <p className="text-sm text-muted">{tr.catBlurb(c.id)}</p>
            </div>
          </div>
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => {
              const n = counts.offer.get(s.id) ?? 0
              return (
                <li key={s.id}>
                  <Link href={`/app/competenza/?id=${s.id}`} className="group flex items-center justify-between gap-3 border-b border-line py-2.5 hover:border-ink">
                    <span className={cx('flex min-w-0 items-center gap-2.5 font-medium', mine.has(s.id) && 'font-bold')}>
                      <span className="shrink-0" style={{ color: categoryById(s.cat).color }}>
                        <SkillIcon id={s.id} size={17} />
                      </span>
                      <span className="truncate">{tr.skill(s.id)}</span>
                      {mine.has(s.id) && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />}
                    </span>
                    <span className={cx('num shrink-0 text-sm', n ? 'text-muted' : 'text-faint')}>{n}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
