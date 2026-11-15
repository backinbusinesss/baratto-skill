'use client'

import { ArrowLeft, Info, Send, Video } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { fullName, shortName } from '@/domain/people'
import type { MessageKey } from '@/i18n'
import { cx } from '@/lib/cx'
import { useVideo } from '@/providers/video'
import { type ChatMessage, findPerson, isTyping, useApp } from '@/store/app'
import { useNow, useT } from '@/store/hooks'
import { Avatar } from '@/ui/Avatar'
import { Empty } from '@/ui/bits'
import { usePerson } from '../people/useMatches'

export function Chat() {
  const id = useSearchParams().get('id')
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className={cx(id && 'hidden lg:block')}>
        <ThreadList active={id} />
      </div>
      <div className={cx(!id && 'hidden lg:block')}>{id ? <Conversation personId={id} /> : <DesktopPlaceholder />}</div>
    </div>
  )
}

function DesktopPlaceholder() {
  const tr = useT()
  return (
    <div className="grid h-[60vh] place-items-center rounded-2xl border-[1.5px] border-dashed border-line-strong text-muted">
      <p className="hand text-3xl">{tr.t('chat.title')}</p>
    </div>
  )
}

function ThreadList({ active }: { active: string | null }) {
  const tr = useT()
  const threads = useApp((s) => s.threads)
  const unread = useApp((s) => s.unread)
  const neighbors = useApp((s) => s.neighbors)
  const items = useMemo(
    () =>
      Object.entries(threads)
        .map(([pid, msgs]) => ({ p: findPerson(neighbors, pid), last: msgs.at(-1) }))
        .filter((x) => x.p && x.last)
        .sort((a, b) => b.last!.at.localeCompare(a.last!.at)),
    [threads, neighbors],
  )
  return (
    <div>
      <h1 className="display text-[2.7rem] sm:text-[3.4rem]">{tr.t('chat.title')}</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
        <Info size={14} /> {tr.t('chat.demoNote')}
      </p>
      {items.length === 0 ? (
        <div className="mt-6">
          <Empty>{tr.t('chat.empty')}</Empty>
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {items.map(({ p, last }) => (
            <li key={p!.id}>
              <Link href={`/app/chat/?id=${p!.id}`} className={cx('-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-well', active === p!.id && 'bg-well')}>
                <Avatar seed={p!.id} name={fullName(p!)} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-bold">{shortName(p!)}</span>
                    <span className="shrink-0 text-xs text-faint">{when(last!.at, tr)}</span>
                  </span>
                  <span className={cx('block truncate text-sm', unread[p!.id] ? 'font-semibold text-ink' : 'text-muted')}>
                    {preview(last!, tr)}
                  </span>
                </span>
                {!!unread[p!.id] && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.7rem] font-bold text-white">{unread[p!.id]}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function preview(m: ChatMessage, tr: ReturnType<typeof useT>) {
  if (m.from === 'system') return tr.t(`chat.system.${m.text}` as MessageKey, m.vars)
  return (m.from === 'me' ? tr.t('chat.you') : '') + m.text
}

function when(iso: string, tr: ReturnType<typeof useT>) {
  const d = new Date(iso)
  const today = new Date()
  const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return d.toLocaleTimeString(tr.locale, { hour: '2-digit', minute: '2-digit' })
  if (d.toDateString() === y.toDateString()) return tr.t('chat.yesterday')
  return d.toLocaleDateString(tr.locale, { day: 'numeric', month: 'short' })
}

function Conversation({ personId }: { personId: string }) {
  const tr = useT()
  const p = usePerson(personId)
  const msgs = useApp((s) => s.threads[personId]) ?? []
  const pendingAt = useApp((s) => s.pendingReplies[personId])
  const send = useApp((s) => s.sendMessage)
  const markRead = useApp((s) => s.markRead)
  const hasOnline = useApp((s) => s.exchanges.some((e) => e.personId === personId && e.status === 'accepted' && e.mode === 'online'))
  const { startCall } = useVideo()
  const now = useNow(500)
  const typing = isTyping(pendingAt, now)
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    markRead(personId)
  }, [personId, msgs.length, markRead])
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs.length, typing])

  if (!p) return <Empty>{tr.t('person.notFound')}</Empty>

  const submit = (t: string) => {
    if (!t.trim()) return
    send(personId, t)
    setText('')
  }

  let lastDay = ''
  return (
    <div className="flex h-[calc(100dvh-180px)] flex-col lg:h-[calc(100dvh-100px)]">
      <div className="flex items-center gap-3 border-b border-line pb-3">
        <Link href="/app/chat/" className="btn btn-ghost btn-icon -ml-2 lg:hidden" aria-label={tr.t('common.back')}>
          <ArrowLeft size={20} />
        </Link>
        <Link href={`/app/persona/?id=${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar seed={p.id} name={fullName(p)} size={40} />
          <span className="min-w-0">
            <span className="block truncate font-bold">{shortName(p)}</span>
            <span className="block text-xs text-muted">{typing ? tr.t('chat.typing', { name: p.first }) : tr.t('person.replies', { time: tr.duration(p.replyMins) })}</span>
          </span>
        </Link>
        {hasOnline && (
          <button className="btn btn-outline btn-icon" onClick={() => startCall({ id: p.id, name: fullName(p) })} aria-label={tr.t('exchanges.call')}>
            <Video size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-4" aria-live="polite">
        {msgs.map((m) => {
          const day = new Date(m.at).toDateString()
          const sep = day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {sep && <p className="my-3 text-center text-xs font-semibold text-faint">{tr.date(m.at, { weekday: 'long', day: 'numeric', month: 'long' })}</p>}
              {m.from === 'system' ? (
                <p className="mx-auto w-fit rounded-full bg-well px-3 py-1 text-center text-xs font-semibold text-muted">{tr.t(`chat.system.${m.text}` as MessageKey, m.vars)}</p>
              ) : (
                <div className={cx('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                  <p
                    className={cx(
                      'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[0.95rem] leading-snug',
                      m.from === 'me' ? 'rounded-br-md bg-cobalt text-on-cobalt' : 'rounded-bl-md bg-sheet shadow-paper',
                    )}
                  >
                    {m.text}
                    <span className={cx('ml-2 align-bottom text-[0.65rem]', m.from === 'me' ? 'opacity-70' : 'text-faint')}>
                      {new Date(m.at).toLocaleTimeString(tr.locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )
        })}
        {typing && (
          <div className="flex">
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-sheet px-4 py-3 shadow-paper" aria-label={tr.t('chat.typing', { name: p.first })}>
              {[0, 1, 2].map((i) => (
                <span key={i} className="typing-dot h-2 w-2 rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={end} />
      </div>

      <div className="border-t border-line pt-3">
        <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto">
          {tr.m.chat.quick.map((q) => (
            <button key={q} className="chip shrink-0 !min-h-8 !text-xs" onClick={() => submit(q)}>
              {q}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit(text)
          }}
        >
          <input className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr.t('chat.placeholder')} aria-label={tr.t('chat.placeholder')} maxLength={1000} />
          <button className="btn btn-primary btn-icon !h-[2.9rem] !w-[2.9rem] shrink-0" disabled={!text.trim()} aria-label={tr.t('chat.send')}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
