'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { create } from 'zustand'

export interface Toast {
  id: number
  text: ReactNode
  href?: string
  tone?: 'ok' | 'info' | 'warn'
  icon?: ReactNode
}

interface ToastStore {
  toasts: Toast[]
  push(t: Omit<Toast, 'id'>): void
  dismiss(id: number): void
}

let next = 1

export const useToasts = create<ToastStore>((set, get) => ({
  toasts: [],
  push(t) {
    const id = next++
    set({ toasts: [...get().toasts.slice(-2), { ...t, id }] })
    setTimeout(() => get().dismiss(id), 4200)
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },
}))

export const toast = (t: Omit<Toast, 'id'>) => useToasts.getState().push(t)

export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const dismiss = useToasts((s) => s.dismiss)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const body = (
            <>
              {t.icon && <span className="shrink-0">{t.icon}</span>}
              <span className="min-w-0 flex-1 text-[0.92rem] font-medium">{t.text}</span>
            </>
          )
          const cls = `pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 shadow-xl ${
            t.tone === 'ok' ? 'bg-mint text-white' : t.tone === 'warn' ? 'bg-yellow text-[#10162f]' : 'bg-ink text-paper'
          }`
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className="w-full max-w-sm"
            >
              {t.href ? (
                <Link href={t.href} className={cls} onClick={() => dismiss(t.id)}>
                  {body}
                </Link>
              ) : (
                <button className={cls + ' text-left'} onClick={() => dismiss(t.id)}>
                  {body}
                </button>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
