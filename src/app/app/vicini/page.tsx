'use client'

import { Suspense } from 'react'
import { People } from '@/features/people/People'

export default function Page() {
  return (
    <Suspense>
      <People />
    </Suspense>
  )
}
