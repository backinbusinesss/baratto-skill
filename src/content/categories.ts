/** Le 14 categorie del catalogo. I nomi tradotti sono in src/i18n/<lingua>/categories.ts. */
export const CATEGORY_IDS = [
  'languages',
  'tech',
  'music',
  'sport',
  'cooking',
  'home',
  'study',
  'art',
  'wellness',
  'garden',
  'career',
  'fashion',
  'family',
  'motors',
] as const

export type CategoryId = (typeof CATEGORY_IDS)[number]

export interface CategoryDef {
  id: CategoryId
  /** colore della categoria (sfondi tenui e icone) */
  color: string
  /** nome dell'icona lucide (vedi src/ui/CategoryIcon.tsx) */
  icon: string
  /** se le competenze della categoria si possono, di norma, insegnare anche online */
  online: boolean
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'languages', color: '#E5533B', icon: 'languages', online: true },
  { id: 'tech', color: '#3A6FD8', icon: 'laptop', online: true },
  { id: 'music', color: '#8E5CC3', icon: 'music', online: true },
  { id: 'sport', color: '#1E9A6A', icon: 'bike', online: false },
  { id: 'cooking', color: '#E08A1E', icon: 'chef-hat', online: false },
  { id: 'home', color: '#B4683C', icon: 'hammer', online: false },
  { id: 'study', color: '#2B7A9E', icon: 'graduation-cap', online: true },
  { id: 'art', color: '#D24D7E', icon: 'palette', online: false },
  { id: 'wellness', color: '#3E9C8F', icon: 'flower', online: true },
  { id: 'garden', color: '#4F8A2B', icon: 'sprout', online: false },
  { id: 'career', color: '#4B5BA6', icon: 'briefcase', online: true },
  { id: 'fashion', color: '#C2477A', icon: 'scissors', online: false },
  { id: 'family', color: '#D9A21B', icon: 'heart-handshake', online: false },
  { id: 'motors', color: '#5B6470', icon: 'wrench', online: false },
]

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))
export const categoryById = (id: CategoryId): CategoryDef => BY_ID.get(id)!
