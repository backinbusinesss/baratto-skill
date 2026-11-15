'use client'

import { BadgeCheck, Crown, Star } from 'lucide-react'
import type { ReactNode } from 'react'
import { categoryById } from '@/content/categories'
import { skillById } from '@/content/skills'
import type { Level } from '@/domain/types'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { SkillIcon } from './Icon'

/** Quattro tacche per il livello. */
export function LevelPips({ level, className }: { level: Level; className?: string }) {
  const tr = useT()
  return (
    <span className={cx('inline-flex items-end gap-[2px]', className)} title={tr.m.levels[level]} aria-label={tr.m.levels[level]}>
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className="w-[3px] rounded-full"
          style={{ height: 4 + n * 2.5, background: n <= level ? 'currentColor' : 'var(--line-strong)' }}
        />
      ))}
    </span>
  )
}

export function SkillChip({
  id,
  level,
  hit,
  onClick,
  pressed,
  size = 'md',
}: {
  id: string
  level?: Level
  hit?: boolean
  onClick?: () => void
  pressed?: boolean
  size?: 'sm' | 'md'
}) {
  const tr = useT()
  const s = skillById(id)
  const color = s ? categoryById(s.cat).color : 'var(--faint)'
  const content = (
    <>
      <span className="shrink-0" style={{ color }}>
        <SkillIcon id={id} size={15} />
      </span>
      <span className="truncate">{tr.skill(id)}</span>
      {level && <LevelPips level={level} className="text-muted" />}
    </>
  )
  const cls = cx(
    'chip max-w-full',
    size === 'sm' && '!min-h-7 !px-2.5 !text-[0.8rem]',
    hit && '!bg-mint-soft !text-mint-ink',
  )
  if (onClick)
    return (
      <button type="button" className={cls} onClick={onClick} aria-pressed={pressed}>
        {content}
      </button>
    )
  return <span className={cls}>{content}</span>
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-[1px] text-yellow-ink', className)} aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? 'var(--yellow)' : 'transparent'} stroke={n <= Math.round(value) ? 'var(--yellow-ink)' : 'var(--line-strong)'} strokeWidth={1.6} />
      ))}
    </span>
  )
}

export function PremiumTag({ label }: { label?: string }) {
  const tr = useT()
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow px-2 py-0.5 text-[0.7rem] font-bold text-[#10162f]">
      <Crown size={11} strokeWidth={2.5} aria-hidden />
      {label ?? tr.t('common.featured')}
    </span>
  )
}

export function VerifiedMark({ size = 16 }: { size?: number }) {
  const tr = useT()
  return <BadgeCheck size={size} className="shrink-0 text-cobalt" aria-label={tr.t('common.verified')} />
}

export function Section({
  title,
  action,
  children,
  className,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cx('mt-8', className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[1.35rem]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Empty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-line-strong px-5 py-8 text-center text-muted">
      <p className="mx-auto max-w-sm">{children}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/** Controllo a segmenti (schede, ordinamenti). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T
  options: { value: T; label: ReactNode; badge?: number }[]
  onChange(v: T): void
  className?: string
}) {
  return (
    <div role="tablist" className={cx('no-scrollbar flex gap-1 overflow-x-auto rounded-full bg-well p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors',
            o.value === value ? 'bg-sheet text-ink shadow-sm' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
          {!!o.badge && (
            <span className="grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.7rem] font-bold text-white">{o.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}
