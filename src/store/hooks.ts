'use client'

import { useEffect, useState } from 'react'
import { getT, type Translator } from '@/i18n'
import { useApp } from './app'

/** Vero dopo che i dati salvati sono stati letti: prima si mostra uno scheletro. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    if (useApp.persist.hasHydrated()) setHydrated(true)
    return useApp.persist.onFinishHydration(() => setHydrated(true))
  }, [])
  return hydrated
}

/** Il traduttore nella lingua scelta dall'utente. */
export function useT(): Translator {
  const lang = useApp((s) => s.settings.lang)
  return getT(lang)
}

/** L'ora corrente, aggiornata ogni `ms` (per "sta scrivendo…" e i conti alla rovescia). */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
