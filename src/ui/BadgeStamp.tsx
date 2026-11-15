'use client'

import type { BadgeDef } from '@/domain/badges'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { NamedIcon } from './Icon'

/** Il badge come timbro circolare: a colori se ottenuto, grigio e con la barra se no. */
export function BadgeStamp({ badge, earned, pct = 1, size = 'md' }: { badge: BadgeDef; earned: boolean; pct?: number; size?: 'sm' | 'md' }) {
  const tr = useT()
  const [name, desc] = tr.m.badges[badge.id]
  const d = size === 'sm' ? 56 : 76
  return (
    <div className={cx('flex flex-col items-center text-center', size === 'sm' ? 'w-[72px]' : 'w-[96px]')} title={`${name}: ${desc}`}>
      <span
        className="stamp grid place-items-center"
        style={{ width: d, height: d, color: earned ? badge.color : 'var(--line-strong)', transform: `rotate(${(badge.id.length % 5) * 4 - 8}deg)`, background: earned ? `color-mix(in srgb, ${badge.color} 12%, var(--sheet))` : 'var(--well)' }}
      >
        <NamedIcon name={badge.icon} size={size === 'sm' ? 22 : 30} />
      </span>
      <span className={cx('mt-1.5 text-[0.75rem] font-bold leading-tight', !earned && 'text-faint')}>{name}</span>
      {size === 'md' && <span className="text-[0.7rem] leading-tight text-muted">{desc}</span>}
      {!earned && size === 'md' && (
        <span className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-well-2">
          <span className="block h-full bg-cobalt" style={{ width: `${pct * 100}%` }} />
        </span>
      )}
    </div>
  )
}
