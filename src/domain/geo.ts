import { COMUNI, type Comune, normalize } from '@/content/comuni'

export interface LatLon {
  lat: number
  lon: number
}

const R = 6371
const rad = (d: number) => (d * Math.PI) / 180

/** Distanza in linea d'aria (formula dell'emisenoverso), in km. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Cerca i comuni per nome, ignorando accenti e maiuscole ("forli" trova Forlì).
 * Prima chi inizia con il testo cercato, poi chi lo contiene; a parità, i più popolosi.
 */
export function searchComuni(q: string, limit = 8): Comune[] {
  const n = normalize(q)
  if (!n) return []
  const scored: [number, Comune][] = []
  for (const c of COMUNI) {
    const name = normalize(c.name)
    let s = -1
    if (name === n) s = 3
    else if (name.startsWith(n)) s = 2
    else if (name.split(' ').some((w) => w.startsWith(n))) s = 1
    else if (name.includes(n) || normalize(c.prov) === n) s = 0
    if (s >= 0) scored.push([s, c])
  }
  return scored
    .sort((a, b) => b[0] - a[0] || b[1].pop - a[1].pop)
    .slice(0, limit)
    .map(([, c]) => c)
}

/** Comuni entro `km` dal centro, dal più vicino. */
export function comuniWithin(center: LatLon, km: number): { comune: Comune; km: number }[] {
  return COMUNI.map((comune) => ({ comune, km: haversineKm(center, comune) }))
    .filter((x) => x.km <= km)
    .sort((a, b) => a.km - b.km)
}

/** Il comune più vicino a un punto (per la geolocalizzazione). */
export function nearestComune(p: LatLon): Comune {
  let best = COMUNI[0]
  let bestKm = Infinity
  for (const c of COMUNI) {
    const d = haversineKm(p, c)
    if (d < bestKm) {
      bestKm = d
      best = c
    }
  }
  return best
}

/** "1,2 km", "850 m", "34 km" */
export function formatKm(km: number, locale = 'it'): string {
  if (km < 1) return `${Math.max(100, Math.round((km * 1000) / 50) * 50)} m`
  const v = km < 10 ? Math.round(km * 10) / 10 : Math.round(km)
  return `${v.toLocaleString(locale)} km`
}
