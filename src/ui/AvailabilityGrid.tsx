'use client'

import { type Availability, availBit, isFree, SLOTS } from '@/domain/types'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'

/**
 * Griglia 7 giorni × 3 fasce. Modificabile (onChange) o in sola lettura;
 * con `other` evidenzia le fasce libere per entrambi.
 */
export function AvailabilityGrid({
  value,
  onChange,
  other,
  compact,
}: {
  value: Availability
  onChange?: (v: Availability) => void
  other?: Availability
  compact?: boolean
}) {
  const tr = useT()
  const size = compact ? 'h-6' : 'h-11'
  return (
    <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-1 text-[0.72rem]" role="group">
      <span />
      {tr.m.days.map((d) => (
        <span key={d} className="text-center font-semibold text-muted">
          {d}
        </span>
      ))}
      {SLOTS.map((slot, s) => (
        <div key={slot} className="contents">
          <span className="flex items-center pr-1.5 font-semibold text-muted">
            {compact ? tr.m.slots[slot].slice(0, 3) : tr.m.slots[slot]}
          </span>
          {tr.m.days.map((dayName, d) => {
            const on = isFree(value, d, s)
            const shared = on && other !== undefined && isFree(other, d, s)
            const label = `${tr.m.daysLong[d]} · ${tr.m.slots[slot]}`
            const cls = cx(
              size,
              'rounded-md transition-colors',
              shared ? 'bg-mint' : on ? 'bg-cobalt' : 'bg-well',
              onChange && 'hover:ring-2 hover:ring-line-strong',
            )
            return onChange ? (
              <button
                key={dayName}
                type="button"
                aria-pressed={on}
                aria-label={label}
                className={cls}
                onClick={() => onChange(value ^ availBit(d, s))}
              />
            ) : (
              <span key={dayName} className={cls} title={label} />
            )
          })}
        </div>
      ))}
    </div>
  )
}
