'use client'

import { ArrowDownLeft, ArrowUpRight, Gift, Hourglass, Video } from 'lucide-react'
import Link from 'next/link'
import { shortName } from '@/domain/people'
import { cx } from '@/lib/cx'
import type { Exchange, ExchangeStatus } from '@/store/app'
import { useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'
import { usePerson } from '../people/useMatches'

export const STATUS_STYLE: Record<ExchangeStatus, string> = {
  pending: 'bg-yellow text-[#10162f]',
  countered: 'bg-yellow text-[#10162f]',
  accepted: 'bg-mint text-white dark:text-[#0d1124]',
  completed: 'bg-ink text-paper',
  declined: 'bg-well-2 text-muted',
  cancelled: 'bg-well-2 text-muted',
}

/**
 * Lo scambio come biglietto: a sinistra chi e cosa (do / ricevo), a destra quando e lo stato,
 * separati da una perforazione con le tacche.
 */
export function ExchangeTicket({ ex, actions }: { ex: Exchange; actions?: React.ReactNode }) {
  const tr = useT()
  const p = usePerson(ex.personId)
  if (!p) return null
  const when = ex.slot ?? ex.slots[0]
  const d = when ? new Date(when) : null
  return (
    <div className="ticket shadow-paper" style={{ ['--cut' as string]: '66%' }}>
      <Link href={`/app/scambio/?id=${ex.id}`} className="grid grid-cols-[66%_34%]">
        <div className="min-w-0 p-4">
          <div className="flex items-center gap-2.5">
            <Avatar seed={p.id} name={`${p.first} ${p.last}`} size={34} />
            <div className="min-w-0">
              <p className="truncate font-bold leading-tight">{shortName(p)}</p>
              <p className="flex items-center gap-1 text-xs text-muted">
                {ex.direction === 'in' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                {ex.direction === 'in' ? tr.t('exchanges.incoming') : tr.t('exchanges.sent')}
                {ex.mode === 'online' && (
                  <>
                    {' · '}
                    <Video size={12} /> {tr.m.modes.online}
                  </>
                )}
              </p>
            </div>
          </div>
          <dl className="mt-3 space-y-1 text-[0.86rem]">
            <div className="flex gap-2">
              <dt className="w-[4.6rem] shrink-0 text-muted">{tr.t('exchanges.youGive')}</dt>
              <dd className="min-w-0 truncate font-semibold">
                {ex.give ? (
                  `${tr.skill(ex.give)} · ${tr.t('common.hoursShort', { count: tr.num(ex.giveHours) })}`
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Hourglass size={13} /> {tr.t('exchanges.hoursOnly')}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-[4.6rem] shrink-0 text-muted">{tr.t('exchanges.youGet')}</dt>
              <dd className="min-w-0 truncate font-semibold">
                {ex.get ? (
                  `${tr.skill(ex.get)} · ${tr.t('common.hoursShort', { count: tr.num(ex.getHours) })}`
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Gift size={13} /> {tr.t('exchanges.gift')}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className="perforation flex flex-col items-center justify-center gap-1 px-2 py-4 text-center">
          {d ? (
            <>
              <span className="text-xs font-semibold text-muted">
                {d.toLocaleDateString(tr.locale, { weekday: 'short' })}
              </span>
              <span className="num text-[2rem] font-extrabold leading-none" style={{ fontStretch: '72%' }}>
                {d.getDate()}
              </span>
              <span className="text-xs text-muted">
                {d.toLocaleDateString(tr.locale, { month: 'short' })} · {d.toLocaleTimeString(tr.locale, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
          <span className={cx('mt-1.5 rounded-full px-2 py-0.5 text-[0.68rem] font-bold', STATUS_STYLE[ex.status])}>
            {tr.m.exchanges.status[ex.status]}
          </span>
        </div>
      </Link>
      {actions && <div className="flex flex-wrap gap-2 border-t border-dashed border-line-strong px-4 py-3">{actions}</div>}
    </div>
  )
}
