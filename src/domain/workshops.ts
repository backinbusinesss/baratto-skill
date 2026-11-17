/**
 * Workshop di gruppo: una persona insegna una competenza a più persone insieme.
 * Ogni partecipante paga in ore della banca del tempo; chi insegna incassa le ore di tutti.
 */
import { skillById } from '@/content/skills'
import { haversineKm, type LatLon } from './geo'
import { canMeetOnline } from './matching'
import { hashString, int, mulberry32, shuffle } from './rng'
import { SLOT_HOUR } from './slots'
import type { Mode, Person } from './types'

export interface Workshop {
  id: string
  /** id della persona che insegna, oppure "me" se l'ho organizzato io */
  hostId: string
  skill: string
  /** data e ora locali, AAAA-MM-GGTHH:MM */
  at: string
  minutes: 60 | 90 | 120
  mode: 'live' | 'online'
  capacity: number
  /** posti già presi dagli altri */
  taken: number
  /** ore che paga ogni partecipante */
  costHours: number
  comuneId: string
}

export const WORKSHOP_CAPACITIES = [4, 6, 8, 10] as const
export const WORKSHOP_MINUTES = [60, 90, 120] as const

/** Il costo per partecipante: un'ora ogni ora di workshop, arrotondata alla mezz'ora. */
export const workshopCost = (minutes: number) => Math.max(0.5, Math.round((minutes / 60) * 2) / 2)

/** Quanto incassa chi insegna: il costo per ogni partecipante. */
export const hostEarnings = (w: Pick<Workshop, 'costHours'>, participants: number) => w.costHours * participants

const pad = (n: number) => String(n).padStart(2, '0')
const localIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

/** Chiave della settimana (lunedì): i workshop suggeriti cambiano ogni settimana, sempre uguali nella stessa. */
export function weekKey(now: Date): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return localIso(d).slice(0, 10)
}

/**
 * I workshop in programma nelle prossime due settimane, organizzati dalle persone vicine
 * (e, se accetto la videochiamata, anche da chi li tiene online da altre città).
 */
export function suggestWorkshops(
  people: Person[],
  center: LatLon,
  radiusKm: number,
  myMode: Mode,
  now: Date,
  count = 10,
): Workshop[] {
  const week = weekKey(now)
  const rng = mulberry32(hashString(`ws:${week}:${center.lat.toFixed(2)}:${center.lon.toFixed(2)}`))
  const hosts = people.filter((p) => {
    if (!p.offers.some((o) => o.level >= 3)) return false
    if (haversineKm(center, p) <= radiusKm) return true
    return canMeetOnline(myMode, p.mode) && p.mode !== 'live'
  })
  const out: Workshop[] = []
  const usedSkills = new Set<string>()
  const [y, m, d] = week.split('-').map(Number)
  for (const p of shuffle(rng, hosts)) {
    if (out.length >= count) break
    const offer = p.offers.filter((o) => o.level >= 3).find((o) => !usedSkills.has(o.id))
    if (!offer) continue
    // un generatore per persona: ogni workshop resta identico per tutta la settimana
    const r = mulberry32(hashString(`${week}:${p.id}:${offer.id}`))
    const near = haversineKm(center, p) <= radiusKm
    const online = !near || p.mode === 'online' || (p.mode === 'both' && !!skillById(offer.id)?.online && r() < 0.4)
    if (online && !skillById(offer.id)?.online) continue
    // date ancorate al lunedì della settimana; quelli già passati spariscono
    const day = new Date(y, m - 1, d + int(r, 1, 20))
    const weekend = day.getDay() === 0 || day.getDay() === 6
    day.setHours(weekend ? SLOT_HOUR[0] : SLOT_HOUR[2], weekend ? 0 : 30)
    if (day.getTime() <= now.getTime()) continue
    usedSkills.add(offer.id)
    const minutes = WORKSHOP_MINUTES[int(r, 0, 2)]
    const capacity = WORKSHOP_CAPACITIES[int(r, 0, 3)]
    out.push({
      id: `ws-${week}-${p.id}-${offer.id}`,
      hostId: p.id,
      skill: offer.id,
      at: localIso(day),
      minutes,
      mode: online ? 'online' : 'live',
      capacity,
      taken: int(r, 1, capacity - 1),
      costHours: workshopCost(minutes),
      comuneId: p.comuneId,
    })
  }
  return out.sort((a, b) => a.at.localeCompare(b.at))
}

/**
 * Iscritti simulati a un workshop che ho organizzato io: crescono col passare delle ore
 * dalla pubblicazione, senza superare i posti. Deterministico, così non "salta" tra un rendering e l'altro.
 */
export function simulatedSignups(id: string, capacity: number, createdAt: number, now: number): number {
  const rng = mulberry32(hashString(id))
  const target = int(rng, Math.ceil(capacity / 2), capacity)
  const hours = Math.max(0, (now - createdAt) / 3600000)
  // il primo iscritto arriva subito (demo), poi uno ogni ~20 minuti
  return Math.min(target, 1 + Math.floor(hours * 3))
}
