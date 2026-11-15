import { type Availability, isFree } from './types'

/** Ora di inizio di ogni fascia: mattina, pomeriggio, sera. */
export const SLOT_HOUR = [10, 16, 19] as const

const pad = (n: number) => String(n).padStart(2, '0')

/** "2026-11-21T19:00" in ora locale, senza fuso: è un appuntamento "da calendario". */
export function slotIso(date: Date, slot: number): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(SLOT_HOUR[slot])}:00`
}

/** Giorno della settimana con lunedì = 0. */
export const weekday = (d: Date) => (d.getDay() + 6) % 7

export function slotOf(iso: string): { day: number; slot: number } {
  const d = new Date(iso)
  const h = d.getHours()
  return { day: weekday(d), slot: h < 13 ? 0 : h < 18 ? 1 : 2 }
}

export interface SlotOption {
  iso: string
  day: number
  slot: number
  /** entrambi liberi */
  shared: boolean
}

/**
 * Le fasce dei prossimi `days` giorni (da domani) in cui sono libero io;
 * `shared` dice se è libera anche l'altra persona.
 */
export function slotOptions(mine: Availability, theirs: Availability, from: Date, days = 14): SlotOption[] {
  const out: SlotOption[] = []
  for (let i = 1; i <= days; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    const day = weekday(d)
    for (let s = 0; s < 3; s++) {
      if (!isFree(mine, day, s)) continue
      out.push({ iso: slotIso(d, s), day, slot: s, shared: isFree(theirs, day, s) })
    }
  }
  return out
}

/** Primi `n` orari migliori: prima quelli in comune, poi gli altri. */
export function bestSlots(mine: Availability, theirs: Availability, from: Date, n = 3): string[] {
  const opts = slotOptions(mine, theirs, from)
  const shared = opts.filter((o) => o.shared)
  const pool = shared.length ? shared : opts
  // distribuiti nei giorni, non tutti lo stesso giorno
  const picked: SlotOption[] = []
  for (const o of pool) {
    if (picked.length >= n) break
    if (!picked.some((p) => p.iso.slice(0, 10) === o.iso.slice(0, 10))) picked.push(o)
  }
  return picked.map((o) => o.iso)
}

export interface IcsEvent {
  uid: string
  start: string
  minutes: number
  title: string
  description?: string
  location?: string
}

const icsDate = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

/** File iCalendar (RFC 5545) con gli appuntamenti, da importare in qualsiasi calendario. */
export function buildIcs(events: IcsEvent[], now = new Date()): string {
  const stamp = `${icsDate(now)}`
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Baratto Skill//Demo//IT', 'CALSCALE:GREGORIAN']
  for (const e of events) {
    const start = new Date(e.start)
    const end = new Date(start.getTime() + e.minutes * 60000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}@baratto-skill`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsText(e.title)}`,
    )
    if (e.description) lines.push(`DESCRIPTION:${icsText(e.description)}`)
    if (e.location) lines.push(`LOCATION:${icsText(e.location)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}
