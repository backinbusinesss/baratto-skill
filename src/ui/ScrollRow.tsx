'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import { useT } from '@/store/hooks'

/**
 * Riga orizzontale scorrevole con le frecce ai lati. Le frecce (e la sfumatura) compaiono
 * solo da un lato dove c'è altro da vedere; un clic scorre di circa tre quarti di riga.
 * Resta scorrevole anche con il dito o il trackpad.
 */
export function ScrollRow({ children, className, innerClassName }: { children: ReactNode; className?: string; innerClassName?: string }) {
  const tr = useT()
  const ref = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(false)
  const [right, setRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setLeft(el.scrollLeft > 4)
    setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const raf = requestAnimationFrame(update)
    el.addEventListener('scroll', update, { passive: true })
    el.addEventListener('scrollend', update)
    // la larghezza del contenuto cambia anche quando arrivano i caratteri o cambiano i chip
    document.fonts?.ready.then(update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (ro) {
      ro.observe(el)
      for (const child of Array.from(el.children)) ro.observe(child)
    }
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('scroll', update)
      el.removeEventListener('scrollend', update)
      ro?.disconnect()
    }
  }, [update, children])

  const go = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: reduce ? 'auto' : 'smooth' })
    // non tutti i browser segnalano la fine dello scorrimento animato: ricontrolla dopo
    setTimeout(update, 450)
  }

  const arrow = (dir: 1 | -1, show: boolean) => (
    <div
      className={cx(
        'pointer-events-none absolute inset-y-0 z-10 flex items-center transition-opacity duration-200',
        dir < 0 ? 'left-0 bg-gradient-to-r from-paper from-55% to-transparent pr-6' : 'right-0 bg-gradient-to-l from-paper from-55% to-transparent pl-6',
        show ? 'opacity-100' : 'opacity-0',
      )}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        aria-label={dir < 0 ? tr.t('common.scrollLeft') : tr.t('common.scrollRight')}
        onClick={() => go(dir)}
        className={cx(
          'grid h-9 w-9 place-items-center rounded-full border border-line bg-sheet text-ink shadow-[0_6px_16px_-8px_rgba(16,22,47,0.45)] transition-colors hover:bg-ink hover:text-paper',
          show ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        {dir < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  )

  return (
    <div className={cx('relative', className)}>
      {arrow(-1, left)}
      <div ref={ref} className={cx('no-scrollbar flex overflow-x-auto scroll-smooth', innerClassName)}>
        {children}
      </div>
      {arrow(1, right)}
    </div>
  )
}
