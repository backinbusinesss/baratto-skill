import { comuneById } from '@/content/comuni'
import { comuniWithin, formatKm, haversineKm, nearestComune, searchComuni } from '@/domain/geo'

describe('geo', () => {
  it('Milano–Roma è circa 477 km in linea d’aria', () => {
    const d = haversineKm(comuneById('milano')!, comuneById('roma')!)
    expect(d).toBeGreaterThan(470)
    expect(d).toBeLessThan(490)
  })

  it('la ricerca ignora gli accenti e mette prima chi inizia con il testo', () => {
    expect(searchComuni('forli')[0].name).toBe('Forlì')
    expect(searchComuni('FIR')[0].name).toBe('Firenze')
    expect(searchComuni('aquila')[0].name).toBe("L'Aquila")
    expect(searchComuni('')).toEqual([])
    expect(searchComuni('zzzz')).toEqual([])
  })

  it('i comuni entro 20 km da Napoli includono Pozzuoli ma non Salerno', () => {
    const ids = comuniWithin(comuneById('napoli')!, 20).map((x) => x.comune.id)
    expect(ids[0]).toBe('napoli')
    expect(ids).toContain('pozzuoli')
    expect(ids).not.toContain('salerno')
  })

  it('trova il comune più vicino a un punto', () => {
    expect(nearestComune({ lat: 44.49, lon: 11.34 }).id).toBe('bologna')
  })

  it('formatta le distanze', () => {
    expect(formatKm(0.42)).toBe('400 m')
    expect(formatKm(3.27)).toBe('3,3 km')
    expect(formatKm(34.6)).toBe('35 km')
  })
})
