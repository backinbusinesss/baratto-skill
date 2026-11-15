import { hashString, mulberry32 } from '@/domain/rng'

/** Colori degli avatar: tinte piene che stanno bene con la carta e con il blu notte. */
const SWATCHES = ['#2742D9', '#12A874', '#F2545B', '#FFB020', '#7B61FF', '#0FA3B1', '#E0559B', '#3B3F5C', '#F08A24', '#4C9A2A']

export function avatarColors(seed: string) {
  const r = mulberry32(hashString(seed))
  const bg = SWATCHES[Math.floor(r() * SWATCHES.length)]
  let fg = SWATCHES[Math.floor(r() * SWATCHES.length)]
  if (fg === bg) fg = SWATCHES[(SWATCHES.indexOf(bg) + 3) % SWATCHES.length]
  return { bg, fg, shape: Math.floor(r() * 4), rot: Math.floor(r() * 4) * 90 }
}

/**
 * Avatar generato: una forma geometrica e le iniziali, ricavate dal nome.
 * Nessuna foto di persone (vere o finte).
 */
export function Avatar({
  seed,
  name,
  size = 44,
  ring,
  className,
}: {
  seed: string
  name: string
  size?: number
  ring?: 'premium' | 'none'
  className?: string
}) {
  const { bg, fg, shape, rot } = avatarColors(seed)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  const dark = bg === '#FFB020' || bg === '#F08A24'
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: ring === 'premium' ? '0 0 0 2.5px var(--sheet), 0 0 0 4.5px var(--yellow)' : undefined,
      }}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" style={{ transform: `rotate(${rot}deg)` }}>
        {shape === 0 && <circle cx="34" cy="34" r="16" fill={fg} opacity="0.85" />}
        {shape === 1 && <path d="M0 28 Q20 16 40 28 V40 H0Z" fill={fg} opacity="0.85" />}
        {shape === 2 && <rect x="22" y="-6" width="22" height="22" rx="4" transform="rotate(20 30 6)" fill={fg} opacity="0.85" />}
        {shape === 3 && <path d="M0 40 L40 8 V40Z" fill={fg} opacity="0.7" />}
      </svg>
      <span
        className="relative font-bold"
        style={{ fontSize: size * 0.38, fontStretch: '88%', color: dark ? '#10162F' : '#fff', letterSpacing: '-0.02em' }}
      >
        {initials}
      </span>
    </span>
  )
}
