'use client'

import { ArrowDownLeft, ArrowUpRight, Gift } from 'lucide-react'
import Link from 'next/link'
import { balance, MIN_BALANCE, monthlySeries } from '@/domain/timebank'
import { cx } from '@/lib/cx'
import { findPerson, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Empty, Section } from '@/ui/bits'

export function Hours() {
  const tr = useT()
  const ledger = useApp((s) => s.ledger)
  const neighbors = useApp((s) => s.neighbors)
  const total = balance(ledger)
  const gave = ledger.filter((e) => e.kind === 'gave').reduce((n, e) => n + e.hours, 0)
  const received = -ledger.filter((e) => e.kind === 'received').reduce((n, e) => n + e.hours, 0)
  const series = monthlySeries(ledger, 6)
  const max = Math.max(2, ...series.flatMap((s) => [s.gave, s.received]))
  // la clessidra: quanto è "piena" rispetto a un tetto visivo di 10 ore
  const fill = Math.max(0, Math.min(1, (total - MIN_BALANCE) / (10 - MIN_BALANCE)))

  return (
    <div>
      <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('hours.title')}</h1>
      <p className="mt-1 text-muted">{tr.t('hours.sub')}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-6 rounded-3xl bg-ink p-6 text-paper">
          <svg viewBox="0 0 60 100" className="h-32 w-auto shrink-0" aria-hidden>
            <path d="M8 4h44M8 96h44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 6c0 22 14 30 18 44-4 14-18 22-18 44h36c0-22-14-30-18-44 4-14 18-22 18-44z" fill="none" stroke="currentColor" strokeOpacity=".4" strokeWidth="2.5" />
            <clipPath id="hg">
              <path d="M12 6c0 22 14 30 18 44-4 14-18 22-18 44h36c0-22-14-30-18-44 4-14 18-22 18-44z" />
            </clipPath>
            <rect clipPath="url(#hg)" x="0" y={94 - fill * 44} width="60" height={fill * 44 + 2} fill="var(--yellow)" />
            <rect clipPath="url(#hg)" x="0" y={50 - (1 - fill) * 30} width="60" height={(1 - fill) * 30} fill="var(--yellow)" opacity=".85" />
          </svg>
          <div>
            <p className="text-sm opacity-70">{tr.t('hours.balance')}</p>
            <p className={cx('num text-[4.2rem] font-extrabold leading-none', total < 0 && 'text-coral')} style={{ fontStretch: '70%' }}>
              {tr.num(total)}
            </p>
            <p className="text-sm opacity-70">{tr.t('common.hours', { count: Math.abs(total) }).replace(/^[\d.,]+\s/, '')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="sheet p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted"><ArrowUpRight size={16} className="text-mint" /> {tr.t('hours.gave')}</p>
            <p className="num mt-1 text-4xl font-extrabold" style={{ fontStretch: '72%' }}>{tr.num(gave)}</p>
          </div>
          <div className="sheet p-4">
            <p className="flex items-center gap-1.5 text-sm text-muted"><ArrowDownLeft size={16} className="text-cobalt" /> {tr.t('hours.received')}</p>
            <p className="num mt-1 text-4xl font-extrabold" style={{ fontStretch: '72%' }}>{tr.num(received)}</p>
          </div>
          <div className="sheet col-span-2 p-4">
            <p className="text-sm font-semibold">{tr.t('hours.chart')}</p>
            <div className="mt-3 flex h-28 items-end gap-3" role="img" aria-label={tr.t('hours.chart')}>
              {series.map((s) => (
                <div key={s.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-24 w-full items-end justify-center gap-1">
                    <span className="w-3 rounded-t bg-mint" style={{ height: `${(s.gave / max) * 100}%` }} title={`${tr.t('hours.gave')}: ${s.gave}`} />
                    <span className="w-3 rounded-t bg-cobalt" style={{ height: `${(s.received / max) * 100}%` }} title={`${tr.t('hours.received')}: ${s.received}`} />
                  </div>
                  <span className="text-[0.7rem] capitalize text-muted">{new Date(`${s.key}-01T12:00:00`).toLocaleDateString(tr.locale, { month: 'short' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted">{tr.t('hours.credit', { min: MIN_BALANCE })}</p>

      <div className="grid gap-x-10 lg:grid-cols-[1fr_340px]">
        <Section title={tr.t('hours.history')}>
          {ledger.length ? (
            <ul className="divide-y divide-line">
              {[...ledger].reverse().map((e) => {
                const p = e.personId ? findPerson(neighbors, e.personId) : undefined
                const label =
                  e.kind === 'gave' || e.kind === 'received'
                    ? tr.t(`hours.kinds.${e.kind}`, { skill: e.skill ? tr.skill(e.skill) : '…', name: p?.first ?? '…' })
                    : tr.t(`hours.kinds.${e.kind}`)
                return (
                  <li key={e.id} className="flex items-center gap-3 py-3">
                    <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full', e.hours > 0 ? 'bg-mint-soft text-mint-ink' : 'bg-cobalt-soft text-cobalt')}>
                      {e.kind === 'welcome' ? <Gift size={16} /> : e.hours > 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      {e.exchangeId ? (
                        <Link href={`/app/scambio/?id=${e.exchangeId}`} className="block truncate font-medium hover:underline">{label}</Link>
                      ) : (
                        <span className="block truncate font-medium">{label}</span>
                      )}
                      <span className="text-xs text-faint">{tr.date(e.at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                    <span className={cx('num font-bold', e.hours > 0 ? 'text-mint-ink' : 'text-ink')}>
                      {e.hours > 0 ? '+' : '−'}
                      {tr.num(Math.abs(e.hours))} h
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty>{tr.t('hours.empty')}</Empty>
          )}
        </Section>
        <Section title={tr.t('site.nav.how')}>
          <ol className="space-y-3">
            {tr.m.hours.how.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-yellow text-sm font-bold text-[#10162f]">{i + 1}</span>
                <span className="text-[0.95rem]">{h}</span>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </div>
  )
}
