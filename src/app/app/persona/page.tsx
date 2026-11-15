'use client'

import { Suspense } from 'react'
import { PersonPage } from '@/features/people/PersonPage'

export default function Page() {
  return (
    <Suspense>
      <PersonPage />
    </Suspense>
  )
}
