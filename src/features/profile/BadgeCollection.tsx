'use client'

import { useMemo, useState } from 'react'
import { BADGE_GROUPS, BADGES, type BadgeGroup, badgeProgress, type Stats, TIER_COLORS } from '@/domain/badges'
import { badgeDesc, badgeName } from '@/i18n/badges'
import { useT } from '@/store/hooks'
import { BadgeStamp } from '@/ui/BadgeStamp'
import { Segmented } from '@/ui/bits'
import { NamedIcon } from '@/ui/Icon'

type Filter = 'all' | 'earned' | 'locked'

/** La collezione completa dei badge: riepilogo, prossimi traguardi, filtri e gruppi. */
export function BadgeCollection({ stats }: { stats: Stats }) {
  const tr = useT()
  const [filter, setFilter] = useState<Filter>('all')
  const rows = useMemo(() => BADGES.map((b) => ({ b, p: badgeProgress(b, stats) })), [stats])
  const earned = rows.filter((r) => r.p.earned)
  const tierCounts = TIER_COLORS.map((_, i) => earned.filter((r) => r.b.tier === i + 1).length)
  // i tre badge non ancora ottenuti più vicini al traguardo
  const next = rows
    .filter((r) => !r.p.earned && r.p.value > 0)
    .sort((a, b) => b.p.pct - a.p.pct)
    .slice(0, 3)
  const shown = rows.filter((r) => (filter === 'earned' ? r.p.earned : filter === 'locked' ? !r.p.earned : true))

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
        <div className="sheet p-5">
          <p className="num text-5xl font-extrabold leading-none" style={{ fontStretch: '66%' }}>
            {earned.length}
            <span className="text-2xl text-faint"> / {BADGES.length}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-well">
            <div className="h-full rounded-full bg-cobalt" style={{ width: `${(earned.length / BADGES.length) * 100}%` }} />
          </div>
          <ul className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            {tr.m.badges.tiers.map((t, i) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: TIER_COLORS[i] }} />
                {t} <span className="num text-muted">{tierCounts[i]}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sheet p-5">
          <p className="font-bold">{tr.t('badges.next')}</p>
          <ul className="mt-3 space-y-3">
            {next.map(({ b, p }) => (
              <li key={b.id} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ color: b.color, background: `color-mix(in srgb, ${b.color} 13%, var(--sheet))` }}>
                  <NamedIcon name={b.icon} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{badgeName(tr, b)}</p>
                  <p className="truncate text-xs text-muted">{badgeDesc(tr, b)}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-well">
                    <div className="h-full rounded-full bg-cobalt" style={{ width: `${p.pct * 100}%` }} />
                  </div>
                </div>
                <span className="num shrink-0 text-xs font-semibold text-muted">{tr.t('badges.progress', { value: tr.num(p.value), target: b.target })}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Segmented<Filter>
        className="mt-6 w-fit"
        value={filter}
        onChange={setFilter}
        options={(['all', 'earned', 'locked'] as Filter[]).map((f) => ({ value: f, label: tr.m.badges.filters[f] }))}
      />

      {BADGE_GROUPS.map((g: BadgeGroup) => {
        const items = shown.filter((r) => r.b.group === g)
        if (!items.length) return null
        return (
          <section key={g} className="mt-8">
            <h3 className="flex items-baseline gap-2 text-lg">
              {tr.m.badges.groups[g]}
              <span className="num text-sm font-semibold text-muted">
                {items.filter((r) => r.p.earned).length}/{items.length}
              </span>
            </h3>
            <div className="mt-4 grid grid-cols-3 justify-items-center gap-y-7 sm:grid-cols-5 lg:grid-cols-7">
              {items.map(({ b, p }) => (
                <BadgeStamp key={b.id} badge={b} earned={p.earned} pct={p.pct} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
