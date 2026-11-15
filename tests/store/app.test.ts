import { balance } from '@/domain/timebank'
import { demoMe, initialData, isActive, outcomeFor, sanitize, useApp } from '@/store/app'
import { myStats, nextAppointment, profileCompleteness } from '@/store/selectors'

const fresh = () => useApp.setState({ ...initialData('it') })

describe('store', () => {
  beforeEach(() => {
    localStorage.clear()
    fresh()
  })

  it('dati salvati corrotti o di un’altra versione fanno ripartire da capo', () => {
    expect(sanitize('garbage').me).toBeNull()
    expect(sanitize({ version: 99, me: demoMe() }).me).toBeNull()
    expect(sanitize({ version: 1, me: { name: 'X', offers: 'no' } }).me).toBeNull()
    expect(sanitize({ version: 1, me: { ...demoMe(), comuneId: 'atlantide' } }).me).toBeNull()
    const ok = sanitize({ version: 1, me: demoMe(), plan: 'gold', settings: { lang: 'en', theme: 'neon' } })
    expect(ok.me?.name).toBe('Giulia')
    expect(ok.plan).toBe('free')
    expect(ok.settings).toEqual({ lang: 'en', theme: 'system' })
  })

  it('onboarding: crea il vicinato, il saldo di benvenuto e le prime proposte in arrivo', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), name: 'Ada', bio: '' })
    const s = useApp.getState()
    expect(s.me?.name).toBe('Ada')
    expect(s.neighbors.length).toBe(40)
    expect(balance(s.ledger)).toBe(2)
    expect(s.exchanges.filter((e) => e.direction === 'in' && e.status === 'pending').length).toBeGreaterThan(0)
  })

  it('ospite demo: storia completa con scambi conclusi, appuntamento e proposte', () => {
    useApp.getState().enterDemo()
    const s = useApp.getState()
    expect(s.me?.name).toBe('Giulia')
    expect(s.exchanges.filter((e) => e.status === 'completed').length).toBe(3)
    expect(nextAppointment(s)).toBeDefined()
    expect(myStats(s).completed).toBe(3)
    expect(profileCompleteness(s)).toBe(1)
  })

  it('il piano gratuito blocca la quarta proposta del mese, Premium no', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), bio: '' })
    const { neighbors } = useApp.getState()
    // azzero le proposte in arrivo per non toccare il limite degli scambi attivi
    useApp.setState({ exchanges: [] })
    const send = (i: number) =>
      useApp.getState().propose({ personId: neighbors[i].id, give: 'english', get: null, hours: 1, slots: ['2030-01-01T19:00'], mode: 'live', note: '' })
    expect(send(0).result).toBe('ok')
    expect(send(1).result).toBe('ok')
    expect(send(2).result).toBe('active-limit')
    // concludo a mano due scambi per liberare posti
    useApp.setState({ exchanges: useApp.getState().exchanges.map((e) => ({ ...e, status: 'declined' as const })) })
    expect(send(3).result).toBe('ok')
    expect(send(4).result).toBe('monthly-limit')
    useApp.getState().setPlan('premium-monthly')
    expect(send(5).result).toBe('ok')
  })

  it('blocca chi andrebbe sotto le −3 ore', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), bio: '' })
    useApp.setState({ exchanges: [], plan: 'premium-yearly', ledger: [{ id: 'a', at: new Date().toISOString(), hours: -3, kind: 'received' }] })
    const p = useApp.getState().neighbors[0]
    const r = useApp.getState().propose({ personId: p.id, give: null, get: p.offers[0].id, hours: 1, slots: [], mode: 'live', note: '' })
    expect(r.result).toBe('balance')
  })

  it('il simulatore risponde alle proposte e conclude lo scambio aggiornando le ore', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), bio: '' })
    useApp.setState({ exchanges: [], plan: 'premium-monthly' })
    const s = useApp.getState()
    // cerco una persona per cui l'esito simulato sia "accetta"
    let id = ''
    for (const p of s.neighbors) {
      const r = useApp.getState().propose({ personId: p.id, give: 'english', get: 'guitar', hours: 1, slots: ['2030-01-01T19:00'], mode: 'live', note: 'Ciao!' }, 1000)
      if (outcomeFor(r.id!) === 'accept') {
        id = r.id!
        break
      }
    }
    expect(id).not.toBe('')
    const events = useApp.getState().tick(Date.now() + 60_000)
    expect(events.some((e) => e.type === 'accepted' && e.exchangeId === id)).toBe(true)
    const ex = useApp.getState().exchanges.find((e) => e.id === id)!
    expect(ex.status).toBe('accepted')
    expect(ex.slot).toBe('2030-01-01T19:00')
    useApp.getState().complete(id)
    const after = useApp.getState()
    expect(after.exchanges.find((e) => e.id === id)?.status).toBe('completed')
    expect(balance(after.ledger)).toBe(2) // +1 dato, −1 ricevuto
    expect(after.exchanges.filter(isActive).every((e) => e.id !== id)).toBe(true)
  })

  it('la chat risponde in automatico', () => {
    useApp.getState().completeOnboarding({ ...demoMe(), bio: '' })
    const p = useApp.getState().neighbors[5]
    useApp.getState().sendMessage(p.id, 'Ciao!', 0)
    const ev = useApp.getState().tick(10_000)
    expect(ev).toContainEqual({ type: 'message', personId: p.id })
    const thread = useApp.getState().threads[p.id]
    expect(thread.at(-1)?.from).toBe('them')
  })
})
