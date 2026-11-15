'use client'

import { type ReactNode, useEffect } from 'react'
import { DemoCall } from '@/features/chat/DemoCall'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { DemoCheckout } from '@/features/premium/DemoCheckout'
import { applyTheme } from '@/lib/theme'
import { AccountProvider } from '@/providers/account'
import { PaymentsProvider } from '@/providers/payments'
import { VideoProvider } from '@/providers/video'
import { useApp } from '@/store/app'
import { useHydrated } from '@/store/hooks'
import { BadgeWatcher } from './BadgeWatcher'
import { Celebration } from './Celebration'
import { BottomNav, SideNav, TopBar } from './Nav'
import { Simulator } from './Simulator'
import { Toaster } from './Toaster'

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useHydrated()
  const theme = useApp((s) => s.settings.theme)
  const lang = useApp((s) => s.settings.lang)
  const hasMe = useApp((s) => !!s.me)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  if (!hydrated) return <ShellSkeleton />

  return (
    <AccountProvider>
      <PaymentsProvider Checkout={DemoCheckout}>
        <VideoProvider CallUi={DemoCall}>
          {hasMe ? (
            <div className="flex min-h-dvh">
              <SideNav />
              <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-10">
                <TopBar />
                <main className="mx-auto w-full max-w-5xl pb-28 pt-2 lg:pb-16 lg:pt-8">{children}</main>
              </div>
              <BottomNav />
              <Simulator />
              <BadgeWatcher />
            </div>
          ) : (
            <Onboarding />
          )}
          <Celebration />
          <Toaster />
        </VideoProvider>
      </PaymentsProvider>
    </AccountProvider>
  )
}

function ShellSkeleton() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-4 px-4 pt-6" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-well" />
      <div className="h-28 animate-pulse rounded-2xl bg-well" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-44 animate-pulse rounded-2xl bg-well" />
        <div className="h-44 animate-pulse rounded-2xl bg-well" />
      </div>
    </div>
  )
}
