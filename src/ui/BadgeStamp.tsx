'use client'

import { Lock } from 'lucide-react'
import { type BadgeDef, TIER_COLORS } from '@/domain/badges'
import { badgeBaseName, badgeDesc, badgeName, tierLabel } from '@/i18n/badges'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'
import { NamedIcon } from './Icon'

/**
 * Il badge come timbro circolare: colore della famiglia, anello del colore del livello
 * (Bronzo → Diamante) e tacche del livello. Grigio con il lucchetto e la barra se non ancora ottenuto.
 */
export function BadgeStamp({ badge, earned, pct = 1, size = 'md' }: { badge: BadgeDef; earned: boolean; pct?: number; size?: 'sm' | 'md' }) {
  const tr = useT()
  const d = size === 'sm' ? 56 : 74
  const tierColor = badge.tier ? TIER_COLORS[badge.tier - 1] : badge.color
  const title = `${badgeName(tr, badge)}: ${badgeDesc(tr, badge)}`
  return (
    <div className={cx('flex flex-col items-center text-center', size === 'sm' ? 'w-[76px]' : 'w-[104px]')} title={title}>
      <span className="relative">
        <span
          className="stamp grid place-items-center"
          style={{
            width: d,
            height: d,
            color: earned ? badge.color : 'var(--line-strong)',
            transform: `rotate(${(badge.id.length % 5) * 4 - 8}deg)`,
            background: earned ? `color-mix(in srgb, ${badge.color} 13%, var(--sheet))` : 'var(--well)',
            boxShadow: earned ? `inset 0 0 0 3px var(--sheet), inset 0 0 0 4.5px currentColor, 0 0 0 3px ${tierColor}` : undefined,
          }}
        >
          <NamedIcon name={badge.icon} size={size === 'sm' ? 22 : 28} />
        </span>
        {!earned && (
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-sheet text-faint shadow">
            <Lock size={11} />
          </span>
        )}
      </span>
      <span className={cx('mt-2 text-[0.74rem] font-bold leading-tight', !earned && 'text-faint')}>{badgeBaseName(tr, badge)}</span>
      {badge.tier > 0 && (
        <span className="mt-0.5 flex items-center gap-1 text-[0.66rem] font-semibold" style={{ color: earned ? tierColor : 'var(--faint)' }}>
          <span className="flex gap-[2px]" aria-hidden>
            {Array.from({ length: badge.tiers }, (_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < badge.tier ? 'currentColor' : 'var(--line-strong)' }} />
            ))}
          </span>
          {tierLabel(tr, badge)}
        </span>
      )}
      {size === 'md' && <span className="mt-0.5 text-[0.68rem] leading-tight text-muted">{badgeDesc(tr, badge)}</span>}
      {!earned && size === 'md' && (
        <span className="mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-well-2">
          <span className="block h-full bg-cobalt" style={{ width: `${pct * 100}%` }} />
        </span>
      )}
    </div>
  )
}
