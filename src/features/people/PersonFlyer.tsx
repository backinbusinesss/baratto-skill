'use client'

import { Star } from 'lucide-react'
import Link from 'next/link'
import { comuneById } from '@/content/comuni'
import { formatKm } from '@/domain/geo'
import type { Match } from '@/domain/matching'
import { shortName } from '@/domain/people'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'
import { PremiumTag, VerifiedMark } from '@/ui/bits'

const PINS = ['var(--coral)', 'var(--cobalt)', 'var(--mint)', 'var(--yellow)']

/**
 * La persona come volantino appeso in bacheca: in alto chi è e cosa offre (scritto "a mano"),
 * in basso le linguette da strappare, una per competenza. Le linguette di ciò che cerchi sono verdi.
 */
export function PersonFlyer({ match, className }: { match: Match; className?: string }) {
  const tr = useT()
  const p = match.person
  const city = comuneById(p.comuneId)?.name
  const wanted = new Set(match.get.map((g) => g.id))
  const headline = match.get[0]?.id ?? p.offers[0].id
  const tilt = ((p.seed % 9) - 4) * 0.28
  const tabs = [...p.offers].sort((a, b) => Number(wanted.has(b.id)) - Number(wanted.has(a.id))).slice(0, 5)
  const hint =
    match.kind === 'perfect'
      ? tr.t('kindHints.perfect', { give: tr.skill(match.give[0]), get: tr.skill(match.get[0].id), name: p.first })
      : match.kind === 'theyTeach'
        ? tr.t('kindHints.theyTeach', { get: tr.skill(match.get[0].id), name: p.first })
        : match.kind === 'theyLearn'
          ? tr.t('kindHints.theyLearn', { give: tr.skill(match.give[0]), name: p.first })
          : null

  return (
    <Link
      href={`/app/persona/?id=${p.id}`}
      className={cx('group block pt-2 transition-transform duration-300 hover:!rotate-0 focus-visible:!rotate-0', className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="flyer px-4 pb-4 pt-5">
        <span className="flyer-pin" style={{ ['--pin' as string]: PINS[p.seed % PINS.length] }} />
        <div className="flex items-start gap-3">
          <Avatar seed={p.id} name={`${p.first} ${p.last}`} size={46} ring={p.premium ? 'premium' : 'none'} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[1.05rem] font-bold" style={{ fontStretch: '88%' }}>
                {shortName(p)}
              </span>
              {p.verified && <VerifiedMark />}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 text-[0.82rem] text-muted">
              <span>
                {city} · {formatKm(match.distKm, tr.locale)}
              </span>
              {p.reviews > 0 && (
                <span className="inline-flex items-center gap-0.5 font-semibold text-ink">
                  <Star size={12} fill="var(--yellow)" stroke="var(--yellow-ink)" />
                  {tr.num(p.rating)} <span className="font-normal text-muted">({p.reviews})</span>
                </span>
              )}
            </div>
          </div>
          {p.premium && <PremiumTag />}
        </div>
        <p className="hand mt-3 text-[1.65rem] leading-[1.05] text-ink">{tr.skill(headline)}!</p>
        {hint && (
          <p
            className={cx(
              'mt-2 inline-block rounded-md px-2 py-1 text-[0.8rem] font-semibold leading-snug',
              match.kind === 'perfect' ? 'bg-mint-soft text-mint-ink' : 'bg-cobalt-soft text-cobalt',
            )}
          >
            {hint}
          </p>
        )}
      </div>
      <div className="tabs-row">
        {tabs.map((o) => (
          <span key={o.id} className={cx('tear-tab', wanted.has(o.id) && 'hit')} title={tr.skill(o.id)}>
            {tr.skill(o.id)}
          </span>
        ))}
      </div>
    </Link>
  )
}
