'use client'

import { Check, Hourglass, Star } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { getT, type Lang } from '@/i18n'
import { cx } from '@/lib/cx'
import { Avatar } from '@/ui/Avatar'
import { LogoMark } from '@/ui/Logo'

const EASE = [0.16, 1, 0.3, 1] as const

interface Tab {
  name: string
  seed: string
  skill: string
  city: string
}

/**
 * L'hero del sito: il volantino "lezioni di inglese" con le linguette e, accanto, il telefono
 * con l'app vera. Strappando una linguetta (all'apertura se ne stacca una da sola) sul telefono
 * arriva lo scambio confermato.
 */
export function HeroStage({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const reduce = useReducedMotion()
  const st = tr.m.site.stage
  const tabs: Tab[] = [
    { name: 'Ivan', seed: 'hero-ivan', skill: 'pc-repair', city: 'Bologna' },
    { name: 'Sara', seed: 'hero-sara', skill: 'guitar', city: 'Bologna' },
    { name: 'Wei', seed: 'hero-wei', skill: 'mandarin', city: 'Imola' },
    { name: 'Anna', seed: 'hero-anna', skill: 'yoga', city: 'Casalecchio' },
    { name: 'Dario', seed: 'hero-dario', skill: 'bike-repair', city: 'Bologna' },
    { name: 'Olena', seed: 'hero-olena', skill: 'ukrainian', city: 'San Lazzaro' },
  ]
  const [torn, setTorn] = useState<number[]>([])
  const last = torn.length ? tabs[torn[torn.length - 1]] : null

  // il momento dell'apertura: la prima linguetta si stacca da sola
  useEffect(() => {
    if (reduce) return
    const id = setTimeout(() => setTorn((t) => (t.length ? t : [0])), 1700)
    return () => clearTimeout(id)
  }, [reduce])

  const tear = (i: number) => setTorn((t) => (t.includes(i) ? t : [...t, i]))

  return (
    <div className="relative mx-auto h-[560px] w-full max-w-[560px] sm:h-[620px]">
      {/* volantino */}
      <motion.div
        className="absolute left-0 top-10 z-10 w-[64%] sm:w-[58%]"
        initial={reduce ? false : { opacity: 0, y: 40, rotate: -9 }}
        animate={{ opacity: 1, y: 0, rotate: -4 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
      >
        <div className="flyer px-5 pb-5 pt-7">
          <span className="flyer-pin" style={{ ['--pin' as string]: 'var(--coral)' }} />
          <p className="hand text-[2.5rem] leading-[0.9] sm:text-[3rem]">{tr.skill('english')}!</p>
          <p className="hand mt-2 text-[1.3rem] leading-tight text-muted">
            {st.flyerNote}
          </p>
          <p className="mt-3 text-xs font-semibold text-faint">Giulia · Bologna</p>
        </div>
        <div className="tabs-row !overflow-visible">
          {tabs.map((t, i) => {
            const isTorn = torn.includes(i)
            return (
              <motion.button
                key={t.name}
                type="button"
                onClick={() => tear(i)}
                aria-label={tr.t('site.stage.tearAria', { name: t.name })}
                className={cx('tear-tab !h-[6.2rem] cursor-pointer !text-[0.72rem] hover:bg-yellow/40', i === 0 && 'hit')}
                animate={isTorn && !reduce ? { y: 160, x: -20 + i * 6, rotate: 180 - 24 + i * 5, opacity: 0 } : { y: 0, opacity: isTorn ? 0.2 : 1, rotate: 180 }}
                transition={{ duration: isTorn ? 0.9 : 0.3, ease: [0.5, 0, 0.75, 0] }}
                style={{ rotate: 180 }}
              >
                {tr.skill(t.skill)}
              </motion.button>
            )
          })}
        </div>
        {/* nota scritta a mano con la freccia */}
        <div className="pointer-events-none absolute -bottom-[4.5rem] -left-6 hidden items-start gap-1 text-cobalt sm:flex" aria-hidden>
          <svg width="46" height="44" viewBox="0 0 46 44" fill="none" className="-mt-3 rotate-[200deg]">
            <path d="M3 40 C 10 18, 24 8, 42 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M34 2 L42 6 L35 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hand text-[1.45rem] leading-none">{st.tearHint}</span>
        </div>
      </motion.div>

      {/* telefono */}
      <motion.div
        className="absolute right-0 top-0 z-20 w-[56%] sm:w-[52%]"
        initial={reduce ? false : { opacity: 0, y: 80, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.6 }}
        style={{ transformPerspective: 1200 }}
      >
        <div className="phone">
          <div className="phone-screen">
            <div className="flex items-center justify-between px-4 pb-1 pt-3 text-[0.62rem] font-bold text-ink">
              <span>19:42</span>
              <span className="h-4 w-16 rounded-full bg-[#0b0f22]" />
              <span>5G</span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-1.5">
              <LogoMark size={20} />
              <span className="num inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[0.62rem] font-bold text-paper">
                <Hourglass size={9} className="text-yellow" /> 2,5
              </span>
            </div>
            <div className="px-3.5">
              <p className="display text-[1.55rem]">{st.hi}</p>
              <p className="mt-0.5 text-[0.6rem] text-muted">{st.people}</p>
              <div className="mt-2.5 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl bg-sheet text-center shadow-paper">
                {[
                  ['14', st.perfect],
                  ['3', st.active],
                  ['2,5', st.hours],
                ].map(([n, l]) => (
                  <div key={l} className="py-1.5">
                    <p className="num text-base font-extrabold leading-none" style={{ fontStretch: '72%' }}>
                      {n}
                    </p>
                    <p className="text-[0.52rem] text-muted">{l}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence mode="popLayout">
                {last ? (
                  <motion.div
                    key={last.name}
                    initial={reduce ? false : { opacity: 0, y: -18, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="ticket mt-3 shadow-paper"
                    style={{ ['--cut' as string]: '68%', ['--notch' as string]: '7px' }}
                  >
                    <div className="grid grid-cols-[68%_32%]">
                      <div className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <Avatar seed={last.seed} name={last.name} size={20} />
                          <span className="text-[0.68rem] font-bold">{last.name}</span>
                          <span className="ml-auto grid h-4 w-4 place-items-center rounded-full bg-mint text-white">
                            <Check size={10} strokeWidth={3} />
                          </span>
                        </div>
                        <p className="mt-1.5 text-[0.56rem] text-muted">{tr.t('exchanges.youGive')}</p>
                        <p className="text-[0.66rem] font-bold">{tr.skill('english')} · 1 h</p>
                        <p className="mt-1 text-[0.56rem] text-muted">{tr.t('exchanges.youGet')}</p>
                        <p className="truncate text-[0.66rem] font-bold">{tr.skill(last.skill)} · 1 h</p>
                      </div>
                      <div className="perforation flex flex-col items-center justify-center text-center">
                        <span className="text-[0.52rem] text-muted">{st.day}</span>
                        <span className="num text-xl font-extrabold leading-none" style={{ fontStretch: '72%' }}>
                          19
                        </span>
                        <span className="mt-1 rounded-full bg-mint px-1.5 text-[0.48rem] font-bold text-white">{tr.t('exchanges.status.accepted')}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" exit={{ opacity: 0 }} className="mt-3 rounded-xl border-[1.5px] border-dashed border-line-strong p-3 text-center text-[0.6rem] text-muted">
                    {st.empty}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="mt-3 text-[0.72rem] font-bold">{st.perfectSwaps}</p>
              <div className="mt-1.5 space-y-1.5">
                {tabs.slice(1, 4).map((t) => (
                  <div key={t.name} className="flex items-center gap-2 rounded-lg bg-sheet px-2 py-1.5 shadow-paper">
                    <Avatar seed={t.seed} name={t.name} size={22} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.62rem] font-bold leading-tight">
                        {t.name} <span className="font-normal text-muted">· {t.city}</span>
                      </p>
                      <p className="truncate text-[0.56rem] text-mint-ink">{tr.skill(t.skill)}</p>
                    </div>
                    <span className="inline-flex items-center gap-0.5 text-[0.56rem] font-bold">
                      <Star size={8} fill="var(--yellow)" stroke="var(--yellow-ink)" /> 4,9
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* biglietto giallo appuntato */}
      <motion.div
        className="paper absolute bottom-4 right-[42%] z-30 rotate-[5deg] bg-yellow px-4 py-3 !text-[#10162f] sm:bottom-10"
        initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: 12 }}
        animate={{ opacity: 1, scale: 1, rotate: 5 }}
        transition={{ duration: 1, ease: EASE, delay: 1.1 }}
        style={{ background: 'var(--yellow)' }}
      >
        <p className="hand text-[1.7rem] leading-none">{st.oneHour}</p>
        <p className="mt-1 text-[0.7rem] font-semibold">{st.whatever}</p>
      </motion.div>
    </div>
  )
}
