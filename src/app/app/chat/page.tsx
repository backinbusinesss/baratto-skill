'use client'

import { Suspense } from 'react'
import { Chat } from '@/features/chat/Chat'

export default function Page() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  )
}
