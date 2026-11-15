import type { Metadata } from 'next'
import { Landing } from '@/site/Landing'

export const metadata: Metadata = {
  title: 'Baratto Skill — I teach you, you teach me',
  description:
    'Swap skills with people in your area: an hour of English for an hour of computer help. Over 400 skills, a time bank, three-way swaps. No money involved.',
  alternates: { canonical: '/en/', languages: { it: '/', en: '/en/' } },
  openGraph: { locale: 'en_GB', title: 'Baratto Skill — I teach you, you teach me' },
}

export default function Page() {
  return <Landing lang="en" />
}
