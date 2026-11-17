'use client'

import { CalendarDays, Crown, MapPin, Plus, Users, Video } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { SKILLS } from '@/content/skills'
import { shortName } from '@/domain/people'
import { isPremium, limitsFor } from '@/domain/plans'
import { balance } from '@/domain/timebank'
import {
  hostEarnings,
  simulatedSignups,
  suggestWorkshops,
  WORKSHOP_CAPACITIES,
  WORKSHOP_MINUTES,
  type Workshop,
  workshopCost,
} from '@/domain/workshops'
import { cx } from '@/lib/cx'
import { findPerson, type HostWorkshopInput, type MyWorkshop, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'
import { Empty, Section } from '@/ui/bits'
import { SkillIcon } from '@/ui/Icon'
import { Sheet } from '@/ui/Sheet'
import { toast } from '@/ui/Toaster'
import { usePeople } from '../people/useMatches'

/** Workshop di gruppo: partecipa pagando in ore, oppure (Premium) organizzane uno e incassa le ore di tutti. */
export function Workshops() {
  const tr = useT()
  const me = useApp((s) => s.me)!
  const plan = useApp((s) => s.plan)
  const ledger = useApp((s) => s.ledger)
  const mine = useApp((s) => s.workshops)
  const join = useApp((s) => s.joinWorkshop)
  const leave = useApp((s) => s.leaveWorkshop)
  const finish = useApp((s) => s.completeWorkshop)
  const neighbors = useApp((s) => s.neighbors)
  const people = usePeople()
  const city = comuneById(me.comuneId)!
  const [creating, setCreating] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  // aggiorna gli iscritti simulati ai miei workshop
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const suggested = useMemo(() => suggestWorkshops(people, city, me.radiusKm, me.mode, new Date(), 10), [people, city, me.radiusKm, me.mode])
  const booked = mine.filter((w) => w.status === 'booked')
  const bookedIds = new Set(booked.map((w) => w.ws.id))
  const past = mine.filter((w) => w.status === 'done')
  const canHost = limitsFor(plan).hostWorkshops
  const hours = balance(ledger)

  const onJoin = (ws: Workshop) => {
    const r = join(ws)
    if (r === 'ok') toast({ text: tr.t('workshops.joined', { skill: tr.skill(ws.skill), h: tr.num(ws.costHours) }), tone: 'ok', icon: <Users size={18} /> })
    else toast({ text: tr.t(`workshops.err_${r}`), tone: 'warn' })
  }

  const onFinish = (w: MyWorkshop) => {
    const earned = finish(w.ws.id)
    toast({ text: earned ? tr.t('workshops.earned', { h: tr.num(earned) }) : tr.t('workshops.done'), tone: 'ok' })
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('workshops.title')}</h1>
          <p className="mt-1 max-w-2xl text-muted">{tr.t('workshops.sub')}</p>
        </div>
        {canHost ? (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <Plus size={17} /> {tr.t('workshops.host')}
          </button>
        ) : (
          <Link href="/app/premium/" className="btn btn-outline">
            <Crown size={16} className="text-yellow-ink" /> {tr.t('workshops.hostLocked')}
          </Link>
        )}
      </div>

      {booked.length > 0 && (
        <Section title={tr.t('workshops.mine')}>
          <div className="grid gap-3 md:grid-cols-2">
            {booked.map((w) => {
              const signups = w.role === 'host' ? simulatedSignups(w.ws.id, w.ws.capacity, w.createdAt, now) : w.ws.taken
              return (
                <WorkshopCard key={w.ws.id} ws={{ ...w.ws, taken: signups }} host={w.role === 'host' ? null : findPerson(neighbors, w.ws.hostId)} me={me.name}>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold', w.role === 'host' ? 'bg-yellow text-[#10162f]' : 'bg-mint-soft text-mint-ink')}>
                      {w.role === 'host' ? tr.t('workshops.youHost', { count: signups }) : tr.t('workshops.youJoined')}
                    </span>
                    {w.role === 'host' && <span className="text-xs text-muted">{tr.t('workshops.willEarn', { h: tr.num(hostEarnings(w.ws, signups)) })}</span>}
                    <span className="flex-1" />
                    <button className="btn btn-ghost btn-sm" onClick={() => leave(w.ws.id)}>{tr.t('workshops.cancel')}</button>
                    <button className="btn btn-outline btn-sm" onClick={() => onFinish(w)}>{tr.t('workshops.markDone')}</button>
                  </div>
                </WorkshopCard>
              )
            })}
          </div>
        </Section>
      )}

      <Section title={tr.t('workshops.upcoming')}>
        <p className="-mt-1 mb-4 text-sm text-muted">{tr.t('workshops.balance', { h: tr.num(hours) })}</p>
        {suggested.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {suggested.map((base) => {
              const host = findPerson(neighbors, base.hostId)
              const already = bookedIds.has(base.id)
              // il mio posto conta tra quelli presi
              const ws = already ? { ...base, taken: base.taken + 1 } : base
              const full = ws.taken >= ws.capacity
              return (
                <WorkshopCard key={ws.id} ws={ws} host={host} me={me.name}>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{tr.t('workshops.cost', { h: tr.num(ws.costHours) })}</span>
                    <button className="btn btn-primary btn-sm" disabled={full || already} onClick={() => onJoin(base)}>
                      {already ? tr.t('workshops.youJoined') : full ? tr.t('workshops.full') : tr.t('workshops.join')}
                    </button>
                  </div>
                </WorkshopCard>
              )
            })}
          </div>
        ) : (
          <Empty>{tr.t('workshops.empty')}</Empty>
        )}
      </Section>

      {past.length > 0 && (
        <Section title={tr.t('workshops.past')}>
          <ul className="divide-y divide-line">
            {past.map((w) => (
              <li key={w.ws.id} className="flex items-center gap-3 py-3 text-sm">
                <SkillIcon id={w.ws.skill} size={18} className="text-cobalt" />
                <span className="flex-1 font-medium">{tr.skill(w.ws.skill)}</span>
                <span className="text-muted">{tr.date(w.ws.at, { day: 'numeric', month: 'short' })}</span>
                {w.participants ? <span className="font-bold text-mint-ink">+{tr.num(hostEarnings(w.ws, w.participants))} h</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <HostSheet open={creating} onClose={() => setCreating(false)} premium={isPremium(plan)} />
    </div>
  )
}

function WorkshopCard({ ws, host, me, children }: { ws: Workshop; host: { id: string; first: string; last: string } | null | undefined; me: string; children: React.ReactNode }) {
  const tr = useT()
  const place = comuneById(ws.comuneId)
  const pct = Math.min(100, (ws.taken / ws.capacity) * 100)
  return (
    <article className="sheet p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cobalt-soft text-cobalt">
          <SkillIcon id={ws.skill} size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.05rem] font-bold">{tr.skill(ws.skill)}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            {host ? (
              <Link href={`/app/persona/?id=${host.id}`} className="inline-flex items-center gap-1.5 hover:underline">
                <Avatar seed={host.id} name={`${host.first} ${host.last}`} size={20} /> {shortName(host)}
              </Link>
            ) : (
              <>
                <Avatar seed={`me-${me}`} name={me} size={20} /> {tr.t('common.you')}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} className="text-muted" />
          {tr.date(ws.at, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {ws.minutes} min
        </span>
        <span className="inline-flex items-center gap-1.5">
          {ws.mode === 'online' ? <Video size={14} className="text-muted" /> : <MapPin size={14} className="text-muted" />}
          {ws.mode === 'online' ? tr.m.modes.online : place?.name}
        </span>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-xs text-muted">
          <span>{tr.t('workshops.seats', { taken: ws.taken, capacity: ws.capacity })}</span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-well">
          <div className="h-full rounded-full bg-mint" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {children}
    </article>
  )
}

/** Organizza un workshop (Premium): competenza, data, durata, posti, dove. */
function HostSheet({ open, onClose, premium }: { open: boolean; onClose(): void; premium: boolean }) {
  const tr = useT()
  const me = useApp((s) => s.me)!
  const host = useApp((s) => s.hostWorkshop)
  const myOffers = me.offers.map((o) => o.id)
  const [skill, setSkill] = useState(myOffers[0] ?? '')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:30')
  const [minutes, setMinutes] = useState<HostWorkshopInput['minutes']>(90)
  const [capacity, setCapacity] = useState(6)
  const canOnline = me.mode !== 'live' && !!SKILLS.find((s) => s.id === skill)?.online
  const [mode, setMode] = useState<'live' | 'online'>(me.mode === 'online' ? 'online' : 'live')
  const effectiveMode = mode === 'online' && !canOnline ? 'live' : me.mode === 'online' ? 'online' : mode
  const today = new Date()
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toLocaleDateString('sv-SE')

  const submit = () => {
    if (!skill || !date) return toast({ text: tr.t('workshops.fillAll'), tone: 'warn' })
    const r = host({ skill, at: `${date}T${time}`, minutes, mode: effectiveMode, capacity })
    if (r !== 'ok') return toast({ text: tr.t('workshops.hostLocked'), tone: 'warn' })
    toast({ text: tr.t('workshops.published'), tone: 'ok', icon: <Users size={18} /> })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tr.t('workshops.host')}
      closeLabel={tr.t('common.close')}
      footer={
        <div className="flex items-center justify-between gap-3 pb-2">
          <p className="text-xs text-muted">{tr.t('workshops.hostNote', { h: tr.num(workshopCost(minutes)), max: tr.num(workshopCost(minutes) * capacity) })}</p>
          <button className="btn btn-primary btn-lg shrink-0" onClick={submit} disabled={!premium}>{tr.t('workshops.publish')}</button>
        </div>
      }
    >
      <fieldset>
        <legend className="mb-2 font-bold">{tr.t('workshops.whatTeach')}</legend>
        <div className="flex flex-wrap gap-1.5">
          {myOffers.map((id) => (
            <button key={id} type="button" className={cx('chip', skill === id && 'on')} aria-pressed={skill === id} onClick={() => setSkill(id)}>
              <SkillIcon id={id} size={15} /> {tr.skill(id)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-bold">{tr.t('workshops.date')}</span>
          <input type="date" className="field" min={min} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-bold">{tr.t('workshops.time')}</span>
          <input type="time" className="field" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="mb-2 font-bold">{tr.t('propose.duration')}</legend>
        <div className="flex gap-1.5">
          {WORKSHOP_MINUTES.map((m) => (
            <button key={m} type="button" className={cx('chip !min-h-10 !px-4', minutes === m && 'on')} aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
              {m} min
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="mb-2 font-bold">{tr.t('workshops.capacity')}</legend>
        <div className="flex gap-1.5">
          {WORKSHOP_CAPACITIES.map((c) => (
            <button key={c} type="button" className={cx('chip !min-h-10 !px-4', capacity === c && 'on')} aria-pressed={capacity === c} onClick={() => setCapacity(c)}>
              {c}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-5">
        <legend className="mb-2 font-bold">{tr.t('propose.mode')}</legend>
        <div className="flex gap-1.5">
          <button type="button" disabled={me.mode === 'online'} className={cx('chip !min-h-10 !px-4', effectiveMode === 'live' && 'on', me.mode === 'online' && 'opacity-40')} onClick={() => setMode('live')}>
            {tr.m.modes.live}
          </button>
          <button type="button" disabled={!canOnline} className={cx('chip !min-h-10 !px-4', effectiveMode === 'online' && 'on', !canOnline && 'opacity-40')} onClick={() => setMode('online')}>
            {tr.m.modes.online}
          </button>
        </div>
      </fieldset>
    </Sheet>
  )
}
