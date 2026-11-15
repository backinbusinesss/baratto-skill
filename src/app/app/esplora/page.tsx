'use client'

import { Suspense } from 'react'
import { Explore } from '@/features/explore/Explore'

export default function Page() {
  return (
    <Suspense>
      <Explore />
    </Suspense>
  )
}
