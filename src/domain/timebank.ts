/** Banca del tempo: un'ora insegnata vale un'ora ricevuta, qualunque sia la competenza. */
export const WELCOME_HOURS = 2
/** "fido di quartiere": si può andare in rosso fino a qui, poi si possono solo dare ore */
export const MIN_BALANCE = -3

export type LedgerKind = 'welcome' | 'gave' | 'received' | 'bonus' | 'refund' | 'workshop' | 'workshopHosted'

export interface LedgerEntry {
  id: string
  /** ISO */
  at: string
  hours: number
  kind: LedgerKind
  exchangeId?: string
  personId?: string
  skill?: string
}

export function balance(ledger: LedgerEntry[]): number {
  return Math.round(ledger.reduce((s, e) => s + e.hours, 0) * 100) / 100
}

/** `delta` è la variazione del saldo che lo scambio produrrebbe (ore date − ore ricevute). */
export function canAfford(current: number, delta: number): boolean {
  return delta >= 0 || current + delta >= MIN_BALANCE
}

/** Variazione del saldo per uno scambio in cui do `giveHours` e ricevo `getHours`. */
export const exchangeDelta = (giveHours: number, getHours: number) => giveHours - getHours

/** Totali per il riepilogo: ore date, ricevute e saldo per mese (ultimi `months`). */
export function monthlySeries(ledger: LedgerEntry[], months: number, now = new Date()) {
  const out: { key: string; gave: number; received: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    out.push({ key: d.toISOString().slice(0, 7), gave: 0, received: 0 })
  }
  for (const e of ledger) {
    const row = out.find((r) => r.key === e.at.slice(0, 7))
    if (!row) continue
    if (e.kind === 'gave' || e.kind === 'workshopHosted') row.gave += e.hours
    if (e.kind === 'received' || e.kind === 'workshop') row.received += -e.hours
  }
  return out
}
