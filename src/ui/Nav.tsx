'use client'

import { ArrowLeftRight, CalendarDays, Compass, Crown, Home, Hourglass, MessageCircle, User, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { comuneById } from '@/content/comuni'
import { balance } from '@/domain/timebank'
import { isPremium } from '@/domain/plans'
import type { MessageKey } from '@/i18n'
import { cx } from '@/lib/cx'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { incomingPending, unreadTotal } from '@/store/selectors'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

export function normalizePath(p: string | null): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')
  let path = p ?? '/'
  if (base && path.startsWith(base)) path = path.slice(base.length) || '/'
  return path.replace(/\/+$/, '') || '/'
}

interface Item {
  href: string
  key: MessageKey
  icon: typeof Home
  badge?: 'incoming' | 'unread'
}

const MAIN: Item[] = [
  { href: '/app', key: 'nav.home', icon: Home },
  { href: '/app/vicini', key: 'nav.people', icon: Users },
  { href: '/app/scambi', key: 'nav.exchanges', icon: ArrowLeftRight, badge: 'incoming' },
  { href: '/app/chat', key: 'nav.chat', icon: MessageCircle, badge: 'unread' },
  { href: '/app/profilo', key: 'nav.profile', icon: User },
]
const MORE: Item[] = [
  { href: '/app/esplora', key: 'nav.explore', icon: Compass },
  { href: '/app/agenda', key: 'nav.calendar', icon: CalendarDays },
  { href: '/app/ore', key: 'nav.hours', icon: Hourglass },
]

const ACTIVE_ALIASES: Record<string, string> = {
  '/app/persona': '/app/vicini',
  '/app/competenza': '/app/esplora',
  '/app/scambio': '/app/scambi',
}

function useActive() {
  const path = normalizePath(usePathname())
  const p = ACTIVE_ALIASES[path] ?? path
  return (href: string) => (href === '/app' ? p === '/app' : p.startsWith(href))
}

function useBadges() {
  const incoming = useApp((s) => incomingPending(s).length)
  const unread = useApp((s) => unreadTotal(s))
  return { incoming, unread }
}

function Badge({ n }: { n: number }) {
  if (!n) return null
  return (
    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[0.68rem] font-bold leading-none text-white">
      {n > 9 ? '9+' : n}
    </span>
  )
}

/** Barra laterale su schermi larghi. */
export function SideNav() {
  const tr = useT()
  const active = useActive()
  const badges = useBadges()
  const me = useApp((s) => s.me)
  const plan = useApp((s) => s.plan)
  const hours = useApp((s) => balance(s.ledger))
  const link = (it: Item) => (
    <Link
      key={it.href}
      href={`${it.href}/`.replace('//', '/')}
      aria-current={active(it.href) ? 'page' : undefined}
      className={cx(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors',
        active(it.href) ? 'bg-ink text-paper' : 'text-muted hover:bg-well hover:text-ink',
      )}
    >
      <it.icon size={19} />
      <span className="flex-1">{tr.t(it.key)}</span>
      {it.badge && <Badge n={badges[it.badge]} />}
    </Link>
  )
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-5 lg:flex">
      <Link href="/app/" className="px-2">
        <Logo />
      </Link>
      {me && (
        <Link href="/app/profilo/" className="mt-6 flex items-center gap-3 rounded-xl bg-sheet p-3 shadow-paper">
          <Avatar seed={`me-${me.name}`} name={me.name} size={40} ring={isPremium(plan) ? 'premium' : 'none'} />
          <span className="min-w-0">
            <span className="block truncate font-bold">{me.name}</span>
            <span className="block truncate text-sm text-muted">
              {comuneById(me.comuneId)?.name} · <span className="num font-semibold text-ink">{tr.t('common.hoursShort', { count: tr.num(hours) })}</span>
            </span>
          </span>
        </Link>
      )}
      <nav className="mt-5 flex flex-col gap-1">{MAIN.map(link)}</nav>
      <div className="my-3 border-t border-line" />
      <nav className="flex flex-col gap-1">{MORE.map(link)}</nav>
      <div className="flex-1" />
      {!isPremium(plan) ? (
        <Link href="/app/premium/" className="rounded-2xl bg-ink p-4 text-paper">
          <Crown size={20} className="text-yellow" />
          <p className="mt-2 text-sm leading-snug">{tr.t('home.premiumNudge')}</p>
          <span className="mt-3 inline-block text-sm font-bold text-yellow">{tr.t('premium.trial', { days: 14 })}</span>
        </Link>
      ) : (
        <Link href="/app/premium/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted hover:text-ink">
          <Crown size={16} className="text-yellow-ink" /> {tr.t('common.premium')}
        </Link>
      )}
      <Link href="/" className="mt-3 px-3 text-sm text-faint hover:text-ink">
        {tr.t('nav.site')}
      </Link>
    </aside>
  )
}

/** Barra in basso sul telefono. */
export function BottomNav() {
  const tr = useT()
  const active = useActive()
  const badges = useBadges()
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/92 backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex max-w-lg">
        {MAIN.map((it) => {
          const on = active(it.href)
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={`${it.href}/`.replace('//', '/')}
                aria-current={on ? 'page' : undefined}
                className={cx('relative flex flex-col items-center gap-0.5 pb-1 pt-2 text-[0.7rem] font-semibold', on ? 'text-ink' : 'text-faint')}
              >
                <span className={cx('grid h-8 w-12 place-items-center rounded-full transition-colors', on && 'bg-yellow text-[#10162f]')}>
                  <it.icon size={20} strokeWidth={on ? 2.4 : 2} />
                </span>
                {tr.t(it.key)}
                {it.badge && badges[it.badge] > 0 && (
                  <span className="absolute right-[calc(50%-24px)] top-1">
                    <Badge n={badges[it.badge]} />
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Barra in alto sul telefono: logo, saldo ore e accessi rapidi. */
export function TopBar() {
  const tr = useT()
  const hours = useApp((s) => balance(s.ledger))
  return (
    <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-2 bg-paper/90 px-4 py-2.5 backdrop-blur-md lg:hidden">
      <Link href="/app/" aria-label={tr.t('nav.home')}>
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/app/esplora/" className="btn btn-ghost btn-icon" aria-label={tr.t('nav.explore')}>
          <Compass size={20} />
        </Link>
        <Link href="/app/agenda/" className="btn btn-ghost btn-icon" aria-label={tr.t('nav.calendar')}>
          <CalendarDays size={20} />
        </Link>
        <Link href="/app/ore/" className="num ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3 text-sm font-bold text-paper">
          <Hourglass size={14} className="text-yellow" />
          {tr.num(hours)}
          <span className="sr-only">{tr.t('nav.hours')}</span>
        </Link>
      </div>
    </header>
  )
}
