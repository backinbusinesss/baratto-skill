'use client'

import { useMemo } from 'react'
import { ITALY_PATH } from '@/content/italy'
import { ITALY_PROJ, kmToUnits, project } from '@/content/italy-proj'
import type { LatLon } from '@/domain/geo'
import { cx } from '@/lib/cx'

export interface MapDot {
  id: string
  lat: number
  lon: number
  tone?: 'perfect' | 'match' | 'plain' | 'premium'
  label?: string
}

const TONE: Record<NonNullable<MapDot['tone']>, string> = {
  perfect: 'var(--mint)',
  match: 'var(--cobalt)',
  plain: 'var(--faint)',
  premium: 'var(--yellow)',
}

/**
 * Mappa dell'Italia in SVG con punti e cerchio del raggio. Con `zoom` si inquadra il
 * cerchio (vista di quartiere), altrimenti si vede tutta la penisola.
 */
export function ItalyMap({
  dots,
  center,
  radiusKm,
  zoom,
  onDot,
  selected,
  className,
  label,
  places,
}: {
  dots: MapDot[]
  center?: LatLon
  radiusKm?: number
  zoom?: boolean
  onDot?(id: string): void
  selected?: string
  className?: string
  label: string
  /** nomi di luogo da scrivere sulla mappa (vista di quartiere) */
  places?: { name: string; lat: number; lon: number }[]
}) {
  const c = center ? project(center.lon, center.lat) : null
  const r = radiusKm ? kmToUnits(radiusKm) : 0
  const viewBox = useMemo(() => {
    if (zoom && c && r) {
      const pad = r * 1.25
      return `${c[0] - pad} ${c[1] - pad} ${pad * 2} ${pad * 2}`
    }
    return `0 0 ${ITALY_PROJ.width} ${ITALY_PROJ.height}`
  }, [zoom, c, r])
  // dimensione dei punti proporzionata alla vista
  const scale = zoom && r ? (r * 2.5) / 260 : 1.6
  return (
    <svg viewBox={viewBox} className={cx('h-full w-full', className)} role="img" aria-label={label}>
      <defs>
        <pattern id="map-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.1" fill="var(--line-strong)" />
        </pattern>
      </defs>
      <path d={ITALY_PATH} fill="var(--well)" stroke="var(--line-strong)" strokeWidth={zoom ? scale * 0.8 : 1.2} />
      <path d={ITALY_PATH} fill="url(#map-dots)" opacity={zoom ? 0 : 0.8} />
      {c && r > 0 && (
        <circle
          cx={c[0]}
          cy={c[1]}
          r={r}
          fill="color-mix(in srgb, var(--cobalt) 10%, transparent)"
          stroke="var(--cobalt)"
          strokeWidth={scale * 1.2}
          strokeDasharray={`${scale * 4} ${scale * 3}`}
        />
      )}
      {places?.map((pl) => {
        const [x, y] = project(pl.lon, pl.lat)
        return (
          <g key={pl.name} aria-hidden>
            <circle cx={x} cy={y} r={scale * 1.4} fill="var(--faint)" />
            <text x={x + scale * 3} y={y + scale * 3.5} fontSize={scale * 10} fontWeight={650} fill="var(--muted)" stroke="var(--sheet)" strokeWidth={scale * 2.5} paintOrder="stroke" style={{ fontStretch: '85%' }}>
              {pl.name}
            </text>
          </g>
        )
      })}
      {dots.map((d) => {
        const [x, y] = project(d.lon, d.lat)
        const tone = d.tone ?? 'plain'
        const big = tone === 'perfect' || d.id === selected
        const size = (big ? 4.2 : 3) * scale
        const shape = (
          <circle
            cx={x}
            cy={y}
            r={d.id === selected ? size * 1.5 : size}
            fill={TONE[tone]}
            stroke={tone === 'premium' ? 'var(--ink)' : 'var(--sheet)'}
            strokeWidth={scale * (tone === 'premium' ? 0.9 : 1)}
          >
            {d.label && <title>{d.label}</title>}
          </circle>
        )
        return onDot ? (
          <g key={d.id} role="button" tabIndex={0} aria-label={d.label} className="cursor-pointer outline-none" onClick={() => onDot(d.id)} onKeyDown={(e) => e.key === 'Enter' && onDot(d.id)}>
            <circle cx={x} cy={y} r={size * 2.4} fill="transparent" />
            {shape}
          </g>
        ) : (
          <g key={d.id}>{shape}</g>
        )
      })}
      {c && (
        <g>
          <circle cx={c[0]} cy={c[1]} r={6 * scale} fill="var(--coral)" stroke="var(--sheet)" strokeWidth={2 * scale} />
          <circle cx={c[0]} cy={c[1]} r={12 * scale} fill="none" stroke="var(--coral)" strokeWidth={scale} opacity="0.5" />
        </g>
      )}
    </svg>
  )
}
