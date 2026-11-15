'use client'

import { ArrowLeft, CalendarPlus, Check, CheckCheck, MessageCircle, Star, Video, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { comuneById } from '@/content/comuni'
import { fullName, shortName } from '@/domain/people'
import { buildIcs } from '@/domain/slots'
import { downloadText } from '@/lib/download'
import { useVideo } from '@/providers/video'
import { type Exchange, useApp } from '@/store/app'
import { useNow, useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'
import { Empty, Stars } from '@/ui/bits'
import { toast } from '@/ui/Toaster'
import { usePerson } from '../people/useMatches'
import { ExchangeTicket } from './ExchangeTicket'
import { IncomingActions } from './IncomingActions'
import { ReviewSheet } from './ReviewSheet'

export function ExchangeDetail() {
  const tr = useT()
  const id = useSearchParams().get('id')
  const ex = useApp((s) => s.exchanges.find((e) => e.id === id))
  const p = usePerson(ex?.personId ?? null)
  const me = useApp((s) => s.me)!
  const { acceptCounter, cancel, complete } = useApp.getState()
  const { startCall } = useVideo()
  const [reviewOpen, setReviewOpen] = useState(false)
  const now = useNow(1000)

  if (!ex || !p) return <Empty>{tr.t('exchanges.notFound')}</Empty>

  const ics = () => {
    if (!ex.slot) return
    const body = buildIcs([icsEvent(ex, p.first, tr, comuneById(me.comuneId)?.name)])
    downloadText(`baratto-skill-${ex.id}.ics`, body, 'text/calendar')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/scambi/" className="btn btn-ghost btn-sm -ml-3">
        <ArrowLeft size={16} /> {tr.t('exchanges.title')}
      </Link>
      <h1 className="display mt-2 text-[2.4rem]">{tr.t('exchanges.detail')}</h1>

      <div className="mt-5">
        <ExchangeTicket ex={ex} actions={ex.direction === 'in' && ex.status === 'pending' ? <IncomingActions ex={ex} /> : undefined} />
      </div>

      {ex.status === 'pending' && ex.direction === 'out' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          {tr.t('exchanges.waiting', { name: p.first, time: tr.duration(p.replyMins) })}
          {ex.replyAt && ex.replyAt > now && <span className="num text-faint">({Math.ceil((ex.replyAt - now) / 1000)}s)</span>}
        </p>
      )}

      {ex.status === 'countered' && ex.slot && (
        <div className="mt-4 rounded-2xl bg-yellow/30 p-4">
          <p className="font-semibold">{tr.t('chat.system.countered', { when: tr.slot(ex.slot) })}</p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-mint btn-sm" onClick={() => acceptCounter(ex.id)}>
              <Check size={16} /> {tr.t('exchanges.acceptCounter')}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => cancel(ex.id)}>
              <X size={16} /> {tr.t('exchanges.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/app/chat/?id=${p.id}`} className="btn btn-outline btn-sm">
          <MessageCircle size={16} /> {tr.t('exchanges.chat')}
        </Link>
        {ex.status === 'accepted' && ex.mode === 'online' && (
          <button className="btn btn-outline btn-sm" onClick={() => startCall({ id: p.id, name: fullName(p) })}>
            <Video size={16} /> {tr.t('exchanges.call')}
          </button>
        )}
        {ex.status === 'accepted' && ex.slot && (
          <button className="btn btn-outline btn-sm" onClick={ics}>
            <CalendarPlus size={16} /> {tr.t('exchanges.ics')}
          </button>
        )}
        {ex.status === 'accepted' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              complete(ex.id)
              toast({ text: tr.t('exchanges.doneToast'), tone: 'ok', icon: <CheckCheck size={18} /> })
            }}
          >
            <CheckCheck size={16} /> {tr.t('exchanges.markDone')}
          </button>
        )}
        {ex.status === 'completed' && !ex.myReview && (
          <button className="btn btn-yellow btn-sm" onClick={() => setReviewOpen(true)}>
            <Star size={16} /> {tr.t('exchanges.review')}
          </button>
        )}
        {(ex.status === 'pending' || ex.status === 'accepted') && ex.direction === 'out' && (
          <button className="btn btn-danger btn-sm" onClick={() => cancel(ex.id)}>
            <X size={16} /> {tr.t('exchanges.cancel')}
          </button>
        )}
      </div>

      {(ex.theirReview || ex.myReview) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {ex.theirReview && (
            <figure className="paper p-4">
              <figcaption className="flex items-center gap-2 text-sm font-semibold">
                <Avatar seed={p.id} name={fullName(p)} size={28} />
                {tr.t('exchanges.theirReview', { name: p.first })}
              </figcaption>
              <Stars value={ex.theirReview.stars} className="mt-2" />
              <blockquote className="hand mt-1 text-[1.35rem] leading-tight">{ex.theirReview.text}</blockquote>
            </figure>
          )}
          {ex.myReview && (
            <figure className="paper p-4">
              <figcaption className="flex items-center gap-2 text-sm font-semibold">
                <Avatar seed={`me-${me.name}`} name={me.name} size={28} />
                {tr.t('exchanges.reviewed')}
              </figcaption>
              <Stars value={ex.myReview.stars} className="mt-2" />
              {ex.myReview.text && <blockquote className="hand mt-1 text-[1.35rem] leading-tight">{ex.myReview.text}</blockquote>}
              {ex.myReview.tags.length > 0 && <p className="mt-2 text-xs text-muted">{ex.myReview.tags.join(' · ')}</p>}
            </figure>
          )}
        </div>
      )}

      <Link href={`/app/persona/?id=${p.id}`} className="mt-8 flex items-center gap-3 rounded-2xl bg-sheet p-4 shadow-paper hover:bg-well">
        <Avatar seed={p.id} name={fullName(p)} size={44} />
        <span className="flex-1">
          <span className="block font-bold">{shortName(p)}</span>
          <span className="block text-sm text-muted">{comuneById(p.comuneId)?.name}</span>
        </span>
        <span className="text-sm font-semibold text-cobalt">{tr.t('common.seeAll')}</span>
      </Link>

      <ReviewSheet exchangeId={ex.id} name={p.first} open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </div>
  )
}

export function icsEvent(ex: Exchange, name: string, tr: ReturnType<typeof useT>, place?: string) {
  const parts = [ex.give && tr.t('calendar.teach', { skill: tr.skill(ex.give) }), ex.get && tr.t('calendar.learn', { skill: tr.skill(ex.get) })].filter(Boolean)
  return {
    uid: ex.id,
    start: ex.slot!,
    minutes: Math.max(ex.giveHours, ex.getHours, 1) * 60 * (ex.give && ex.get ? 2 : 1),
    title: `Baratto Skill · ${name}`,
    description: parts.join(' / '),
    location: ex.mode === 'online' ? tr.m.modes.online : place,
  }
}
