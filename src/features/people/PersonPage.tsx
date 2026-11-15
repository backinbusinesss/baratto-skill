'use client'

import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Flag, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { BADGES, badgeProgress, demoStats } from '@/domain/badges'
import { formatKm, haversineKm } from '@/domain/geo'
import { scoreMatch } from '@/domain/matching'
import { fullName, shortName } from '@/domain/people'
import { bioFor, reviewsFor } from '@/i18n/compose'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { AvailabilityGrid } from '@/ui/AvailabilityGrid'
import { Avatar } from '@/ui/Avatar'
import { BadgeStamp } from '@/ui/BadgeStamp'
import { Empty, PremiumTag, SkillChip, Stars, VerifiedMark } from '@/ui/bits'
import { toast } from '@/ui/Toaster'
import { ProposeSheet } from '../exchanges/ProposeSheet'
import { usePerson } from './useMatches'

const LANG_NAMES: Record<string, string> = {
  it: 'Italiano', en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch', uk: 'Українська', ro: 'Română', zh: '中文', ja: '日本語', ko: '한국어',
  ar: 'العربية', hi: 'हिन्दी', tr: 'Türkçe', el: 'Ελληνικά', pl: 'Polski', sq: 'Shqip', pt: 'Português', nl: 'Nederlands', sv: 'Svenska', ru: 'Русский', sw: 'Kiswahili',
}

