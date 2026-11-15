'use client'

import { Suspense } from 'react'
import { ExchangeDetail } from '@/features/exchanges/ExchangeDetail'

export default function Page() {
  return (
    <Suspense>
      <ExchangeDetail />
    </Suspense>
  )
}
