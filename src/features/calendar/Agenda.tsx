'use client'

import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { buildIcs, weekday } from '@/domain/slots'
import { downloadText } from '@/lib/download'
import { cx } from '@/lib/cx'
import { findPerson, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { appointments } from '@/store/selectors'
import { Empty, Section } from '@/ui/bits'
import { ExchangeTicket } from '../exchanges/ExchangeTicket'
import { icsEvent } from '../exchanges/ExchangeDetail'

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function Agenda() {
  const tr = useT()
  const state = useApp()
  const list = appointments(state)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [picked, setPicked] = useState<string | null>(null)
  const now = new Date()
  const today = dayKey(now)
  const byDay = useMemo(() => {
    const m = new Map<string, typeof list>()
    for (const e of list) {
      const k = e.slot!.slice(0, 10)
      m.set(k, [...(m.get(k) ?? []), e])
    }
    return m
  }, [list])

  const upcoming = list.filter((e) => e.status === 'accepted' && e.slot!.slice(0, 10) >= today)
  const past = list.filter((e) => !(e.status === 'accepted' && e.slot!.slice(0, 10) >= today)).reverse()
  const dayList = picked ? byDay.get(picked) ?? [] : null

  const first = weekday(month)
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))]

  const exportAll = () => {
    const city = state.me ? comuneById(state.me.comuneId)?.name : undefined
    const events = upcoming.map((e) => icsEvent(e, findPerson(state.neighbors, e.personId)?.first ?? '', tr, city))
    downloadText('baratto-skill-agenda.ics', buildIcs(events), 'text/calendar')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('calendar.title')}</h1>
        <button className="btn btn-outline btn-sm" onClick={exportAll} disabled={!upcoming.length}>
          <Download size={16} /> {tr.t('calendar.exportAll')}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="sheet h-fit p-4">
          <div className="mb-3 flex items-center justify-between">
            <button className="btn btn-ghost btn-icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="←">
              <ChevronLeft size={18} />
            </button>
            <p className="font-bold capitalize">{month.toLocaleDateString(tr.locale, { month: 'long', year: 'numeric' })}</p>
            <button className="btn btn-ghost btn-icon" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="→">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
            {tr.m.days.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />
              const k = dayKey(d)
              const evs = byDay.get(k) ?? []
              return (
                <button
                  key={k}
                  onClick={() => setPicked(picked === k ? null : k)}
                  aria-pressed={picked === k}
                  aria-label={`${tr.date(d)}${evs.length ? ` · ${evs.length}` : ''}`}
                  className={cx(
                    'relative aspect-square rounded-lg text-sm font-semibold transition-colors',
                    picked === k ? 'bg-ink text-paper' : k === today ? 'bg-yellow text-[#10162f]' : 'hover:bg-well',
                    k < today && picked !== k && 'text-faint',
                  )}
                >
                  {d.getDate()}
                  {evs.length > 0 && (
                    <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {evs.slice(0, 3).map((e) => (
                        <span key={e.id} className={cx('h-1.5 w-1.5 rounded-full', e.status === 'completed' ? 'bg-faint' : 'bg-mint')} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          {dayList ? (
            <Section title={tr.date(picked!, { weekday: 'long', day: 'numeric', month: 'long' })} className="!mt-0">
              {dayList.length ? (
                <div className="space-y-3">{dayList.map((e) => <ExchangeTicket key={e.id} ex={e} />)}</div>
              ) : (
                <Empty>{tr.t('calendar.empty')}</Empty>
              )}
            </Section>
          ) : (
            <>
              <Section title={tr.t('calendar.upcoming')} className="!mt-0">
                {upcoming.length ? <div className="space-y-3">{upcoming.map((e) => <ExchangeTicket key={e.id} ex={e} />)}</div> : <Empty>{tr.t('calendar.empty')}</Empty>}
              </Section>
              {past.length > 0 && (
                <Section title={tr.t('calendar.past')}>
                  <div className="space-y-3 opacity-80">{past.map((e) => <ExchangeTicket key={e.id} ex={e} />)}</div>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