export function PersonPage() {
  const tr = useT()
  const id = useSearchParams().get('id')
  const p = usePerson(id)
  const me = useApp((s) => s.me)!
  const saved = useApp((s) => (id ? s.saved.includes(id) : false))
  const toggleSaved = useApp((s) => s.toggleSaved)
  const [proposeOpen, setProposeOpen] = useState(false)
  const [initialGet, setInitialGet] = useState<string | undefined>()

  const data = useMemo(() => {
    if (!p) return null
    const city = comuneById(me.comuneId)!
    const dist = haversineKm(city, p)
    return {
      match: scoreMatch(me, p, dist, me.radiusKm),
      bio: bioFor(p, tr),
      reviews: reviewsFor(p, tr, 5),
      stats: demoStats(p),
    }
  }, [p, me, tr])

  if (!p || !data) return <Empty>{tr.t('person.notFound')}</Empty>
  const { match, bio, reviews, stats } = data
  const wanted = new Set(me.wants)
  const myOffers = new Set(me.offers.map((o) => o.id))
  const earned = BADGES.filter((b) => badgeProgress(b, stats).earned)

  const openPropose = (get?: string) => {
    setInitialGet(get)
    setProposeOpen(true)
  }

  return (
    <div>
      <Link href="/app/vicini/" className="btn btn-ghost btn-sm -ml-3">
        <ArrowLeft size={16} /> {tr.t('nav.people')}
      </Link>

      <div className="mt-3 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-start gap-4">
            <Avatar seed={p.id} name={fullName(p)} size={84} ring={p.premium ? 'premium' : 'none'} />
            <div className="min-w-0 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="display text-[2.4rem] sm:text-[3rem]">{shortName(p)}</h1>
                {p.verified && <VerifiedMark size={22} />}
              </div>
              <p className="mt-1 text-muted">
                {tr.t('person.years', { count: p.age })} · {comuneById(p.comuneId)?.name} · {tr.t('person.distance', { km: formatKm(match.distKm, tr.locale) })}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {p.premium && <PremiumTag />}
                {p.reviews > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Stars value={p.rating} /> <strong>{tr.num(p.rating)}</strong> <span className="text-muted">({tr.t('common.reviews', { count: p.reviews })})</span>
                  </span>
                ) : (
                  <span className="text-sm text-muted">{tr.t('common.noReviews')}</span>
                )}
              </div>
            </div>
          </div>

          {match.kind !== 'none' && (
            <div className="mt-6 rounded-2xl bg-mint-soft p-4 text-mint-ink">
              <p className="font-bold">{tr.t('person.yourMatch')} · {tr.m.kinds[match.kind]}</p>
              <p className="mt-1 text-sm">
                {match.give.length > 0 && <>{tr.t('person.youTeach')}: <strong>{tr.list(match.give.map(tr.skill))}</strong>. </>}
                {match.get.length > 0 && <>{tr.t('person.theyTeach')}: <strong>{tr.list(match.get.map((g) => tr.skill(g.id)))}</strong>.</>}
              </p>
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-xl">{tr.t('person.about')}</h2>
            <p className="mt-2 max-w-[65ch] text-[1.05rem] leading-relaxed">{bio}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {tr.t('person.replies', { time: tr.duration(p.replyMins) })}</span>
              <span>{tr.t('person.memberSince', { date: tr.date(p.joined, { month: 'long', year: 'numeric' }) })}</span>
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl">{tr.t('person.teaches')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.offers.map((o) => (
                <SkillChip key={o.id} id={o.id} level={o.level} hit={wanted.has(o.id)} onClick={() => openPropose(o.id)} />
              ))}
            </div>
          </section>
          <section className="mt-6">
            <h2 className="text-xl">{tr.t('person.wants')}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.wants.map((w) => (
                <SkillChip key={w} id={w} hit={myOffers.has(w)} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl">{tr.t('person.availability')}</h2>
            <p className="mb-3 mt-1 text-sm text-muted">{tr.t('propose.slotsHint')}</p>
            <div className="max-w-md">
              <AvailabilityGrid value={p.avail} other={me.avail} compact />
            </div>
            <p className="mt-3 text-sm">
              <strong>{tr.t('person.languages')}:</strong> {p.langs.map((l) => LANG_NAMES[l] ?? l).join(', ')} · {tr.m.modes[p.mode]}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl">{tr.t('person.reviews')}</h2>
            {reviews.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {reviews.map((r, i) => (
                  <figure key={i} className="paper p-4" style={{ transform: `rotate(${((i % 3) - 1) * 0.6}deg)` }}>
                    <div className="flex items-center justify-between">
                      <Stars value={r.stars} />
                      <span className="text-xs text-faint">{tr.date(r.date, { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <blockquote className="hand mt-2 text-[1.35rem] leading-tight">{r.text}</blockquote>
                    <figcaption className="mt-2 text-sm text-muted">
                      {r.author} · {tr.skill(r.skill)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-muted">{tr.t('common.noReviews')}</p>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="sheet p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-well p-3">
                <p className="num text-3xl font-extrabold" style={{ fontStretch: '72%' }}>{p.hoursGiven}</p>
                <p className="text-xs text-muted">{tr.t('person.given')}</p>
              </div>
              <div className="rounded-xl bg-well p-3">
                <p className="num text-3xl font-extrabold" style={{ fontStretch: '72%' }}>{p.hoursReceived}</p>
                <p className="text-xs text-muted">{tr.t('person.received')}</p>
              </div>
            </div>
            <button className="btn btn-primary btn-lg mt-4 w-full" onClick={() => openPropose()}>
              <Send size={18} /> {tr.t('person.propose')}
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={`/app/chat/?id=${p.id}`} className="btn btn-outline">
                <MessageCircle size={17} /> {tr.t('person.message')}
              </Link>
              <button className="btn btn-outline" onClick={() => toggleSaved(p.id)} aria-pressed={saved}>
                {saved ? <BookmarkCheck size={17} className="text-cobalt" /> : <Bookmark size={17} />} {saved ? tr.t('person.saved') : tr.t('person.save')}
              </button>
            </div>
          </div>
          {earned.length > 0 && (
            <div className="mt-5">
              <h2 className="text-lg">{tr.t('person.badges')}</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {earned.map((b) => (
                  <BadgeStamp key={b.id} badge={b} earned size="sm" />
                ))}
              </div>
            </div>
          )}
          <button className="btn btn-ghost btn-sm mt-6 text-faint" onClick={() => toast({ text: tr.t('person.reported'), icon: <Flag size={16} /> })}>
            <Flag size={14} /> {tr.t('person.report')}
          </button>
        </aside>
      </div>

      {/* sul telefono le azioni restano a portata di pollice, sopra il menu */}
      <div className="fixed inset-x-0 bottom-[68px] z-30 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <button className="btn btn-primary flex-1" onClick={() => openPropose()}>
            <Send size={17} /> {tr.t('person.propose')}
          </button>
          <Link href={`/app/chat/?id=${p.id}`} className="btn btn-outline btn-icon !h-11 !w-11" aria-label={tr.t('person.message')}>
            <MessageCircle size={18} />
          </Link>
        </div>
      </div>
      <div className="h-16 lg:hidden" />

      <ProposeSheet person={p} open={proposeOpen} onClose={() => setProposeOpen(false)} initialGet={initialGet} />
    </div>
  )
}
