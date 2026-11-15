'use client'

import { Check, Crown } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice, PLANS, PREMIUM_RADIUS_KM, TRIAL_DAYS, yearlySavingPct } from '@/domain/plans'
import { getT, type Lang } from '@/i18n'
import { cx } from '@/lib/cx'

/** Prezzi con l'interruttore mensile / annuale; il piano Premium è la carta in rilievo. */
export function Pricing({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const [yearly, setYearly] = useState(true)
  const free = PLANS.free
  const plan = yearly ? PLANS['premium-yearly'] : PLANS['premium-monthly']
  const perMonth = yearly ? Math.round(plan.priceCents / 12) : plan.priceCents

  return (
    <div>
      <div className="mx-auto flex w-fit items-center gap-1 rounded-full bg-well p-1" role="radiogroup" aria-label={tr.t('site.nav.pricing')}>
        {[false, true].map((y) => (
          <button
            key={String(y)}
            role="radio"
            aria-checked={yearly === y}
            onClick={() => setYearly(y)}
            className={cx('flex min-h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors', yearly === y ? 'bg-ink text-paper' : 'text-muted hover:text-ink')}
          >
            {y ? tr.t('premium.yearly') : tr.t('premium.monthly')}
            {y && <span className="rounded-full bg-yellow px-2 py-0.5 text-[0.7rem] font-bold text-[#10162f]">−{yearlySavingPct()}%</span>}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl items-stretch gap-5 md:grid-cols-[1fr_1.15fr]">
        <div className="sheet flex flex-col p-7">
          <p className="font-bold">{tr.t('premium.free')}</p>
          <p className="num mt-3 text-6xl font-extrabold" style={{ fontStretch: '66%' }}>
            0 €
          </p>
          <ul className="mt-6 flex-1 space-y-2.5 text-[0.95rem]">
            <li className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.proposals', { n: free.proposalsPerMonth ?? 0 })}</li>
            <li className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.active', { n: free.activeExchanges ?? 0 })}</li>
            <li className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.radius', { km: free.maxRadiusKm })}</li>
          </ul>
          <Link href="/app/" className="btn btn-outline btn-lg mt-8">
            {tr.t('site.heroCta')}
          </Link>
        </div>

        <div className="premium-card relative flex flex-col overflow-hidden rounded-[28px] p-7 text-white">
          <span className="premium-sheen" aria-hidden />
          <p className="relative flex items-center gap-2 font-bold">
            <Crown size={18} className="text-yellow" /> {tr.t('common.premium')}
          </p>
          <p className="relative mt-3 flex items-baseline gap-2">
            <span className="num text-6xl font-extrabold" style={{ fontStretch: '66%' }}>
              {formatPrice(perMonth, lang)}
            </span>
            <span className="text-sm opacity-75">{tr.t('premium.perMonth')}</span>
          </p>
          <p className="relative text-sm opacity-75">
            {yearly ? `${formatPrice(plan.priceCents, lang)}${tr.t('premium.perYear')}` : ' '}
          </p>
          <ul className="relative mt-6 flex-1 space-y-2.5 text-[0.95rem]">
            {[
              tr.t('premium.features.featured'),
              tr.t('premium.features.unlimited'),
              tr.t('premium.features.radius', { km: PREMIUM_RADIUS_KM }),
              tr.t('premium.features.triads'),
              tr.t('premium.features.filters'),
              tr.t('premium.features.views'),
            ].map((f) => (
              <li key={f} className="flex gap-2.5">
                <Check size={18} className="mt-0.5 shrink-0 text-yellow" /> {f}
              </li>
            ))}
          </ul>
          <Link href="/app/premium/" className="btn btn-yellow btn-lg relative mt-8">
            {tr.t('premium.trial', { days: TRIAL_DAYS })}
          </Link>
        </div>
      </div>
    </div>
  )
}
