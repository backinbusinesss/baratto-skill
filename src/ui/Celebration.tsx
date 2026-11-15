'use client'

import { ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { create } from 'zustand'
import { fullName } from '@/domain/people'
import { mulberry32 } from '@/domain/rng'
import { findPerson, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Avatar } from './Avatar'

interface CelebrationStore {
  exchangeId: string | null
  show(id: string): void
  hide(): void
}

/** Chi apre la festa: il simulatore quando una proposta viene accettata, o chi accetta una proposta. */
export const useCelebration = create<CelebrationStore>((set) => ({
  exchangeId: null,
  show: (exchangeId) => set({ exchangeId }),
  hide: () => set({ exchangeId: null }),
}))

const COLORS = ['#2742D9', '#FFD43B', '#12A874', '#F2545B', '#FFFFFF']
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * "Affare fatto!": i due avatar si avvicinano, scende un timbro e piovono coriandoli di carta.
 * Si chiude da sola dopo qualche secondo, con Esc o con un clic.
 */
export function Celebration() {
  const tr = useT()
  const reduce = useReducedMotion()
  const id = useCelebration((s) => s.exchangeId)
  const hide = useCelebration((s) => s.hide)
  const ex = useApp((s) => s.exchanges.find((e) => e.id === id))
  const me = useApp((s) => s.me)
  const neighbors = useApp((s) => s.neighbors)
  const p = ex ? findPerson(neighbors, ex.personId) : undefined

  const bits = useMemo(() => {
    const r = mulberry32(id ? id.length * 7919 : 1)
    return Array.from({ length: 42 }, (_, i) => ({
      x: r() * 100,
      d: 0.15 + r() * 0.5,
      dur: 1.8 + r() * 1.4,
      rot: (r() - 0.5) * 720,
      drift: (r() - 0.5) * 160,
      w: 6 + r() * 8,
      h: 10 + r() * 10,
      c: COLORS[i % COLORS.length],
    }))
  }, [id])

  useEffect(() => {
    if (!id) return
    const t = setTimeout(hide, 6000)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide()
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [id, hide])

  return (
    <AnimatePresence>
      {id && ex && p && me && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={tr.t('celebrate.title')}
          className="fixed inset-0 z-[65] grid place-items-center overflow-hidden bg-[#0b0f22]/80 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={hide}
        >
          {!reduce &&
            bits.map((b, i) => (
              <motion.span
                key={i}
                className="absolute top-0 rounded-[2px]"
                style={{ left: `${b.x}%`, width: b.w, height: b.h, background: b.c }}
                initial={{ y: -40, rotate: 0, x: 0, opacity: 1 }}
                animate={{ y: '105vh', rotate: b.rot, x: b.drift, opacity: [1, 1, 0.8] }}
                transition={{ duration: b.dur, delay: b.d, ease: [0.3, 0, 0.6, 1] }}
                aria-hidden
              />
            ))}
          <motion.div
            className="relative w-full max-w-sm text-center text-white"
            initial={reduce ? false : { scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto flex h-28 w-56 items-center justify-center">
              <motion.span initial={reduce ? false : { x: -70, rotate: -12 }} animate={{ x: -26, rotate: -6 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }} className="absolute">
                <Avatar seed={`me-${me.name}`} name={me.name} size={88} className="ring-4 ring-[#0b0f22]" />
              </motion.span>
              <motion.span initial={reduce ? false : { x: 70, rotate: 12 }} animate={{ x: 26, rotate: 6 }} transition={{ duration: 0.9, ease: EASE, delay: 0.1 }} className="absolute">
                <Avatar seed={p.id} name={fullName(p)} size={88} className="ring-4 ring-[#0b0f22]" />
              </motion.span>
            </div>
            <motion.p
              className="stamp-text mx-auto mt-6 w-fit -rotate-6 rounded-xl border-[3px] border-yellow px-5 py-2 text-[2.6rem] font-black uppercase leading-none tracking-tight text-yellow"
              style={{ fontStretch: '70%' }}
              initial={reduce ? false : { scale: 2.4, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: -6 }}
              transition={{ duration: 0.45, ease: [0.5, 0, 0.2, 1.4], delay: 0.55 }}
            >
              {tr.t('celebrate.title')}
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
              <p className="mt-6 text-lg font-semibold">{tr.t('celebrate.text', { name: p.first })}</p>
              <p className="mt-1 text-sm text-white/70">
                {ex.give && tr.skill(ex.give)}
                {ex.give && ex.get && ' ⇄ '}
                {ex.get && tr.skill(ex.get)}
              </p>
              {ex.slot && <p className="hand mt-2 text-2xl text-yellow">{tr.t('celebrate.when', { when: tr.slot(ex.slot) })}</p>}
              <div className="mt-7 flex justify-center gap-2">
                <Link href={`/app/scambio/?id=${ex.id}`} onClick={hide} className="btn btn-yellow">
                  {tr.t('celebrate.cta')} <ArrowRight size={16} />
                </Link>
                <button className="btn text-white/80 hover:bg-white/10" onClick={hide}>
                  {tr.t('celebrate.close')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
