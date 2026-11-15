/** Badge: si sbloccano quando una statistica raggiunge la soglia. Nomi e descrizioni sono nelle traduzioni. */
export interface Stats {
  completed: number
  hoursGiven: number
  hoursReceived: number
  skillsTaught: number
  categoriesTaught: number
  languagesTaught: number
  reviewsGiven: number
  fiveStars: number
  peopleMet: number
  triads: number
  profileComplete: number
  morning: number
  evening: number
  premium: number
  messages: number
  pioneer: number
}

export const EMPTY_STATS: Stats = {
  completed: 0,
  hoursGiven: 0,
  hoursReceived: 0,
  skillsTaught: 0,
  categoriesTaught: 0,
  languagesTaught: 0,
  reviewsGiven: 0,
  fiveStars: 0,
  peopleMet: 0,
  triads: 0,
  profileComplete: 0,
  morning: 0,
  evening: 0,
  premium: 0,
  messages: 0,
  pioneer: 0,
}

export type BadgeId =
  | 'first-exchange'
  | 'regular'
  | 'pillar'
  | 'golden-hands'
  | 'time-patron'
  | 'sponge'
  | 'polyglot'
  | 'all-rounder'
  | 'mentor'
  | 'five-stars'
  | 'kind-critic'
  | 'good-neighbor'
  | 'triangle'
  | 'calling-card'
  | 'early-bird'
  | 'night-owl'
  | 'supporter'
  | 'chatterbox'
  | 'pioneer'

export interface BadgeDef {
  id: BadgeId
  metric: keyof Stats
  target: number
  /** icona lucide */
  icon: string
  color: string
}

export const BADGES: BadgeDef[] = [
  { id: 'pioneer', metric: 'pioneer', target: 1, icon: 'flag', color: '#E5533B' },
  { id: 'calling-card', metric: 'profileComplete', target: 1, icon: 'id-card', color: '#2B7A9E' },
  { id: 'first-exchange', metric: 'completed', target: 1, icon: 'handshake', color: '#2E6A4F' },
  { id: 'regular', metric: 'completed', target: 5, icon: 'repeat', color: '#3E9C8F' },
  { id: 'pillar', metric: 'completed', target: 20, icon: 'landmark', color: '#4B5BA6' },
  { id: 'golden-hands', metric: 'hoursGiven', target: 10, icon: 'hand-heart', color: '#F1B238' },
  { id: 'time-patron', metric: 'hoursGiven', target: 50, icon: 'hourglass', color: '#B4683C' },
  { id: 'sponge', metric: 'hoursReceived', target: 10, icon: 'brain', color: '#D24D7E' },
  { id: 'polyglot', metric: 'languagesTaught', target: 2, icon: 'languages', color: '#E5533B' },
  { id: 'all-rounder', metric: 'categoriesTaught', target: 3, icon: 'shapes', color: '#8E5CC3' },
  { id: 'mentor', metric: 'skillsTaught', target: 5, icon: 'graduation-cap', color: '#2B7A9E' },
  { id: 'five-stars', metric: 'fiveStars', target: 5, icon: 'star', color: '#F1B238' },
  { id: 'kind-critic', metric: 'reviewsGiven', target: 5, icon: 'message-square-heart', color: '#C2477A' },
  { id: 'good-neighbor', metric: 'peopleMet', target: 10, icon: 'house', color: '#4F8A2B' },
  { id: 'triangle', metric: 'triads', target: 1, icon: 'triangle', color: '#8E7CC3' },
  { id: 'early-bird', metric: 'morning', target: 3, icon: 'sunrise', color: '#E08A1E' },
  { id: 'night-owl', metric: 'evening', target: 3, icon: 'moon', color: '#3A6FD8' },
  { id: 'chatterbox', metric: 'messages', target: 20, icon: 'messages-square', color: '#3E9C8F' },
  { id: 'supporter', metric: 'premium', target: 1, icon: 'crown', color: '#8E7CC3' },
]

export function badgeProgress(b: BadgeDef, s: Stats): { value: number; pct: number; earned: boolean } {
  const value = s[b.metric]
  return { value, pct: Math.min(1, value / b.target), earned: value >= b.target }
}

export function earnedBadges(s: Stats): BadgeId[] {
  return BADGES.filter((b) => s[b.metric] >= b.target).map((b) => b.id)
}

/** Statistiche stimate di un profilo demo (a partire da recensioni e ore). */
export function demoStats(p: {
  reviews: number
  rating: number
  hoursGiven: number
  hoursReceived: number
  offers: { id: string }[]
  premium: boolean
  joined: string
  seed: number
  langs: string[]
}): Stats {
  return {
    ...EMPTY_STATS,
    completed: p.reviews,
    hoursGiven: p.hoursGiven,
    hoursReceived: p.hoursReceived,
    skillsTaught: Math.min(p.offers.length, Math.ceil(p.reviews / 3)),
    categoriesTaught: Math.min(3, Math.ceil(p.reviews / 6)),
    languagesTaught: p.langs.length >= 3 && p.reviews > 4 ? 2 : 0,
    reviewsGiven: Math.round(p.reviews * 0.8),
    fiveStars: p.rating >= 4.6 ? Math.round(p.reviews * 0.7) : Math.round(p.reviews * 0.3),
    peopleMet: Math.round(p.reviews * 0.75),
    triads: p.seed % 7 === 0 && p.reviews > 10 ? 1 : 0,
    profileComplete: 1,
    morning: p.seed % 3 === 0 ? 4 : 0,
    evening: p.seed % 3 === 1 ? 4 : 0,
    premium: p.premium ? 1 : 0,
    messages: p.reviews * 6,
    pioneer: p.joined < '2025-01-01' ? 1 : 0,
  }
}
