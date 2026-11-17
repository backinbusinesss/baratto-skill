'use client'

import { useMemo } from 'react'
import { comuneById } from '@/content/comuni'
import { defaultReach, findMatches, type Match, type MatchQuery } from '@/domain/matching'
import type { Person } from '@/domain/types'
import { allPeople, findPerson, useApp } from '@/store/app'

/** Tutte le persone (demo + vicinato dell'utente). */
export function usePeople(): Person[] {
  const neighbors = useApp((s) => s.neighbors)
  return useMemo(() => allPeople(neighbors), [neighbors])
}

export function usePerson(id: string | null): Person | undefined {
  const neighbors = useApp((s) => s.neighbors)
  return useMemo(() => (id ? findPerson(neighbors, id) : undefined), [neighbors, id])
}

/** Abbinamenti per l'utente, con gli stessi filtri di `findMatches`. Centro e raggio di default: i suoi. */
export function useMatches(q: Partial<MatchQuery> = {}): Match[] {
  const me = useApp((s) => s.me)
  const people = usePeople()
  const key = JSON.stringify({ ...q, exclude: q.exclude ? [...q.exclude] : undefined })
  return useMemo(() => {
    if (!me) return []
    const center = q.center ?? comuneById(me.comuneId)!
    return findMatches(me, people, { radiusKm: me.radiusKm, reach: defaultReach(me.mode), ...q, center })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, people, key])
}
