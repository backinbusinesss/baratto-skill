import type { CategoryId } from '@/content/categories'

/** Category names and short descriptions in English. */
export const categories: Record<CategoryId, { name: string; blurb: string }> = {
  languages: { name: 'Languages', blurb: 'Conversation, grammar, dialects and sign language' },
  tech: { name: 'Tech', blurb: 'From the PC that won’t boot to your first website' },
  music: { name: 'Music', blurb: 'Instruments, singing, theory and production' },
  sport: { name: 'Sport & movement', blurb: 'Train together, from padel to tango' },
  cooking: { name: 'Cooking', blurb: 'Home recipes, baking and world cuisines' },
  home: { name: 'Home & DIY', blurb: 'Fix, assemble, paint, save' },
  study: { name: 'Study & tutoring', blurb: 'Tutoring, theses, tests and study skills' },
  art: { name: 'Art & creativity', blurb: 'Drawing, photos, ceramics, theatre and writing' },
  wellness: { name: 'Wellbeing', blurb: 'Yoga, breathing, posture and good habits' },
  garden: { name: 'Garden & nature', blurb: 'Veg patch, pruning, bees and houseplants' },
  career: { name: 'Work & career', blurb: 'CVs, interviews, marketing and paperwork' },
  fashion: { name: 'Fashion & sewing', blurb: 'Hems, crochet, tailoring and style' },
  family: { name: 'Family & pets', blurb: 'Kids, grandparents, dogs, cats and time together' },
  motors: { name: 'Motors & mobility', blurb: 'Bikes, cars, motorbikes, campers and boats' },
}
