'use client'

import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { findMatches } from '@/domain/matching'
import { generateNeighbors, getPeople } from '@/domain/people'
import { FREE_RADIUS_KM, PREMIUM_RADIUS_KM } from '@/domain/plans'
import { WELCOME_HOURS } from '@/domain/timebank'
import { availBit, type Me, type Mode, type SkillLevel } from '@/domain/types'
import { LANG_LABEL, LANGS } from '@/i18n'
import { cx } from '@/lib/cx'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { AvailabilityGrid } from '@/ui/AvailabilityGrid'
import { ComuneSearch } from '@/ui/ComuneSearch'
import { Logo } from '@/ui/Logo'
import { SkillPicker } from '@/ui/SkillPicker'

const TOTAL = 5

function defaultAvail() {
  let a = 0
  for (let d = 0; d < 5; d++) a |= availBit(d, 2)
  return a | availBit(5, 0) | availBit(5, 1)
}

export function Onboarding() {
  const tr = useT()
  const reduce = useReducedMotion()
  const lang = useApp((s) => s.settings.lang)
  const setLang = useApp((s) => s.setLang)
  const enterDemo = useApp((s) => s.enterDemo)
  const complete = useApp((s) => s.completeOnboarding)

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [comuneId, setComuneId] = useState<string | null>(null)
  const [radius, setRadius] = useState(10)
  const [offers, setOffers] = useState<SkillLevel[]>([])
  const [wants, setWants] = useState<SkillLevel[]>([])
  const [avail, setAvail] = useState(defaultAvail)
  const [mode, setMode] = useState<Mode>('both')

  const draft: Me | null = comuneId
    ? {
        name: name.trim(),
        comuneId,
        radiusKm: radius,
        offers,
        wants: wants.map((w) => w.id),
        avail,
        mode,
        bio: '',
        langs: [lang],
        hue: 0,
        joined: '',
      }
    : null

  const preview = useMemo(() => {
    if (step !== TOTAL + 1 || !draft) return null
    const neighbors = generateNeighbors(draft, draft.comuneId, 'preview', 40, radius)
    const ms = findMatches(draft, [...getPeople(), ...neighbors], { center: comuneById(draft.comuneId)!, radiusKm: radius })
    return { count: ms.length, perfect: ms.filter((m) => m.kind === 'perfect').length }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const canNext =
    step === 1 ? name.trim().length >= 2 : step === 2 ? !!comuneId : step === 3 ? offers.length > 0 : step === 4 ? wants.length > 0 : step === 5 ? avail !== 0 : true

  const go = (d: number) => setStep((s) => Math.max(0, Math.min(TOTAL + 1, s + d)))

  if (step === 0) {
    return (
      <div className="min-h-dvh px-4 sm:px-8">
        <header className="mx-auto flex max-w-6xl items-center justify-between py-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex gap-1" role="group" aria-label={tr.t('profile.language')}>
            {LANGS.map((l) => (
              <button key={l} className={cx('chip !min-h-8 !text-xs', l === lang && 'on')} onClick={() => setLang(l)} aria-pressed={l === lang}>
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
        </header>
        <div className="mx-auto grid max-w-6xl items-center gap-10 pb-16 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div>
            <span className="marker text-sm font-bold">{tr.t('onboarding.welcomeKicker')}</span>
            <h1 className="display mt-4 text-[3.4rem] sm:text-[5rem]">{tr.t('onboarding.welcomeTitle')}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{tr.t('onboarding.welcomeText')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>
                {tr.t('onboarding.start')} <ArrowRight size={18} />
              </button>
              <button className="btn btn-outline btn-lg" onClick={enterDemo}>
                <Sparkles size={18} /> {tr.t('onboarding.guest')}
              </button>
            </div>
            <p className="mt-3 text-sm text-faint">{tr.t('onboarding.guestHint')}</p>
          </div>
          <WelcomeBoard />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 sm:px-6">
      <header className="flex items-center justify-between gap-4 py-4">
        <button className="btn btn-ghost btn-icon -ml-2" onClick={() => go(-1)} aria-label={tr.t('common.back')}>
          <ArrowLeft size={20} />
        </button>
        {step <= TOTAL && (
          <div className="flex flex-1 items-center gap-1.5" aria-label={tr.t('onboarding.step', { n: step, total: TOTAL })}>
            {Array.from({ length: TOTAL }, (_, i) => (
              <span key={i} className={cx('h-1.5 flex-1 rounded-full transition-colors', i < step ? 'bg-cobalt' : 'bg-well-2')} />
            ))}
          </div>
        )}
        <span className="w-10" />
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="flex-1 pb-32 pt-4"
        >
          {step === 1 && (
            <Step title={tr.t('onboarding.nameTitle')} hint={tr.t('onboarding.nameHint')}>
              <input
                className="field !min-h-14 !text-xl"
                value={name}
                autoFocus
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canNext && go(1)}
                placeholder={tr.t('onboarding.namePlaceholder')}
                aria-label={tr.t('onboarding.nameTitle')}
              />
            </Step>
          )}
          {step === 2 && (
            <Step title={tr.t('onboarding.cityTitle')} hint={tr.t('onboarding.cityHint')}>
              <ComuneSearch value={comuneId} onChange={setComuneId} autoFocus />
              <div className="mt-8">
                <label htmlFor="radius" className="flex items-baseline justify-between font-semibold">
                  {tr.t('onboarding.radius')}
                  <span className="num text-3xl font-extrabold" style={{ fontStretch: '75%' }}>
                    {radius} km
                  </span>
                </label>
                <input id="radius" type="range" min={1} max={FREE_RADIUS_KM} value={radius} onChange={(e) => setRadius(+e.target.value)} className="mt-2 w-full" />
                <p className="mt-1 text-sm text-muted">{tr.t('onboarding.radiusFree', { km: FREE_RADIUS_KM, max: PREMIUM_RADIUS_KM })}</p>
              </div>
            </Step>
          )}
          {step === 3 && (
            <Step title={tr.t('onboarding.offersTitle')} hint={tr.t('onboarding.offersHint')}>
              <SkillPicker value={offers} onChange={setOffers} withLevel exclude={new Set(wants.map((w) => w.id))} />
            </Step>
          )}
          {step === 4 && (
            <Step title={tr.t('onboarding.wantsTitle')} hint={tr.t('onboarding.wantsHint')}>
              <SkillPicker value={wants} onChange={setWants} exclude={new Set(offers.map((o) => o.id))} excludeLabel={tr.t('onboarding.alreadyOffered')} />
            </Step>
          )}
          {step === 5 && (
            <Step title={tr.t('onboarding.availTitle')} hint={tr.t('onboarding.availHint')}>
              <AvailabilityGrid value={avail} onChange={setAvail} />
              <h3 className="mt-8 text-lg">{tr.t('onboarding.modeTitle')}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['live', 'online', 'both'] as Mode[]).map((m) => (
                  <button key={m} className={cx('chip !min-h-10 !px-4', mode === m && 'on')} aria-pressed={mode === m} onClick={() => setMode(m)}>
                    {tr.m.modes[m]}
                  </button>
                ))}
              </div>
            </Step>
          )}
          {step === TOTAL + 1 && preview && draft && (
            <div className="pt-6 text-center">
              <motion.div
                initial={reduce ? false : { rotate: -8, scale: 0.8, opacity: 0 }}
                animate={{ rotate: -3, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12 }}
                className="paper mx-auto w-fit px-8 py-6"
              >
                <p className="hand text-5xl">{tr.t('common.hours', { count: WELCOME_HOURS })}</p>
                <p className="mt-1 text-sm text-muted">{tr.t('onboarding.welcomeGift', { count: WELCOME_HOURS })}</p>
              </motion.div>
              <h1 className="display mt-10 text-5xl">{tr.t('onboarding.finishTitle')}</h1>
              <p className="mx-auto mt-4 max-w-md text-lg text-muted">
                {tr.t('onboarding.finishText', { count: preview.count, km: radius, perfect: preview.perfect })}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="safe-bottom fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-sm text-muted">
            {step <= TOTAL
              ? step === 3
                ? tr.t('onboarding.selected', { count: offers.length })
                : step === 4
                  ? tr.t('onboarding.selected', { count: wants.length })
                  : tr.t('onboarding.step', { n: step, total: TOTAL })
              : ''}
          </span>
          {step <= TOTAL ? (
            <button className="btn btn-primary btn-lg" disabled={!canNext} onClick={() => go(1)}>
              {tr.t('common.continue')} <ArrowRight size={18} />
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => draft && complete({ ...draft, joined: new Date().toISOString().slice(0, 10) })}>
              {tr.t('onboarding.finish')} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="display text-[2.6rem] sm:text-[3.2rem]">{title}</h1>
      <p className="mb-6 mt-2 text-muted">{hint}</p>
      {children}
    </div>
  )
}

/** Tre volantini appesi: l'idea del prodotto senza spiegarla. */
function WelcomeBoard() {
  const tr = useT()
  const flyers = [
    { title: tr.skill('english'), tabs: ['Marta', 'Luca', 'Wei'], rot: -3, pin: 'var(--coral)', y: 0 },
    { title: tr.skill('pc-repair'), tabs: ['Giorgio', 'Sara', 'Ivan'], rot: 2.5, pin: 'var(--cobalt)', y: 40 },
    { title: tr.skill('fresh-pasta'), tabs: ['Anna', 'Olena', 'Dario'], rot: -1.5, pin: 'var(--mint)', y: 10 },
  ]
  return (
    <div className="relative mx-auto grid w-full max-w-md grid-cols-3 gap-3" aria-hidden>
      {flyers.map((f, i) => (
        <div key={i} style={{ transform: `rotate(${f.rot}deg) translateY(${f.y}px)` }}>
          <div className="flyer px-3 pb-6 pt-6">
            <span className="flyer-pin" style={{ ['--pin' as string]: f.pin }} />
            <p className="hand text-[1.45rem] leading-none">{f.title}</p>
            <div className="mt-3 space-y-1.5">
              <div className="h-1.5 w-full rounded bg-well-2" />
              <div className="h-1.5 w-3/4 rounded bg-well-2" />
            </div>
          </div>
          <div className="tabs-row">
            {f.tabs.map((t, j) => (
              <span key={t} className={cx('tear-tab !max-h-20', i === 1 && j === 1 && 'hit')}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
