'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { isActive, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Empty, Segmented } from '@/ui/bits'
import { ExchangeTicket } from './ExchangeTicket'
import { IncomingActions } from './IncomingActions'

type Tab = 'incoming' | 'sent' | 'active' | 'past'

export function Exchanges() {
  const tr = useT()
  const router = useRouter()
  const params = useSearchParams()
  const exchanges = useApp((s) => s.exchanges)
  const tab = (params.get('tab') as Tab) || 'incoming'

  const lists: Record<Tab, typeof exchanges> = {
    incoming: exchanges.filter((e) => e.direction === 'in' && e.status === 'pending'),
    sent: exchanges.filter((e) => e.direction === 'out' && (e.status === 'pending' || e.status === 'countered')),
    active: exchanges.filter((e) => e.status === 'accepted'),
    past: exchanges.filter((e) => !isActive(e)),
  }
  const items = [...lists[tab]].sort((a, b) =>
    tab === 'active' ? (a.slot ?? '').localeCompare(b.slot ?? '') : b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <div>
      <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('exchanges.title')}</h1>
      <Segmented
        className="mt-5"
        value={tab}
        onChange={(v) => router.replace(`/app/scambi/?tab=${v}`)}
        options={(['incoming', 'sent', 'active', 'past'] as Tab[]).map((t) => ({
          value: t,
          label: tr.t(`exchanges.${t}`),
          badge: t === 'incoming' ? lists.incoming.length : t === 'sent' ? lists.sent.filter((e) => e.status === 'countered').length : undefined,
        }))}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((ex) => (
          <ExchangeTicket key={ex.id} ex={ex} actions={tab === 'incoming' ? <IncomingActions ex={ex} /> : undefined} />
        ))}
      </div>
      {items.length === 0 && (
        <Empty
          action={
            tab === 'sent' || tab === 'incoming' ? (
              <Link href="/app/vicini/" className="btn btn-primary btn-sm">
                {tr.t('nav.people')}
              </Link>
            ) : undefined
          }
        >
          {tr.m.exchanges.empty[tab]}
        </Empty>
      )}
    </div>
  )
}
