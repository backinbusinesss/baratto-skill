'use client'

import { Crown, List, Map as MapIcon, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { CATEGORIES, type CategoryId } from '@/content/categories'
import { comuneById } from '@/content/comuni'
import { comuniWithin } from '@/domain/geo'
import { SKILLS } from '@/content/skills'
import type { SortKey } from '@/domain/matching'
import { clampRadius, isPremium, limitsFor } from '@/domain/plans'
import { LEVELS, type Level } from '@/domain/types'
import { cx } from '@/lib/cx'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Empty, Segmented } from '@/ui/bits'
import { ComuneSearch } from '@/ui/ComuneSearch'
import { ItalyMap } from '@/ui/ItalyMap'
import { Sheet } from '@/ui/Sheet'
import { ScrollRow } from '@/ui/ScrollRow'
import { PersonFlyer } from './PersonFlyer'
import { useMatches } from './useMatches'

export function People() {
  const tr = useT()
  const params = useSearchParams()
  const me = useApp((s) => s.me)!
  const plan = useApp((s) => s.plan)
  const updateMe = useApp((s) => s.updateMe)
  const premium = isPremium(plan)
  const maxKm = limitsFor(plan).maxRadiusKm

  const [view, setView] = useState<'list' | 'map'>('list')
  const [sort, setSort] = useState<SortKey>('best')
  const [cat, setCat] = useState<CategoryId | ''>((params.get('cat') as CategoryId) ?? '')
  const [skill, setSkill] = useState(params.get('skill') ?? '')
  const [minLevel, setMinLevel] = useState<Level | 0>(0)
  const [mode, setMode] = useState<'any' | 'live' | 'online'>('any')
  const [availOnly, setAvailOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [text, setText] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [selected, setSelected] = useState<string | undefined>()
  const [limited, setLimited] = useState(false)

  const city = comuneById(me.comuneId)!
  const matches = useMatches({
    sort,
    cat: cat || undefined,
    skill: skill || undefined,
    minLevel: premium && minLevel ? minLevel : undefined,
    mode,
    availOnly: premium && availOnly,
    verifiedOnly: premium && verifiedOnly,
    text,
  })
  const shown = matches.slice(0, 60)
  const activeFilters = [cat, skill, minLevel, mode !== 'any', availOnly, verifiedOnly].filter(Boolean).length
  const skillOptions = useMemo(
    () => (cat ? SKILLS.filter((s) => s.cat === cat) : SKILLS).map((s) => ({ id: s.id, name: tr.skill(s.id) })).sort((a, b) => a.name.localeCompare(b.name, tr.locale)),
    [cat, tr],
  )
  const selMatch = matches.find((m) => m.person.id === selected)

  const setRadius = (km: number) => {
    setLimited(km > maxKm)
    updateMe({ radiusKm: clampRadius(plan, km) })
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('people.title')}</h1>
          <button className="mt-1 text-muted hover:text-ink" onClick={() => setCityOpen(true)}>
            {tr.t('people.near')} <span className="font-bold text-ink underline decoration-cobalt decoration-2 underline-offset-4">{city.name}</span> · {me.radiusKm} km
          </button>
        </div>
        <Segmented<'list' | 'map'>
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: <><List size={16} /> {tr.t('people.list')}</> },
            { value: 'map', label: <><MapIcon size={16} /> {tr.t('people.map')}</> },
          ]}
        />
      </div>

      {/* barra dei filtri */}
      <div className="sticky top-[52px] z-20 -mx-4 mt-5 bg-paper/92 px-4 py-2 backdrop-blur lg:top-0 lg:mx-0 lg:px-0">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input className="field !min-h-11 !pl-10" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr.t('people.textPlaceholder')} aria-label={tr.t('people.textPlaceholder')} />
          </div>
          <button className="btn btn-outline relative" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={17} /> <span className="hidden sm:inline">{tr.t('common.filters')}</span>
            {activeFilters > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cobalt px-1 text-[0.7rem] font-bold text-on-cobalt">{activeFilters}</span>}
          </button>
        </div>
        <ScrollRow className="mt-2" innerClassName="items-center gap-1.5 pb-1">
          {(['best', 'near', 'rating', 'new'] as SortKey[]).map((s) => (
            <button key={s} className={cx('chip shrink-0', sort === s && 'on')} aria-pressed={sort === s} onClick={() => setSort(s)}>
              {tr.t(`people.sort${s[0].toUpperCase()}${s.slice(1)}` as 'people.sortBest')}
            </button>
          ))}
          {cat && (
            <button className="chip shrink-0 !bg-cobalt-soft !text-cobalt" onClick={() => { setCat(''); setSkill('') }}>
              {tr.cat(cat)} <X size={14} />
            </button>
          )}
          {skill && (
            <button className="chip shrink-0 !bg-cobalt-soft !text-cobalt" onClick={() => setSkill('')}>
              {tr.skill(skill)} <X size={14} />
            </button>
          )}
        </ScrollRow>
      </div>

      <p className="mb-4 mt-2 text-sm text-muted">{tr.t('people.results', { count: matches.length })}</p>

      {view === 'map' ? (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="aspect-square overflow-hidden rounded-2xl bg-sheet shadow-paper">
            <ItalyMap
              zoom
              center={city}
              radiusKm={me.radiusKm}
              selected={selected}
              onDot={setSelected}
              label={tr.t('people.mapHint')}
              places={comuniWithin(city, me.radiusKm * 1.15).map((x) => x.comune)}
              dots={matches.map((m) => ({
                id: m.person.id,
                lat: m.person.lat,
                lon: m.person.lon,
                tone: m.kind === 'perfect' ? 'perfect' : m.person.premium ? 'premium' : 'match',
                label: `${m.person.first} · ${tr.m.kinds[m.kind]}`,
              }))}
            />
          </div>
          <div>
            <p className="mb-3 text-sm text-muted">{tr.t('people.mapHint')}</p>
            <ul className="mb-4 flex flex-wrap gap-3 text-xs text-muted">
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-mint" /> {tr.t('kinds.perfect')}</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-cobalt" /> {tr.t('kinds.theyTeach')} / {tr.t('kinds.theyLearn').toLowerCase()}</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-yellow ring-1 ring-ink" /> {tr.t('common.featured')}</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-coral" /> {tr.t('people.you')}</li>
            </ul>
            {selMatch ? <PersonFlyer match={selMatch} /> : shown[0] && <PersonFlyer match={shown[0]} />}
          </div>
        </div>
      ) : shown.length ? (
        <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((m) => (
            <PersonFlyer key={m.person.id} match={m} />
          ))}
        </div>
      ) : (
        <Empty action={<button className="btn btn-outline btn-sm" onClick={() => setFiltersOpen(true)}>{tr.t('common.filters')}</button>}>{tr.t('people.empty')}</Empty>
      )}

      {/* filtri */}
      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={tr.t('common.filters')}
        closeLabel={tr.t('common.close')}
        footer={
          <div className="mb-2 flex gap-2">
            <button className="btn btn-ghost" onClick={() => { setCat(''); setSkill(''); setMinLevel(0); setMode('any'); setAvailOnly(false); setVerifiedOnly(false) }}>
              {tr.t('common.reset')}
            </button>
            <button className="btn btn-primary flex-1" onClick={() => setFiltersOpen(false)}>
              {tr.t('people.results', { count: matches.length })}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 flex justify-between font-semibold">
              {tr.t('onboarding.radius')} <span className="num">{me.radiusKm} km</span>
            </span>
            <input type="range" min={1} max={premium ? 150 : 60} value={me.radiusKm} onChange={(e) => setRadius(+e.target.value)} className="w-full" />
            {(limited || !premium) && (
              <span className={cx('mt-1 block text-sm', limited ? 'font-semibold text-coral-ink' : 'text-muted')}>
                {tr.t('people.radiusLimited', { km: maxKm })}{' '}
                {limited && <Link href="/app/premium/" className="underline">{tr.t('common.unlock')}</Link>}
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block font-semibold">{tr.t('people.category')}</span>
            <select className="field" value={cat} onChange={(e) => { setCat(e.target.value as CategoryId); setSkill('') }}>
              <option value="">{tr.t('people.anyCategory')}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{tr.cat(c.id)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-semibold">{tr.t('people.skill')}</span>
            <select className="field" value={skill} onChange={(e) => setSkill(e.target.value)}>
              <option value="">{tr.t('people.anySkill')}</option>
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 block font-semibold">{tr.t('people.mode')}</span>
            <div className="flex flex-wrap gap-1.5">
              {(['any', 'live', 'online'] as const).map((m) => (
                <button key={m} className={cx('chip', mode === m && 'on')} aria-pressed={mode === m} onClick={() => setMode(m)}>
                  {m === 'any' ? tr.t('people.anyMode') : tr.m.modes[m]}
                </button>
              ))}
            </div>
          </div>
          <fieldset disabled={!premium} className={cx('space-y-4 rounded-2xl border-[1.5px] border-dashed border-line-strong p-4', !premium && 'opacity-70')}>
            {!premium && (
              <Link href="/app/premium/" className="flex items-center gap-2 text-sm font-semibold">
                <Crown size={16} className="text-yellow-ink" /> {tr.t('people.advancedLocked')}
              </Link>
            )}
            <div>
              <span className="mb-1.5 block font-semibold">{tr.t('people.minLevel')}</span>
              <div className="flex flex-wrap gap-1.5">
                <button className={cx('chip', minLevel === 0 && 'on')} onClick={() => setMinLevel(0)}>{tr.t('people.anyLevel')}</button>
                {LEVELS.map((l) => (
                  <button key={l} className={cx('chip', minLevel === l && 'on')} aria-pressed={minLevel === l} onClick={() => setMinLevel(l)}>
                    {tr.m.levels[l]}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-[var(--cobalt)]" checked={availOnly} onChange={(e) => setAvailOnly(e.target.checked)} />
              {tr.t('people.availOnly')}
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-[var(--cobalt)]" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              {tr.t('people.verifiedOnly')}
            </label>
          </fieldset>
        </div>
      </Sheet>

      <Sheet open={cityOpen} onClose={() => setCityOpen(false)} title={tr.t('people.changeCity')} closeLabel={tr.t('common.close')}>
        <ComuneSearch
          value={me.comuneId}
          autoFocus
          onChange={(id) => {
            updateMe({ comuneId: id })
            setCityOpen(false)
          }}
        />
      </Sheet>
    </div>
  )
}
