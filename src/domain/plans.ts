/** Piani di Baratto Skill. Il Premium mette il profilo in evidenza e toglie i limiti agli scambi. */
export type PlanId = 'free' | 'premium-monthly' | 'premium-yearly'

export interface Plan {
  id: PlanId
  /** prezzo in centesimi di euro */
  priceCents: number
  period: 'month' | 'year' | null
  /** nuove proposte al mese (null = illimitate) */
  proposalsPerMonth: number | null
  /** scambi attivi contemporaneamente (null = illimitati) */
  activeExchanges: number | null
  maxRadiusKm: number
  featured: boolean
  triads: boolean
  advancedFilters: boolean
  profileViews: boolean
  /** organizzare workshop di gruppo (partecipare è sempre gratis, si paga in ore) */
  hostWorkshops: boolean
}

export const TRIAL_DAYS = 14
export const FREE_RADIUS_KM = 25
export const PREMIUM_RADIUS_KM = 150

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    priceCents: 0,
    period: null,
    proposalsPerMonth: 3,
    activeExchanges: 2,
    maxRadiusKm: FREE_RADIUS_KM,
    featured: false,
    triads: false,
    advancedFilters: false,
    profileViews: false,
    hostWorkshops: false,
  },
  'premium-monthly': {
    id: 'premium-monthly',
    priceCents: 499,
    period: 'month',
    proposalsPerMonth: null,
    activeExchanges: null,
    maxRadiusKm: PREMIUM_RADIUS_KM,
    featured: true,
    triads: true,
    advancedFilters: true,
    profileViews: true,
    hostWorkshops: true,
  },
  'premium-yearly': {
    id: 'premium-yearly',
    priceCents: 3999,
    period: 'year',
    proposalsPerMonth: null,
    activeExchanges: null,
    maxRadiusKm: PREMIUM_RADIUS_KM,
    featured: true,
    triads: true,
    advancedFilters: true,
    profileViews: true,
    hostWorkshops: true,
  },
}

export const limitsFor = (plan: PlanId): Plan => PLANS[plan]
export const isPremium = (plan: PlanId) => plan !== 'free'

/** Risparmio del piano annuale rispetto a 12 mesi di mensile, in percentuale intera. */
export function yearlySavingPct(): number {
  const monthly12 = PLANS['premium-monthly'].priceCents * 12
  return Math.round((1 - PLANS['premium-yearly'].priceCents / monthly12) * 100)
}

export function clampRadius(plan: PlanId, km: number): number {
  return Math.max(1, Math.min(km, PLANS[plan].maxRadiusKm))
}

export type ProposeCheck = 'ok' | 'monthly-limit' | 'active-limit'

export function canPropose(s: { plan: PlanId; proposalsThisMonth: number; activeExchanges: number }): ProposeCheck {
  const p = PLANS[s.plan]
  if (p.proposalsPerMonth !== null && s.proposalsThisMonth >= p.proposalsPerMonth) return 'monthly-limit'
  if (p.activeExchanges !== null && s.activeExchanges >= p.activeExchanges) return 'active-limit'
  return 'ok'
}

/** "4,99 €" */
export function formatPrice(cents: number, locale = 'it'): string {
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(
    cents / 100,
  )
}
