'use client'

import { Crown, Hourglass } from 'lucide-react'
import { type PointerEvent, useRef } from 'react'
import { hashString } from '@/domain/rng'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { LogoMark } from './Logo'

/**
 * La tessera del quartiere: per i Premium ha una lamina olografica che segue il puntatore
 * e si inclina leggermente. Con movimento ridotto resta ferma.
 */
export function MemberCard({ name, since, hours, premium, className }: { name: string; since: string; hours: number; premium: boolean; className?: string }) {
  const tr = useT()
  const ref = useRef<HTMLDivElement>(null)
  const number = String(hashString(name + since) % 1_000_000).padStart(6, '0')

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 14}deg`)
  }
  const leave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className={cx('[perspective:1000px]', className)}>
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        className={cx('member-card relative aspect-[1.586] w-full overflow-hidden rounded-[22px] p-5 text-white sm:p-6', premium ? 'member-premium' : 'member-free')}
      >
        <span className="member-foil" aria-hidden />
        <span className="member-grain" aria-hidden />
        <div className="relative flex h-full flex-col">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-2">
              <LogoMark size={30} />
              <span className="text-sm font-bold leading-tight">
                Baratto Skill
                <span className="block text-[0.7rem] font-medium opacity-70">{tr.t('card.title')}</span>
              </span>
            </span>
            {premium ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-2.5 py-1 text-[0.7rem] font-bold text-[#10162f]">
                <Crown size={12} /> {tr.t('card.premium')}
              </span>
            ) : (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.7rem] font-semibold">{tr.t('card.free')}</span>
            )}
          </div>
          <div className="mt-auto flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[clamp(1.6rem,6vw,2.3rem)] font-extrabold leading-none" style={{ fontStretch: '72%' }}>
                {name}
              </p>
              <p className="mt-1.5 font-mono text-[0.72rem] tracking-[0.18em] opacity-75">{tr.t('card.number', { n: number })}</p>
              <p className="text-[0.72rem] opacity-70">{tr.t('card.member', { date: tr.date(since, { month: 'long', year: 'numeric' }) })}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="num flex items-center justify-end gap-1 text-3xl font-extrabold leading-none" style={{ fontStretch: '70%' }}>
                <Hourglass size={18} className="text-yellow" /> {tr.num(hours)}
              </p>
              <p className="text-[0.68rem] opacity-70">{tr.t('card.hours')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
