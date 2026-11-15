import type { Metadata } from 'next'
import { Landing } from '@/site/Landing'

export const metadata: Metadata = {
  alternates: { canonical: '/', languages: { it: '/', en: '/en/' } },
}

export default function Page() {
  return <Landing lang="it" />
}
