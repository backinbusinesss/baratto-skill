'use client'

import { Check, Crown, Minus } from 'lucide-react'
import { formatPrice, isPremium, PLANS, type PlanId, PREMIUM_RADIUS_KM, TRIAL_DAYS, yearlySavingPct } from '@/domain/plans'
import { balance } from '@/domain/timebank'
import { cx } from '@/lib/cx'
import { usePayments } from '@/providers/payments'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Section } from '@/ui/bits'
import { MemberCard } from '@/ui/MemberCard'
import { toast } from '@/ui/Toaster'

export function Premium() {
  const tr = useT()
  const plan = useApp((s) => s.plan)
  const me = useApp((s) => s.me)!
  const hours = useApp((s) => balance(s.ledger))
  const { checkout, cancelSubscription } = usePayments()

  const buy = async (id: PlanId) => {
    const r = await checkout(id)
    if (r === 'success') toast({ text: tr.t('premium.activated'), tone: 'ok', icon: <Crown size={18} /> })
  }

  const features: [string, boolean][] = [
    [tr.t('premium.features.featured'), false],
    [tr.t('premium.features.unlimited'), false],
    [tr.t('premium.features.radius', { km: PREMIUM_RADIUS_KM }), false],
    [tr.t('premium.features.triads'), false],
    [tr.t('premium.features.workshops'), false],
    [tr.t('premium.features.filters'), false],
    [tr.t('premium.features.views'), false],
    [tr.t('premium.features.badge'), false],
  ]
  const free = PLANS.free

  return (
    <div>
      <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow px-3 py-1 text-sm font-bold text-[#10162f]">
          <Crown size={15} /> {tr.t('common.premium')}
        </span>
        <h1 className="display mt-4 text-[2.9rem] sm:text-[3.8rem]">{tr.t('premium.title')}</h1>
        <p className="mt-3 text-lg text-muted">{tr.t('premium.sub')}</p>
      </div>
      <MemberCard className="mx-auto w-full max-w-sm" name={me.name} since={me.joined || new Date().toISOString()} hours={hours} premium={isPremium(plan)} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* gratis */}
        <div className="sheet flex flex-col p-5">
          <p className="font-bold">{tr.t('premium.free')}</p>
          <p className="num mt-2 text-4xl font-extrabold" style={{ fontStretch: '72%' }}>0 €</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.proposals', { n: free.proposalsPerMonth ?? 0 })}</li>
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.active', { n: free.activeExchanges ?? 0 })}</li>
            <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-mint" /> {tr.t('premium.freeLimits.radius', { km: free.maxRadiusKm })}</li>
          </ul>
          {plan === 'free' ? (
            <span className="btn btn-outline mt-5 pointer-events-none">{tr.t('premium.current')}</span>
          ) : (
            <button
              className="btn btn-ghost mt-5"
              onClick={async () => {
                await cancelSubscription()
                toast({ text: tr.t('premium.cancelled') })
              }}
            >
              {tr.t('premium.cancel')}
            </button>
          )}
        </div>
        {(['premium-monthly', 'premium-yearly'] as const).map((id) => {
          const p = PLANS[id]
          const yearly = id === 'premium-yearly'
          const current = plan === id
          return (
            <div key={id} className={cx('relative flex flex-col rounded-[14px] p-5', yearly ? 'bg-ink text-paper' : 'sheet')}>
              {yearly && (
                <span className="absolute -top-3 right-4 rotate-2 rounded-md bg-yellow px-2.5 py-1 text-xs font-bold text-[#10162f]">
                  {tr.t('premium.save', { pct: yearlySavingPct() })}
                </span>
              )}
              <p className="font-bold">{yearly ? tr.t('premium.yearly') : tr.t('premium.monthly')}</p>
              <p className="mt-2">
                <span className="num text-4xl font-extrabold" style={{ fontStretch: '72%' }}>{formatPrice(p.priceCents, tr.lang)}</span>
                <span className={cx('text-sm', yearly ? 'opacity-70' : 'text-muted')}>{yearly ? tr.t('premium.perYear') : tr.t('premium.perMonth')}</span>
              </p>
              {yearly && <p className="text-sm opacity-70">≈ {formatPrice(Math.round(p.priceCents / 12), tr.lang)}{tr.t('premium.perMonth')}</p>}
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {features.map(([f]) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className={cx('mt-0.5 shrink-0', yearly ? 'text-yellow' : 'text-mint')} /> {f}
                  </li>
                ))}
              </ul>
              {current ? (
                <span className={cx('btn mt-5 pointer-events-none', yearly ? 'bg-paper/15' : 'btn-outline')}>{tr.t('premium.current')}</span>
              ) : (
                <button className={cx('btn mt-5', yearly ? 'btn-yellow' : 'btn-primary')} onClick={() => buy(id)}>
                  {isPremium(plan) ? tr.t('premium.choose') : tr.t('premium.trial', { days: TRIAL_DAYS })}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <Section title={`${tr.t('premium.free')} / ${tr.t('common.premium')}`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong">
                <th className="py-2 font-semibold" />
                <th className="py-2 text-center font-semibold">{tr.t('premium.free')}</th>
                <th className="py-2 text-center font-semibold">{tr.t('common.premium')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [tr.t('premium.features.unlimited'), `${free.proposalsPerMonth} / ${free.activeExchanges}`, '∞'],
                [tr.t('premium.features.radius', { km: PREMIUM_RADIUS_KM }), `${free.maxRadiusKm} km`, `${PREMIUM_RADIUS_KM} km`],
                [tr.t('premium.features.featured'), false, true],
                [tr.t('premium.features.triads'), false, true],
                [tr.t('premium.features.filters'), false, true],
                [tr.t('premium.features.views'), false, true],
              ].map(([label, a, b]) => (
                <tr key={String(label)} className="border-b border-line">
                  <td className="py-3 pr-3">{label}</td>
                  {[a, b].map((v, i) => (
                    <td key={i} className="py-3 text-center">
                      {v === true ? <Check size={18} className="mx-auto text-mint" /> : v === false ? <Minus size={18} className="mx-auto text-faint" /> : <span className="num font-semibold">{v}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={tr.t('premium.faqTitle')}>
        <div className="grid gap-3 md:grid-cols-3">
          {tr.m.premium.faq.map(([q, a]) => (
            <details key={q} className="sheet group p-4" open>
              <summary className="cursor-pointer font-bold">{q}</summary>
              <p className="mt-2 text-sm text-muted">{a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  )
}
