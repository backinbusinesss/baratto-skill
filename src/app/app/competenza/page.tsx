'use client'

import { Suspense } from 'react'
import { SkillDetail } from '@/features/explore/SkillDetail'

export default function Page() {
  return (
    <Suspense>
      <SkillDetail />
    </Suspense>
  )
}
