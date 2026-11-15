'use client'

import { Suspense } from 'react'
import { Exchanges } from '@/features/exchanges/Exchanges'

export default function Page() {
  return (
    <Suspense>
      <Exchanges />
    </Suspense>
  )
}
