/**
 * Proiezione della mappa dell'Italia: equirettangolare con la longitudine accorciata
 * del coseno di 42° (la latitudine media), così la penisola non appare schiacciata.
 * La usano sia lo script che disegna la sagoma sia la mappa per piazzare i punti.
 */
const LON0 = 6.4
const LAT0 = 47.2
const K = 100
const COS = Math.cos((42 * Math.PI) / 180)

export const ITALY_PROJ = { width: 920, height: 1180 }

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * COS * K, (LAT0 - lat) * K]
}

/** Chilometri → unità della mappa (1° di latitudine ≈ 111 km). */
export const kmToUnits = (km: number) => (km / 111) * K
