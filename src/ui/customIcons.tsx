import type { ReactNode } from 'react'

/**
 * Icone disegnate per Baratto Skill dove lucide non ha nulla di adatto (tennis, sci, rossetto…).
 * Stesse regole di lucide: griglia 24×24, tratto 2, estremità arrotondate, nessun riempimento.
 */
const C: Record<string, ReactNode> = {
  'x-violin': (
    <>
      <path d="M14.5 9.5 20 4" />
      <path d="m18.5 2.5 3 3" />
      <path d="M8.5 10.5c-1-1-3-1-4 0s-1 3 0 4l1 1c-.5 1.5 0 3 1 4s2.5 1.5 4 1l1 1c1 1 3 1 4 0s1-3 0-4l-1-1c.5-1.5 0-3-1-4s-2.5-1.5-4-1z" />
      <path d="m9 15 2-2" />
    </>
  ),
  'x-flute': (
    <>
      <path d="m4 18 14-14 2 2L6 20z" />
      <path d="M8.5 13.5h.01M11 11h.01M13.5 8.5h.01" />
    </>
  ),
  'x-sax': (
    <>
      <path d="M13 3h5" />
      <path d="M16 3v10a5 5 0 0 1-10 0v-1" />
      <path d="M4 12h4" />
      <path d="M16 7h.01M16 10h.01" />
    </>
  ),
  'x-trumpet': (
    <>
      <path d="M2 13h12" />
      <path d="m14 9 7-4v14l-7-4z" />
      <path d="M6 9v4M9 9v4M12 9v4" />
      <path d="M5 9h8" />
    </>
  ),
  'x-harmonica': (
    <>
      <rect x="2" y="8" width="20" height="8" rx="2" />
      <path d="M6 11v2M10 11v2M14 11v2M18 11v2" />
    </>
  ),
  'x-harp': (
    <>
      <path d="M5 3v18h13" />
      <path d="M5 3c6 1 10 5 13 11" />
      <path d="M9 5.5V21M13 8.5V21M16 12v9" />
    </>
  ),
  'x-note': (
    <>
      <circle cx="8" cy="18" r="3" />
      <path d="M11 18V4l7 3" />
    </>
  ),
  'x-tambourine': (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="4.5" r="1.2" />
      <circle cx="12" cy="19.5" r="1.2" />
      <circle cx="4.5" cy="12" r="1.2" />
      <circle cx="19.5" cy="12" r="1.2" />
    </>
  ),
  'x-run': (
    <>
      <circle cx="15" cy="4.5" r="2" />
      <path d="m7 21 3.5-5 3 2 1-5" />
      <path d="m4 11 4-3 4.5 1 2.5 4 4 1" />
    </>
  ),
  'x-tennis': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8" />
      <path d="M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8" />
    </>
  ),
  'x-racket': (
    <>
      <circle cx="10" cy="9" r="6" />
      <path d="m14.5 13.5 5.5 5.5" />
      <path d="M8 7h.01M12 7h.01M10 9h.01M8 11h.01M12 11h.01" />
      <circle cx="19.5" cy="5" r="1.8" />
    </>
  ),
  'x-football': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 8 3.2 2.3-1.2 3.7h-4L8.8 10.3z" />
      <path d="M12 3v5M15.2 10.3l4.8-1.6M14 14l3 4M10 14l-3 4M8.8 10.3 4 8.7" />
    </>
  ),
  'x-basketball': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M5.6 5.6c2.5 2.5 2.5 10.3 0 12.8M18.4 5.6c-2.5 2.5-2.5 10.3 0 12.8" />
    </>
  ),
  'x-ski': (
    <>
      <circle cx="15" cy="4" r="2" />
      <path d="m3 16 18 5" />
      <path d="m8 13 4-4 3 3-2 4.5" />
      <path d="m12 9 5 1" />
    </>
  ),
  'x-kite': (
    <>
      <path d="m12 2 6 8-6 8-6-8z" />
      <path d="M6 10h12M12 2v16" />
      <path d="M12 18c0 2 2 2 2 4" />
    </>
  ),
  'x-paddle': (
    <>
      <path d="M6.5 17.5 17.5 6.5" />
      <path d="m15.5 3.5 5 5-2 2-5-5z" />
      <path d="m3.5 15.5 5 5 2-2-5-5z" />
    </>
  ),
  'x-glove': (
    <>
      <path d="M7 11V7a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v6a5 5 0 0 1-5 5H9a2 2 0 0 1-2-2" />
      <path d="M7 11a2 2 0 0 0-2 2v.5A2.5 2.5 0 0 0 7.5 16" />
      <path d="M8 18v3h8v-3" />
    </>
  ),
  'x-skateboard': (
    <>
      <path d="M2.5 11c1 1.2 2.2 2 3.5 2h12c1.3 0 2.5-.8 3.5-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  'x-rollerskate': (
    <>
      <path d="M5 3h6v6.5l6.5 2A3 3 0 0 1 20 14.5V17H5z" />
      <circle cx="7.5" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M8 6h3" />
    </>
  ),
  'x-horseshoe': (
    <>
      <path d="M7 21H4l-.5-7C3 8 7 3 12 3s9 5 8.5 11L20 21h-3l.4-6.5C17.8 10 15.3 7 12 7s-5.8 3-5.4 7.5z" />
      <path d="M6 11h.01M18 11h.01M5.6 16h.01M18.4 16h.01" />
    </>
  ),
  'x-pasta': (
    <>
      <path d="m3 6 9 6-9 6z" />
      <path d="m21 6-9 6 9 6z" />
      <path d="M12 10v4" />
    </>
  ),
  'x-jar': (
    <>
      <path d="M8 3h8v3H8z" />
      <path d="M7 6h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M8 13c1.3-1 2.7 1 4 0s2.7 1 4 0" />
    </>
  ),
  'x-chili': (
    <>
      <path d="M17 7c-3 0-4 2-5 5s-3 6-8 8c6 1 12-2 14-7 .6-1.6.4-4.4-1-6z" />
      <path d="M17 7c0-2 1-3 3-4" />
    </>
  ),
  'x-coffee-pot': (
    <>
      <path d="M8 3h8l-1 7H9z" />
      <path d="M9 10h6l2 11H7z" />
      <path d="M16 5h2a2 2 0 0 1 0 4h-1.5" />
      <path d="M12 1v2" />
    </>
  ),
  'x-knife': (
    <>
      <path d="m3 21 7-7" />
      <path d="m10 14 10-11c1 3 .5 6-2.5 9L13 17z" />
    </>
  ),
  'x-parquet': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h9M12 15h9M12 3v12M9 9v12" />
    </>
  ),
  'x-welding': (
    <>
      <path d="m4 20 10-10" />
      <path d="m14 10 3-3 2 2-3 3z" />
      <path d="M20 4.5 21.5 3M19.5 2v-.5M22 6.5h.5" />
    </>
  ),
  'x-pallet': (
    <>
      <path d="M3 7h18M3 12h18M3 17h18" />
      <path d="M5 17v4M12 17v4M19 17v4" />
    </>
  ),
  'x-bust': (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M6 19v-1a6 6 0 0 1 12 0v1" />
      <path d="M4 21h16" />
    </>
  ),
  'x-candle': (
    <>
      <rect x="8" y="10" width="8" height="11" rx="1" />
      <path d="M12 10V7.5" />
      <path d="M12 2c1.6 1.4 1.6 3 0 4-1.6-1-1.6-2.6 0-4z" />
    </>
  ),
  'x-knot': (
    <>
      <path d="M7 3v5c0 3 10 3 10 6v7" />
      <path d="M17 3v5c0 3-10 3-10 6v7" />
      <path d="M12 3v18" />
    </>
  ),
  'x-lotus': (
    <>
      <path d="M12 20c-4 0-8-2-9-6 3-1 6 0 9 2 3-2 6-3 9-2-1 4-5 6-9 6z" />
      <path d="M12 16c-2.2-2.2-3-5.2-2-9 1 1 2 2.2 2 4 0-1.8 1-3 2-4 1 3.8.2 6.8-2 9z" />
    </>
  ),
  'x-poles': (
    <>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 7v6l-3 8M12 13l3 8" />
      <path d="m5 9 3 12M19 9l-3 12" />
    </>
  ),
  'x-shears': (
    <>
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8 16 16 4M16 16 8 4" />
    </>
  ),
  'x-cactus': (
    <>
      <path d="M10 21V5a2 2 0 0 1 4 0v16" />
      <path d="M14 12h2a2 2 0 0 0 2-2V8" />
      <path d="M10 15H8a2 2 0 0 1-2-2v-2" />
      <path d="M6 21h12" />
    </>
  ),
  'x-mushroom': (
    <>
      <path d="M3 11a9 7 0 0 1 18 0z" />
      <path d="M9 11v7a3 3 0 0 0 6 0v-7" />
      <path d="M8 7h.01M14 5.5h.01M16.5 8.5h.01" />
    </>
  ),
  'x-terrarium': (
    <>
      <path d="M6 9a6 6 0 0 1 12 0v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M6 17h12" />
      <path d="M12 17v-4" />
      <path d="M12 13c-1.6 0-2.6-1-2.6-2.6 1.6 0 2.6 1 2.6 2.6zM12 14c1.6 0 2.6-1 2.6-2.6-1.6 0-2.6 1-2.6 2.6z" />
    </>
  ),
  'x-needle': (
    <>
      <path d="m4 20 11.5-11.5" />
      <path d="M15.5 8.5 19 5a1.4 1.4 0 0 0-2-2l-3.5 3.5" />
      <path d="M17 6c3 4-3 10-9 10" />
    </>
  ),
  'x-yarn': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M6 7.5c4 1 7.5 5 8.5 12M9.5 4.5c2.5 3 6.5 6 10.5 6M4.5 13c3 0 6.5 2 7.5 7" />
      <path d="M18.5 18.5c1 1 2.5 1.5 3.5.5" />
    </>
  ),
  'x-crochet': (
    <>
      <path d="M5 19 17 7" />
      <path d="M17 7a2 2 0 1 1 2-2" />
      <circle cx="7" cy="7" r="3" />
      <path d="M5 9c-1 2 0 4 2 4" />
    </>
  ),
  'x-hoop': (
    <>
      <circle cx="12" cy="13" r="8" />
      <circle cx="12" cy="13" r="5.5" />
      <path d="M12 2v3" />
      <path d="m10.5 11.5 3 3M13.5 11.5l-3 3" />
    </>
  ),
  'x-boot': (
    <>
      <path d="M6 3h6v9l6 2a3 3 0 0 1 3 3v1H6z" />
      <path d="M6 18h15v3H6z" />
      <path d="M9 6h3M9 9h3" />
    </>
  ),
  'x-hanger': (
    <>
      <path d="M10 5a2 2 0 1 1 2 2v1.5" />
      <path d="m12 8.5-9 6.5a1 1 0 0 0 .6 1.8h16.8a1 1 0 0 0 .6-1.8z" />
    </>
  ),
  'x-iron': (
    <>
      <path d="M3 18h18l-1-4a6 6 0 0 0-6-5H7" />
      <path d="M7 9V6h8" />
      <path d="M8 14h.01M12 14h.01M16 14h.01" />
    </>
  ),
  'x-comb': (
    <>
      <path d="M3 8h18v3H3z" />
      <path d="M5 11v7M8 11v7M11 11v7M14 11v7M17 11v7M20 11v5" />
    </>
  ),
  'x-polish': (
    <>
      <rect x="7" y="11" width="10" height="10" rx="2" />
      <path d="M10 11V8h4v3" />
      <path d="M11 8V3h2v5" />
    </>
  ),
  'x-lipstick': (
    <>
      <path d="M8 21h8v-9H8z" />
      <path d="M9 12V8h6v4" />
      <path d="M10 8V5l4-2v5" />
    </>
  ),
  'x-loom': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M7.5 4v16M12 4v16M16.5 4v16" />
      <path d="M3 10c3 1.5 6 1.5 9 0s6-1.5 9 0M3 15c3-1.5 6-1.5 9 0s6 1.5 9 0" />
    </>
  ),
  'x-crayon': (
    <>
      <path d="m15 3 6 6-11 11H4v-6z" />
      <path d="m12 6 6 6" />
      <path d="m4 14 6 6" />
    </>
  ),
  'x-tire': (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
    </>
  ),
  'x-steering': (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 14v7M10 12H3.5M14 12h6.5" />
    </>
  ),
  'x-parking': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </>
  ),
  'x-vintage-car': (
    <>
      <path d="M3 16v-3l2-1 2-4h7l3 4h2a2 2 0 0 1 2 2v2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6M8.5 8v4h8" />
    </>
  ),
}

export const CUSTOM_ICON_NAMES = Object.keys(C)

export function CustomIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const body = C[name]
  if (!body) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {body}
    </svg>
  )
}
