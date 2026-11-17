'use client'

import { Crown, Gift, Hourglass, Send, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { skillById } from '@/content/skills'
import { modesCompatible } from '@/domain/matching'
import { limitsFor } from '@/domain/plans'
import { slotOptions } from '@/domain/slots'
import { balance, exchangeDelta } from '@/domain/timebank'
import type { Person } from '@/domain/types'
import { skillPhrase } from '@/i18n/compose'
import { cx } from '@/lib/cx'
import { proposalsThisMonth, type ProposeResult, TRIAL_MINUTES, trialUsed, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { SkillIcon } from '@/ui/Icon'
import { Sheet } from '@/ui/Sheet'
import { ScrollRow } from '@/ui/ScrollRow'
import { toast } from '@/ui/Toaster'

const DURATIONS = [1, 1.5, 2]

/** Proposta di scambio: cosa do, cosa ricevo, quanto, quando, dove e un messaggio. */
export function ProposeSheet({ person, open, onClose, initialGet }: { person: Person; open: boolean; onClose(): void; initialGet?: string }) {
  const tr = useT()
  const router = useRouter()
  const me = useApp((s) => s.me)!
  const plan = useApp((s) => s.plan)
  const ledger = useApp((s) => s.ledger)
  const exchanges = useApp((s) => s.exchanges)
  const propose = useApp((s) => s.propose)

  const theyWant = useMemo(() => new Set(person.wants), [person])
  const iWant = useMemo(() => new Set(me.wants), [me])
  const myOffers = useMemo(() => [...me.offers].sort((a, b) => Number(theyWant.has(b.id)) - Number(theyWant.has(a.id))), [me, theyWant])
  const theirOffers = useMemo(() => [...person.offers].sort((a, b) => Number(iWant.has(b.id)) - Number(iWant.has(a.id))), [person, iWant])

  const [give, setGive] = useState<string | null>(null)
  const [get, setGet] = useState<string | null>(null)
  const [hours, setHours] = useState(1)
  const [trial, setTrial] = useState(false)
  const [slots, setSlots] = useState<string[]>([])
  const [mode, setMode] = useState<'live' | 'online'>('live')
  const [note, setNote] = useState('')
  const [touchedNote, setTouchedNote] = useState(false)
  const [error, setError] = useState<ProposeResult | 'skill' | 'slot' | null>(null)

  useEffect(() => {
    if (!open) return
    const g = myOffers.find((o) => theyWant.has(o.id))?.id ?? myOffers[0]?.id ?? null
    const r = initialGet ?? theirOffers.find((o) => iWant.has(o.id))?.id ?? null
    setGive(r && !theyWant.size ? null : g)
    setGet(r)
    setSlots([])
    setTrial(false)
    setError(null)
    setTouchedNote(false)
    setMode(person.mode === 'online' || me.mode === 'online' ? 'online' : 'live')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // messaggio precompilato finché l'utente non lo modifica
  useEffect(() => {
    if (touchedNote) return
    const vars = { name: person.first, give: give ? skillPhrase(tr, give) : '', get: get ? skillPhrase(tr, get) : '' }
    setNote(trial && get ? tr.t('propose.defaultMessageTrial', vars) : give && get ? tr.t('propose.defaultMessage', vars) : give ? tr.t('propose.defaultMessageGift', vars) : get ? tr.t('propose.defaultMessageHours', vars) : '')
  }, [give, get, person, tr, touchedNote, trial])

  const options = useMemo(() => slotOptions(me.avail, person.avail, new Date(), 14), [me, person])
  const shown = options.filter((o) => o.shared).length >= 3 ? options.filter((o) => o.shared) : options
  // durante la prova non insegno nulla: conta solo la competenza che imparo
  const onlineOk =
    (trial || !give || !!skillById(give)?.online) && (!get || !!skillById(get)?.online) && me.mode !== 'live' && person.mode !== 'live'
  const liveOk = modesCompatible(me.mode, person.mode) && person.mode !== 'online' && me.mode !== 'online'
  // prova: serve qualcosa da imparare che si possa fare in videochiamata, ed entrambi devono accettarla
  const trialOk = !!get && !!skillById(get)?.online && me.mode !== 'live' && person.mode !== 'live' && !trialUsed(exchanges, person.id)
  useEffect(() => {
    if (trial && !trialOk) setTrial(false)
  }, [trial, trialOk])
  useEffect(() => {
    if (trial) setMode('online')
  }, [trial])
  // se la modalità scelta non è più possibile, passa all'altra
  useEffect(() => {
    if (mode === 'online' && !onlineOk && liveOk) setMode('live')
    if (mode === 'live' && !liveOk && onlineOk) setMode('online')
  }, [mode, onlineOk, liveOk])

  const from = balance(ledger)
  const delta = trial ? 0 : exchangeDelta(give ? hours : 0, get ? hours : 0)
  const limits = limitsFor(plan)
  const used = proposalsThisMonth(exchanges)
  const remaining = limits.proposalsPerMonth === null ? null : Math.max(0, limits.proposalsPerMonth - used)

  const send = () => {
    if (!give && !get) return setError('skill')
    if (!slots.length) return setError('slot')
    const r = propose({ personId: person.id, give: trial ? null : give, get, hours, slots, mode: trial ? 'online' : mode, note, trial })
    if (r.result !== 'ok') return setError(r.result)
    toast({ text: tr.t('propose.sent', { name: person.first }), tone: 'ok', icon: <Send size={18} /> })
    onClose()
    router.push(`/app/scambio/?id=${r.id}`)
  }

  const errorText =
    error === 'skill'
      ? tr.t('propose.pickSkill')
      : error === 'slot'
        ? tr.t('propose.pickSlot')
        : error === 'monthly-limit'
          ? tr.t('propose.limitMonthly', { n: limits.proposalsPerMonth ?? 0 })
          : error === 'active-limit'
            ? tr.t('propose.limitActive', { n: limits.activeExchanges ?? 0 })
            : error === 'balance'
              ? tr.t('propose.limitBalance')
              : error === 'trial-used'
                ? tr.t('propose.trialUsed', { name: person.first })
                : null

  return (
    <Sheet
      open={open}
      onClose={onClose}
      wide
      title={tr.t('propose.title', { name: person.first })}
      closeLabel={tr.t('common.close')}
      footer={
        <div className="pb-2">
          {errorText && (
            <div role="alert" className="mb-3 rounded-xl bg-coral/12 px-3 py-2 text-sm font-medium text-coral-ink">
              {errorText}
              {(error === 'monthly-limit' || error === 'active-limit') && (
                <Link href="/app/premium/" className="mt-1 flex items-center gap-1 font-bold text-ink underline" onClick={onClose}>
                  <Crown size={14} /> {tr.t('propose.upgrade')}
                </Link>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {trial ? tr.t('propose.trialFree') : delta === 0 ? tr.t('propose.balanceEven') : tr.t('propose.balanceEffect', { from: tr.num(from), to: tr.num(from + delta) })}
              {remaining !== null && (
                <>
                  <br />
                  {tr.t('propose.remaining', { count: remaining })}
                </>
              )}
            </p>
            <button className="btn btn-primary btn-lg shrink-0" onClick={send}>
              <Send size={17} /> {tr.t('propose.send')}
            </button>
          </div>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <fieldset disabled={trial} className={cx(trial && 'opacity-40')}>
          <legend className="mb-2 font-bold">{tr.t('propose.give')}</legend>
          <div className="flex flex-wrap gap-1.5">
            {myOffers.map((o) => (
              <button key={o.id} type="button" className={cx('chip', give === o.id && 'on', give !== o.id && theyWant.has(o.id) && '!bg-mint-soft !text-mint-ink')} aria-pressed={give === o.id} onClick={() => setGive(o.id)}>
                <SkillIcon id={o.id} size={15} />
                {tr.skill(o.id)}
              </button>
            ))}
            <button type="button" className={cx('chip', give === null && 'on')} aria-pressed={give === null} onClick={() => setGive(null)}>
              <Hourglass size={14} /> {tr.t('propose.nothingGive')}
            </button>
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-bold">{tr.t('propose.get')}</legend>
          <div className="flex flex-wrap gap-1.5">
            {theirOffers.map((o) => (
              <button key={o.id} type="button" className={cx('chip', get === o.id && 'on', get !== o.id && iWant.has(o.id) && '!bg-mint-soft !text-mint-ink')} aria-pressed={get === o.id} onClick={() => setGet(o.id)}>
                <SkillIcon id={o.id} size={15} />
                {tr.skill(o.id)}
              </button>
            ))}
            <button type="button" className={cx('chip', get === null && 'on')} aria-pressed={get === null} onClick={() => setGet(null)}>
              <Gift size={14} /> {tr.t('propose.nothingGet')}
            </button>
          </div>
        </fieldset>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 font-bold">{tr.t('propose.duration')}</legend>
          <div className="flex flex-wrap gap-1.5">
            {DURATIONS.map((h) => (
              <button key={h} type="button" className={cx('chip !min-h-10 !px-4', !trial && hours === h && 'on')} aria-pressed={!trial && hours === h} onClick={() => { setTrial(false); setHours(h) }}>
                {tr.t('common.hoursShort', { count: tr.num(h) })}
              </button>
            ))}
            <button type="button" disabled={!trialOk} className={cx('chip !min-h-10 !px-4', trial && 'on', !trialOk && 'opacity-40')} aria-pressed={trial} onClick={() => setTrial(true)}>
              <Sparkles size={14} /> {tr.t('propose.trial', { min: TRIAL_MINUTES })}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted">{trialOk || trial ? tr.t('propose.trialHint', { min: TRIAL_MINUTES }) : tr.t('propose.trialUnavailable')}</p>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-bold">{tr.t('propose.mode')}</legend>
          <div className="flex gap-1.5">
            <button type="button" disabled={!liveOk || trial} className={cx('chip !min-h-10 !px-4', mode === 'live' && 'on', !liveOk && 'opacity-40')} aria-pressed={mode === 'live'} onClick={() => setMode('live')}>
              {tr.m.modes.live}
            </button>
            <button type="button" disabled={!onlineOk} className={cx('chip !min-h-10 !px-4', mode === 'online' && 'on', !onlineOk && 'opacity-40')} aria-pressed={mode === 'online'} onClick={() => setMode('online')}>
              {tr.m.modes.online}
            </button>
          </div>
        </fieldset>
      </div>

      <fieldset className="mt-6">
        <legend className="font-bold">{tr.t('propose.slots')}</legend>
        <p className="mb-2 text-sm text-muted">{tr.t('propose.slotsHint')}</p>
        <ScrollRow innerClassName="gap-1.5 pb-1">
          {shown.slice(0, 18).map((o) => {
            const on = slots.includes(o.iso)
            return (
              <button
                key={o.iso}
                type="button"
                aria-pressed={on}
                onClick={() => setSlots(on ? slots.filter((s) => s !== o.iso) : slots.length < 3 ? [...slots, o.iso] : slots)}
                className={cx(
                  'shrink-0 rounded-xl border-[1.5px] px-3 py-2 text-left text-sm leading-tight transition-colors',
                  on ? 'border-ink bg-ink text-paper' : o.shared ? 'border-mint bg-mint-soft text-mint-ink' : 'border-line-strong',
                )}
              >
                <span className="block font-bold">{new Date(o.iso).toLocaleDateString(tr.locale, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="block opacity-80">
                  {tr.m.slots[(['morning', 'afternoon', 'evening'] as const)[o.slot]]} · {new Date(o.iso).toLocaleTimeString(tr.locale, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            )
          })}
        </ScrollRow>
      </fieldset>

      <label className="mt-6 block">
        <span className="mb-2 block font-bold">{tr.t('propose.message')}</span>
        <textarea
          className="field"
          value={note}
          maxLength={500}
          onChange={(e) => {
            setTouchedNote(true)
            setNote(e.target.value)
          }}
          placeholder={tr.t('propose.messagePlaceholder', { name: person.first })}
        />
      </label>
    </Sheet>
  )
}
