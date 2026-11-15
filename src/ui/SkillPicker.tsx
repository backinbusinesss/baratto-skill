'use client'

import { Check, Plus, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CATEGORIES, type CategoryId, categoryById } from '@/content/categories'
import { normalize } from '@/content/comuni'
import { SKILLS } from '@/content/skills'
import { POPULAR } from '@/domain/people'
import { LEVELS, type Level, type SkillLevel } from '@/domain/types'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { CategoryIcon } from './Icon'
import { LevelPips } from './bits'

/**
 * Scelta delle competenze: ricerca (senza accenti) + categorie + elenco.
 * Con `withLevel` ogni competenza scelta ha anche il livello.
 */
export function SkillPicker({
  value,
  onChange,
  withLevel,
  exclude,
  excludeLabel,
}: {
  value: SkillLevel[]
  onChange(v: SkillLevel[]): void
  withLevel?: boolean
  exclude?: Set<string>
  excludeLabel?: string
}) {
  const tr = useT()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CategoryId | 'popular'>('popular')
  const selected = new Set(value.map((v) => v.id))

  const list = useMemo(() => {
    const n = normalize(q)
    if (n) return SKILLS.filter((s) => normalize(tr.skill(s.id)).includes(n) || normalize(tr.cat(s.cat)).includes(n)).slice(0, 40)
    if (cat === 'popular') return SKILLS.filter((s) => POPULAR.has(s.id)).slice(0, 36)
    return SKILLS.filter((s) => s.cat === cat)
  }, [q, cat, tr])

  const toggle = (id: string) => {
    if (selected.has(id)) onChange(value.filter((v) => v.id !== id))
    else onChange([...value, { id, level: 3 }])
  }
  const setLevel = (id: string, level: Level) => onChange(value.map((v) => (v.id === id ? { ...v, level } : v)))

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-4 space-y-2">
          {value.map((v) => {
            const s = SKILLS.find((x) => x.id === v.id)
            return (
              <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sheet px-3 py-2 shadow-paper">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s ? categoryById(s.cat).color : undefined }} />
                <span className="min-w-0 flex-1 font-semibold">{tr.skill(v.id)}</span>
                {withLevel && (
                  <span className="flex gap-1" role="radiogroup" aria-label={tr.t('people.minLevel')}>
                    {LEVELS.map((l) => (
                      <button
                        key={l}
                        type="button"
                        role="radio"
                        aria-checked={v.level === l}
                        onClick={() => setLevel(v.id, l)}
                        className={cx(
                          'flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold',
                          v.level === l ? 'bg-ink text-paper' : 'bg-well text-muted hover:text-ink',
                        )}
                      >
                        <LevelPips level={l} />
                        <span className="hidden sm:inline">{tr.m.levels[l]}</span>
                      </button>
                    ))}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-icon !min-h-8 !w-8"
                  onClick={() => toggle(v.id)}
                  aria-label={tr.t('profile.removeSkill', { name: tr.skill(v.id) })}
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          className="field !pl-10"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr.t('onboarding.skillSearch', { count: SKILLS.length })}
          aria-label={tr.t('common.search')}
        />
      </div>

      {!q && (
        <div className="no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button type="button" className={cx('chip shrink-0', cat === 'popular' && 'on')} onClick={() => setCat('popular')}>
            {tr.t('explore.popular')}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className={cx('chip shrink-0', cat === c.id && 'on')} onClick={() => setCat(c.id)}>
              <CategoryIcon id={c.id} size={15} />
              {tr.cat(c.id)}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {list.map((s) => {
          const on = selected.has(s.id)
          const blocked = exclude?.has(s.id)
          return (
            <button
              key={s.id}
              type="button"
              disabled={blocked}
              title={blocked ? excludeLabel : undefined}
              aria-pressed={on}
              onClick={() => toggle(s.id)}
              className={cx('chip', on && 'on', blocked && 'opacity-40 line-through')}
            >
              {on ? <Check size={14} /> : <Plus size={14} className="text-faint" />}
              {tr.skill(s.id)}
            </button>
          )
        })}
        {list.length === 0 && <p className="text-muted">{tr.t('explore.noResults', { q })}</p>}
      </div>
    </div>
  )
}
