'use client'

import { ArrowRight, CalendarDays, Compass, Crown, Lock, MapPin, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { CATEGORIES } from '@/content/categories'
import { comuneById } from '@/content/comuni'
import { countKinds } from '@/domain/matching'
import { isPremium } from '@/domain/plans'
import { balance } from '@/domain/timebank'
import { findChains } from '@/domain/triads'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { activeCount, incomingPending, nextAppointment } from '@/store/selectors'
import { Avatar } from '@/ui/Avatar'
import { Empty, Section } from '@/ui/bits'
import { CategoryIcon } from '@/ui/Icon'
import { ScrollRow } from '@/ui/ScrollRow'
import { ExchangeTicket } from '../exchanges/ExchangeTicket'
import { IncomingActions } from '../exchanges/IncomingActions'
import { PersonFlyer } from '../people/PersonFlyer'
import { useMatches, usePeople } from '../people/useMatches'

export function Home() {
  const tr = useT()
  const reduce = useReducedMotion()
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
  const chains = useMemo(() => findChains(me, people, city, me.radiusKm, 3), [me, people, city])
  const hour = new Date().getHours()
  const greet = hour < 13 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening'

  return (
    <div>
      {/* intestazione: saluto, numeri e azioni rapide su una lastra blu notte */}
      <motion.header
        className="home-hero p-6 sm:p-8"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="premium-sheen" aria-hidden />
        <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm text-white/70">
              <MapPin size={15} className="text-yellow" />
              {tr.t('home.sub', { people: tr.t('common.people', { count: matches.filter((m) => !m.remote).length }), km: me.radiusKm, city: city.name })}
            </p>
            <h1 className="display mt-3 text-[2.6rem] text-white sm:text-[3.6rem]">{tr.t(greet, { name: me.name })}</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/app/vicini/" className="btn btn-yellow">
                <Users size={17} /> {tr.t('home.findPeople')}
              </Link>
              <Link href="/app/esplora/" className="btn border border-white/20 text-white hover:bg-white/10">
                <Compass size={17} /> {tr.t('home.quickPropose')}
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['/app/vicini/', kinds.perfect, tr.t('home.statsPerfect')],
                ['/app/scambi/', activeCount(state), tr.t('home.statsActive')],
                ['/app/ore/', tr.num(hours), tr.t('home.statsBalance')],
              ] as const
            ).map(([href, n, label]) => (
              <Link key={href} href={href} className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 transition-colors hover:bg-white/[0.12]">
                <span className="num block text-[2.1rem] font-extrabold leading-none text-white" style={{ fontStretch: '70%' }}>
                  {n}
                </span>
                <span className="mt-1 block text-[0.74rem] leading-tight text-white/65">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.header>

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
          chains.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {chains.map((ch) => {
                const names = [tr.t('common.you'), ...ch.people.map((p) => p.first)]
                return (
                  <Link key={ch.people.map((p) => p.id).join('-')} href={`/app/persona/?id=${ch.people[0].id}`} className="sheet block p-4 hover:border-line-strong">
                    <div className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-muted">
                      {tr.t(ch.people.length === 2 ? 'home.chain3' : 'home.chain4')}
                    </div>
                    <ChainLoop me={me.name} people={ch.people} />
                    <ol className="mt-3 space-y-1 text-sm">
                      {ch.skills.map((sk, k) => {
                        const last = k === ch.skills.length - 1
                        return (
                          <li key={k}>
                            <strong>{names[k]}</strong> → {last ? tr.t('common.you').toLowerCase() : names[k + 1]}:{' '}
                            <span className={last ? 'font-semibold text-mint-ink' : undefined}>{tr.skill(sk)}</span>
                          </li>
                        )
                      })}
                    </ol>
                  </Link>
                )
              })}
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
        <ScrollRow innerClassName="gap-2 pb-2">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/app/esplora/?cat=${c.id}`} className="chip shrink-0 !min-h-10 !px-3.5">
              <span style={{ color: c.color }}>
                <CategoryIcon id={c.id} size={16} />
              </span>
              {tr.cat(c.id)}
            </Link>
          ))}
        </ScrollRow>
      </Section>
    </div>
  )
}

/** Gli avatar del giro su un poligono tratteggiato: triangolo per tre, quadrato per quattro. */
function ChainLoop({ me, people }: { me: string; people: { id: string; first: string; last: string }[] }) {
  const n = people.length + 1
  const pts = Array.from({ length: n }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / n
    return { x: 80 + Math.cos(a) * 58, y: 60 + Math.sin(a) * 44 }
  })
  const nodes = [{ seed: `me-${me}`, name: me }, ...people.map((p) => ({ seed: p.id, name: `${p.first} ${p.last}` }))]
  return (
    <div className="relative mx-auto h-[120px] w-40">
      <svg viewBox="0 0 160 120" className="absolute inset-0 text-line-strong" aria-hidden>
        <path d={`M${pts.map((p) => `${p.x} ${p.y}`).join(' L')} Z`} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" />
      </svg>
      {nodes.map((nd, k) => (
        <span key={nd.seed} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pts[k].x, top: pts[k].y }}>
          <Avatar seed={nd.seed} name={nd.name} size={36} />
        </span>
      ))}
    </div>
  )
}
