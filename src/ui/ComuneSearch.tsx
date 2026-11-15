'use client'

import { Loader2, MapPin, Navigation } from 'lucide-react'
import { useId, useState } from 'react'
import { type Comune, comuneById } from '@/content/comuni'
import { nearestComune, searchComuni } from '@/domain/geo'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'

/** Ricerca del comune con suggerimenti, tastiera e (se permesso) la posizione del dispositivo. */
export function ComuneSearch({
  value,
  onChange,
  autoFocus,
  withLocation = true,
}: {
  value: string | null
  onChange(id: string): void
  autoFocus?: boolean
  withLocation?: boolean
}) {
  const tr = useT()
  const listId = useId()
  const current = value ? comuneById(value) : undefined
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState(false)
  const results = searchComuni(q, 7)

  const choose = (c: Comune) => {
    onChange(c.id)
    setQ('')
    setOpen(false)
  }

  const locate = () => {
    if (!navigator.geolocation) return setError(true)
    setLocating(true)
    setError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        choose(nearestComune({ lat: pos.coords.latitude, lon: pos.coords.longitude }))
      },
      () => {
        setLocating(false)
        setError(true)
      },
      { timeout: 8000 },
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <MapPin size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          className="field !pl-10"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={current ? `${current.name} (${current.prov})` : tr.t('onboarding.cityPlaceholder')}
          value={q}
          autoFocus={autoFocus}
          data-autofocus={autoFocus ? '' : undefined}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1))
            else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
            else if (e.key === 'Enter' && results[active]) {
              e.preventDefault()
              choose(results[active])
            }
          }}
        />
      </div>
      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-sheet shadow-xl">
          {results.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={cx('flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left', i === active && 'bg-well')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(c)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="font-semibold">{c.name}</span>
                <span className="text-sm text-muted">
                  {c.prov} · {c.region}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {current && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={14} className="text-cobalt" />
          <strong className="text-ink">{current.name}</strong> {current.prov}, {current.region}
        </p>
      )}
      {withLocation && (
        <button type="button" className="btn btn-ghost btn-sm mt-2 -ml-2" onClick={locate} disabled={locating}>
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          {locating ? tr.t('onboarding.locating') : tr.t('onboarding.useLocation')}
        </button>
      )}
      {error && <p className="mt-1 text-sm text-coral-ink">{tr.t('onboarding.locationError')}</p>}
    </div>
  )
}
