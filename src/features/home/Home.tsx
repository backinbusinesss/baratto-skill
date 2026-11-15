'use client'

import { ArrowRight, CalendarDays, Crown, Hourglass, Lock } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { CATEGORIES } from '@/content/categories'
import { comuneById } from '@/content/comuni'
import { countKinds } from '@/domain/matching'
import { isPremium } from '@/domain/plans'
import { balance } from '@/domain/timebank'
import { findTriads } from '@/domain/triads'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { activeCount, incomingPending, nextAppointment } from '@/store/selectors'
import { Avatar } from '@/ui/Avatar'
import { Empty, Section } from '@/ui/bits'
import { CategoryIcon } from '@/ui/Icon'
import { ExchangeTicket } from '../exchanges/ExchangeTicket'
import { IncomingActions } from '../exchanges/IncomingActions'
import { PersonFlyer } from '../people/PersonFlyer'
import { useMatches, usePeople } from '../people/useMatches'

export function Home() {
  const tr = useT()
  const me = useApp((s) => s.me)!
  const plan = useApp((s) => s.plan)
  const state = useApp()
  const hours = balance(state.ledger)
  const matches = useMatches()
  const kinds = countKinds(matches)
  const perfect = matches.filter((m) => m.kind === 'perfect').slice(0, 6)
  const incoming = incomingPending(state)
  const next = nextAppointment(state)
  const people = usePeople()
  const city = comuneById(me.comuneId)!
  const triads = useMemo(() => findTriads(me, people, city, me.radiusKm, 3), [me, people, city])
  const hour = new Date().getHours()
  const greet = hour < 13 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening'

  return (
    <div>
      <header className="pt-2">
        <h1 className="display text-[2.7rem] sm:text-[3.6rem]">{tr.t(greet, { name: me.name })}</h1>
        <p className="mt-2 text-muted">
          {tr.t('home.sub', { people: tr.t('common.people', { count: matches.length }), km: me.radiusKm, city: city.name })}
        </p>
      </header>

      {/* riga di riepilogo: tre numeri che portano dove servono */}
      <div className="mt-6 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-2xl bg-sheet shadow-paper">
        <Link href="/app/vicini/" className="p-4 hover:bg-well">
          <span className="num block text-[2rem] font-extrabold leading-none" style={{ fontStretch: '72%' }}>
            {kinds.perfect}
          </span>
          <span className="mt-1 block text-[0.8rem] text-muted">{tr.t('kinds.perfect')}</span>
        </Link>
        <Link href="/app/scambi/" className="p-4 hover:bg-well">
          <span className="num block text-[2rem] font-extrabold leading-none" style={{ fontStretch: '72%' }}>
            {activeCount(state)}
          </span>
          <span className="mt-1 block text-[0.8rem] text-muted">{tr.t('home.statsActive')}</span>
        </Link>
        <Link href="/app/ore/" className="p-4 hover:bg-well">
          <span className="num flex items-center gap-1.5 text-[2rem] font-extrabold leading-none" style={{ fontStretch: '72%' }}>
            <Hourglass size={20} className="text-cobalt" />
            {tr.num(hours)}
          </span>
          <span className="mt-1 block text-[0.8rem] text-muted">{tr.t('home.statsBalance')}</span>
        </Link>
      </div>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Section
          title={tr.t('home.nextTitle')}
          action={
            <Link href="/app/agenda/" className="btn btn-ghost btn-sm">
              <CalendarDays size={16} /> {tr.t('nav.calendar')}
            </Link>
          }
        >
          {next ? <ExchangeTicket ex={next} /> : <Empty>{tr.t('home.nextEmpty')}</Empty>}
        </Section>
        <Section title={tr.t('home.incomingTitle')}>
          {incoming.length ? (
            <div className="space-y-3">
              {incoming.slice(0, 2).map((ex) => (
                <ExchangeTicket key={ex.id} ex={ex} actions={<IncomingActions ex={ex} />} />
              ))}
            </div>
          ) : (
            <Empty>{tr.t('home.incomingEmpty')}</Empty>
          )}
        </Section>
      </div>

      <Section
        title={tr.t('home.perfectTitle')}
        action={
          <Link href="/app/vicini/" className="btn btn-ghost btn-sm">
            {tr.t('common.seeAll')} <ArrowRight size={16} />
          </Link>
        }
      >
        {perfect.length ? (
          <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
            {perfect.map((m) => (
              <PersonFlyer key={m.person.id} match={m} />
            ))}
          </div>
        ) : (
          <Empty action={<Link href="/app/profilo/" className="btn btn-outline btn-sm">{tr.t('profile.edit')}</Link>}>{tr.t('home.perfectEmpty')}</Empty>
        )}
      </Section>

      <Section title={tr.t('home.triadsTitle')}>
        <p className="-mt-1 mb-4 max-w-2xl text-muted">{tr.t('home.triadsText')}</p>
        {isPremium(plan) ? (
          triads.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {triads.map((t) => (
                <Link key={t.b.id + t.c.id} href={`/app/persona/?id=${t.b.id}`} className="sheet block p-4 hover:border-line-strong">
                  <TriadLoop me={me.name} b={t.b} c={t.c} />
                  <ol className="mt-3 space-y-1 text-sm">
                    <li>
                      <strong>{tr.t('common.you')}</strong> → {t.b.first}: {tr.skill(t.toB)}
                    </li>
                    <li>
                      <strong>{t.b.first}</strong> → {t.c.first}: {tr.skill(t.toC)}
                    </li>
                    <li>
                      <strong>{t.c.first}</strong> → {tr.t('common.you').toLowerCase()}: <span className="font-semibold text-mint-ink">{tr.skill(t.toMe)}</span>
                    </li>
                  </ol>
                </Link>
              ))}
            </div>
          ) : (
            <Empty>{tr.t('people.empty')}</Empty>
          )
        ) : (
          <Link href="/app/premium/" className="flex items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-line-strong p-4 hover:bg-sheet">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow text-[#10162f]">
              <Lock size={20} />
            </span>
            <span className="flex-1 text-sm">{tr.t('home.triadsLocked')}</span>
            <Crown size={18} className="text-yellow-ink" />
          </Link>
        )}
      </Section>

      <Section
        title={tr.t('home.categoriesTitle')}
        action={
          <Link href="/app/esplora/" className="btn btn-ghost btn-sm">
            {tr.t('nav.explore')} <ArrowRight size={16} />
          </Link>
        }
      >
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/app/esplora/?cat=${c.id}`} className="chip shrink-0 !min-h-10 !px-3.5">
              <span style={{ color: c.color }}>
                <CategoryIcon id={c.id} size={16} />
              </span>
              {tr.cat(c.id)}
            </Link>
          ))}
        </div>
      </Section>
    </div>
  )
}

/** Tre avatar in cerchio con le frecce: il giro dello scambio a tre. */
function TriadLoop({ me, b, c }: { me: string; b: { id: string; first: string; last: string }; c: { id: string; first: string; last: string } }) {
  return (
    <div className="relative mx-auto h-28 w-40">
      <svg viewBox="0 0 160 112" className="absolute inset-0 text-line-strong" aria-hidden>
        <path d="M80 22 L138 88 L22 88 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" />
      </svg>
      <span className="absolute left-1/2 top-0 -translate-x-1/2">
        <Avatar seed={`me-${me}`} name={me} size={40} />
      </span>
      <span className="absolute bottom-0 right-0">
        <Avatar seed={b.id} name={`${b.first} ${b.last}`} size={40} />
      </span>
      <span className="absolute bottom-0 left-0">
        <Avatar seed={c.id} name={`${c.first} ${c.last}`} size={40} />
      </span>
    </div>
  )
}
