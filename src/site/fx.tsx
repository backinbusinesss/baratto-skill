'use client'

/**
 * Movimento del sito vetrina: scorrimento morbido, comparse, titolo che sale parola per
 * parola, contatori, testo che si "inchiostra" scorrendo. Tutto spento con prefers-reduced-motion.
 */
import Lenis from 'lenis'
import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'

const EASE = [0.16, 1, 0.3, 1] as const
/** separatore delle migliaia anche per i numeri a 4 cifre ("3.000") */
const GROUP = { useGrouping: 'always' } as Intl.NumberFormatOptions

/** Scorrimento morbido (Lenis) solo sul sito, mai con movimento ridotto. */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -72 } })
    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    })
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])
  return null
}

/** I figli compaiono salendo, uno dopo l'altro, quando entrano nello schermo. */
export function Reveal({ children, className, delay = 0, stagger = 0.08, as = 'div' }: { children: ReactNode; className?: string; delay?: number; stagger?: number; as?: 'div' | 'ul' | 'ol' }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  if (reduce) {
    const T = as
    return <T className={className}>{children}</T>
  }
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </M>
  )
}

/** Un elemento dentro <Reveal>. */
export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } } }}
    >
      {children}
    </M>
  )
}

/** Titolo che sale parola per parola da sotto una maschera (il momento dell'hero). */
export function WordRise({ lines, className, delay = 0.1 }: { lines: { text: string; className?: string }[]; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  let i = 0
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <span key={li} className={cx('block', line.className)}>
          {line.text.split(' ').map((w, wi) => {
            const n = i++
            return (
              <span key={wi}>
              {wi > 0 && ' '}
              <span className="inline-block overflow-hidden pb-[0.08em] align-bottom -mb-[0.08em]">
                <motion.span
                  className="inline-block"
                  initial={reduce ? false : { y: '110%', rotateX: -35, opacity: 0 }}
                  animate={{ y: 0, rotateX: 0, opacity: 1 }}
                  transition={{ duration: 1.1, ease: EASE, delay: delay + n * 0.06 }}
                  style={{ transformOrigin: '50% 100%' }}
                >
                  {w}
                </motion.span>
              </span>
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}

/** Numero che rotola fino al valore quando entra nello schermo. */
export function Counter({ to, locale, className }: { to: number; locale: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!inView || !ref.current) return
    if (reduce) {
      ref.current.textContent = to.toLocaleString(locale, GROUP)
      return
    }
    const c = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString(locale, GROUP)
      },
    })
    return () => c.stop()
  }, [inView, to, locale, reduce])
  return (
    <span ref={ref} className={cx('num', className)}>
      {to.toLocaleString(locale, GROUP)}
    </span>
  )
}

/**
 * Frase che si "inchiostra" parola per parola scorrendo. Le parole tra *asterischi*
 * prendono il colore della chiave (cobalto) quando vengono lette. Senza JS o con
 * movimento ridotto il testo è tutto leggibile.
 */
export function FillStatement({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [n, setN] = useState(-1)
  const words = text.split(' ').map((w) => ({ key: w.startsWith('*'), w: w.replace(/\*/g, '') }))
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setN(0)
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.35)))
      setN(Math.round(p * words.length))
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [words.length])
  return (
    <p ref={ref} className={className}>
      {words.map((x, i) => {
        const on = n < 0 || i < n
        return (
          <span
            key={i}
            className={cx('transition-colors duration-300', on ? (x.key ? 'text-cobalt' : 'text-ink') : 'text-ink/15')}
          >
            {x.w}{' '}
          </span>
        )
      })}
    </p>
  )
}

/** Nastro che scorre all'infinito (si ferma al passaggio del mouse e con movimento ridotto). */
export function Marquee({ children, reverse, speed = 60, className }: { children: ReactNode; reverse?: boolean; speed?: number; className?: string }) {
  return (
    <div className={cx('marquee group', className)}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        <div className="flex shrink-0 gap-3 pr-3">{children}</div>
        <div className="flex shrink-0 gap-3 pr-3" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
