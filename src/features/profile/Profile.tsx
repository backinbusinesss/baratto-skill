'use client'

import { Crown, Eye, Lock, LogOut, Mail, Monitor, Moon, Pencil, RotateCcw, Sun } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { comuneById } from '@/content/comuni'
import { BADGES, badgeProgress } from '@/domain/badges'
import { haversineKm } from '@/domain/geo'
import { hashString, mulberry32 } from '@/domain/rng'
import { isPremium, limitsFor } from '@/domain/plans'
import { shortName } from '@/domain/people'
import type { Me } from '@/domain/types'
import { LANG_LABEL, LANGS } from '@/i18n'
import { cx } from '@/lib/cx'
import { isValidEmail, useAccount } from '@/providers/account'
import { findPerson, type Theme, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { myRating, myStats, profileCompleteness } from '@/store/selectors'
import { AvailabilityGrid } from '@/ui/AvailabilityGrid'
import { Avatar } from '@/ui/Avatar'
import { BadgeStamp } from '@/ui/BadgeStamp'
import { Empty, Section, SkillChip, Stars } from '@/ui/bits'
import { ComuneSearch } from '@/ui/ComuneSearch'
import { Sheet } from '@/ui/Sheet'
import { SkillPicker } from '@/ui/SkillPicker'
import { toast } from '@/ui/Toaster'
import { usePeople } from '../people/useMatches'

export function Profile() {
  const tr = useT()
  const state = useApp()
  const me = state.me!
  const premium = isPremium(state.plan)
  const stats = myStats(state)
  const rating = myRating(state)
  const complete = profileCompleteness(state)
  const [editing, setEditing] = useState(false)
  const city = comuneById(me.comuneId)!
  const received = state.exchanges.filter((e) => e.theirReview)
  const earnedCount = BADGES.filter((b) => badgeProgress(b, stats).earned).length
  const people = usePeople()

  // visite della settimana (demo): vicini scelti in modo stabile
  const views = useMemo(() => {
    const rng = mulberry32(hashString(me.name + me.comuneId))
    const near = people.filter((p) => haversineKm(city, p) <= me.radiusKm)
    return near.filter(() => rng() < 0.12).slice(0, 8)
  }, [people, me, city])

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar seed={`me-${me.name}`} name={me.name} size={96} ring={premium ? 'premium' : 'none'} />
        <div className="flex-1">
          <h1 className="display text-[2.8rem] sm:text-[3.4rem]">{me.name}</h1>
          <p className="mt-1 text-muted">
            {city.name} ({city.prov}) · {me.radiusKm} km · {tr.m.modes[me.mode]}
          </p>
          {rating.count > 0 && (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Stars value={rating.avg} /> <strong>{tr.num(rating.avg)}</strong> <span className="text-muted">({tr.t('common.reviews', { count: rating.count })})</span>
            </p>
          )}
        </div>
        <button className="btn btn-primary self-start sm:self-center" onClick={() => setEditing(true)}>
          <Pencil size={16} /> {tr.t('profile.edit')}
        </button>
      </div>

      {complete < 1 && (
        <button onClick={() => setEditing(true)} className="mt-5 block w-full rounded-2xl bg-yellow/40 p-4 text-left">
          <span className="font-semibold">{tr.t('profile.completeness', { pct: Math.round(complete * 100) })}</span>
          <span className="mt-2 block h-2 overflow-hidden rounded-full bg-sheet">
            <span className="block h-full bg-ink" style={{ width: `${complete * 100}%` }} />
          </span>
        </button>
      )}

      {me.bio && <p className="hand mt-6 max-w-2xl text-[1.6rem] leading-snug">“{me.bio}”</p>}

      <div className="grid gap-x-10 lg:grid-cols-2">
        <Section title={tr.t('profile.offers')}>
          <div className="flex flex-wrap gap-2">
            {me.offers.map((o) => (
              <SkillChip key={o.id} id={o.id} level={o.level} />
            ))}
          </div>
        </Section>
        <Section title={tr.t('profile.wants')}>
          <div className="flex flex-wrap gap-2">
            {me.wants.map((w) => (
              <SkillChip key={w} id={w} />
            ))}
          </div>
        </Section>
      </div>

      <Section title={tr.t('profile.availability')}>
        <div className="max-w-lg">
          <AvailabilityGrid value={me.avail} compact />
        </div>
      </Section>

      <Section title={tr.t('profile.badges')} action={<span className="text-sm text-muted">{tr.t('profile.badgesProgress', { earned: earnedCount, total: BADGES.length })}</span>}>
        <div className="grid grid-cols-3 justify-items-center gap-y-6 sm:grid-cols-5 lg:grid-cols-7">
          {[...BADGES]
            .sort((a, b) => Number(badgeProgress(b, stats).earned) - Number(badgeProgress(a, stats).earned))
            .map((b) => {
              const pr = badgeProgress(b, stats)
              return <BadgeStamp key={b.id} badge={b} earned={pr.earned} pct={pr.pct} />
            })}
        </div>
      </Section>

      <div className="grid gap-x-10 lg:grid-cols-2">
        <Section title={tr.t('profile.reviews')}>
          {received.length ? (
            <div className="space-y-3">
              {received.map((e) => {
                const p = findPerson(state.neighbors, e.personId)
                return (
                  <figure key={e.id} className="paper p-4">
                    <div className="flex items-center justify-between">
                      <Stars value={e.theirReview!.stars} />
                      <span className="text-xs text-faint">{tr.date(e.theirReview!.at, { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <blockquote className="hand mt-1 text-[1.3rem] leading-tight">{e.theirReview!.text}</blockquote>
                    {p && <figcaption className="mt-1 text-sm text-muted">{shortName(p)}</figcaption>}
                  </figure>
                )
              })}
            </div>
          ) : (
            <Empty>{tr.t('common.noReviews')}</Empty>
          )}
        </Section>
        <Section title={tr.t('profile.views')}>
          {premium ? (
            <>
              <p className="mb-3 flex items-center gap-1.5 text-sm text-muted"><Eye size={15} /> {tr.t('profile.viewsCount', { count: views.length })}</p>
              <div className="flex flex-wrap gap-2">
                {views.map((p) => (
                  <Link key={p.id} href={`/app/persona/?id=${p.id}`} className="chip !min-h-10">
                    <Avatar seed={p.id} name={`${p.first} ${p.last}`} size={24} /> {shortName(p)}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <Link href="/app/premium/" className="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line-strong p-4 hover:bg-sheet">
              <span className="flex -space-x-2 blur-[2px]" aria-hidden>
                {views.slice(0, 4).map((p) => (
                  <Avatar key={p.id} seed={p.id} name={p.first} size={32} />
                ))}
              </span>
              <span className="flex-1 text-sm">{tr.t('profile.viewsLocked')}</span>
              <Lock size={16} />
            </Link>
          )}
          <h3 className="mt-6 text-lg">{tr.t('profile.savedPeople')}</h3>
          {state.saved.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {state.saved.map((id) => {
                const p = findPerson(state.neighbors, id)
                return p ? (
                  <Link key={id} href={`/app/persona/?id=${id}`} className="chip !min-h-10">
                    <Avatar seed={p.id} name={`${p.first} ${p.last}`} size={24} /> {shortName(p)}
                  </Link>
                ) : null
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">{tr.t('profile.noSaved')}</p>
          )}
        </Section>
      </div>

      <Section title={tr.t('profile.settings')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="sheet p-4">
            <p className="font-semibold">{tr.t('profile.language')}</p>
            <div className="mt-2 flex gap-1.5">
              {LANGS.map((l) => (
                <button key={l} className={cx('chip', state.settings.lang === l && 'on')} aria-pressed={state.settings.lang === l} onClick={() => state.setLang(l)}>
                  {LANG_LABEL[l]}
                </button>
              ))}
            </div>
            <p className="mt-4 font-semibold">{tr.t('profile.theme')}</p>
            <div className="mt-2 flex gap-1.5">
              {(['system', 'light', 'dark'] as Theme[]).map((th) => (
                <button key={th} className={cx('chip', state.settings.theme === th && 'on')} aria-pressed={state.settings.theme === th} onClick={() => state.setTheme(th)}>
                  {th === 'system' ? <Monitor size={14} /> : th === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                  {tr.m.profile.themes[th]}
                </button>
              ))}
            </div>
          </div>
          <div className="sheet p-4">
            <p className="font-semibold">{tr.t('profile.plan')}</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
              {premium && <Crown size={18} className="text-yellow-ink" />}
              {premium ? `${tr.t('common.premium')} · ${state.plan === 'premium-yearly' ? tr.t('premium.yearly') : tr.t('premium.monthly')}` : tr.t('premium.free')}
            </p>
            {!premium && (
              <p className="text-sm text-muted">
                {tr.t('premium.freeLimits.proposals', { n: limitsFor('free').proposalsPerMonth ?? 0 })} · {tr.t('premium.freeLimits.radius', { km: limitsFor('free').maxRadiusKm })}
              </p>
            )}
            <Link href="/app/premium/" className={cx('btn btn-sm mt-3', premium ? 'btn-outline' : 'btn-yellow')}>
              <Crown size={15} /> {premium ? tr.t('common.premium') : tr.t('premium.trial', { days: 14 })}
            </Link>
          </div>
          <AccountPanel />
          <div className="sheet p-4">
            <p className="font-semibold">{tr.t('profile.stats')}</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                [stats.completed, tr.t('exchanges.past')],
                [stats.hoursGiven, tr.t('person.given')],
                [stats.peopleMet, tr.t('common.people', { count: stats.peopleMet }).replace(/^\d+\s/, '')],
              ].map(([v, l], i) => (
                <div key={i} className="rounded-xl bg-well p-2">
                  <dd className="num text-2xl font-extrabold" style={{ fontStretch: '72%' }}>{v}</dd>
                  <dt className="text-xs text-muted">{l}</dt>
                </div>
              ))}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/privacy/" className="btn btn-ghost btn-sm">{tr.t('profile.legal')}</Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm(tr.t('profile.resetConfirm'))) state.reset()
                }}
              >
                <RotateCcw size={15} /> {tr.t('profile.reset')}
              </button>
            </div>
          </div>
        </div>
      </Section>

      <EditProfile open={editing} onClose={() => setEditing(false)} />
    </div>
  )
}

function AccountPanel() {
  const tr = useT()
  const { account, signIn, signOut } = useAccount()
  const [email, setEmail] = useState('')
  return (
    <div className="sheet p-4">
      <p className="font-semibold">{tr.t('account.title')}</p>
      {account ? (
        <>
          <p className="mt-1 text-sm">{tr.t('account.signedAs', { email: account.email })}</p>
          <p className="mt-1 text-xs text-muted">{tr.t('account.demo')}</p>
          <button className="btn btn-outline btn-sm mt-3" onClick={signOut}>
            <LogOut size={15} /> {tr.t('account.signOut')}
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">{tr.t('account.guest')}</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!isValidEmail(email)) return
              await signIn(email)
              toast({ text: tr.t('account.linkSent'), tone: 'ok', icon: <Mail size={18} /> })
            }}
          >
            <input className="field !min-h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr.t('account.email')} aria-label={tr.t('account.email')} />
            <button className="btn btn-ink btn-sm shrink-0" disabled={!isValidEmail(email)}>
              {tr.t('account.signIn')}
            </button>
          </form>
          <p className="mt-2 text-xs text-faint">{tr.t('account.sync')}</p>
        </>
      )}
    </div>
  )
}

function EditProfile({ open, onClose }: { open: boolean; onClose(): void }) {
  const tr = useT()
  const me = useApp((s) => s.me)!
  const plan = useApp((s) => s.plan)
  const updateMe = useApp((s) => s.updateMe)
  const [draft, setDraft] = useState<Me>(me)
  const [tab, setTab] = useState<'about' | 'offers' | 'wants' | 'avail'>('about')
  const max = limitsFor(plan).maxRadiusKm
  const set = (p: Partial<Me>) => setDraft((d) => ({ ...d, ...p }))

  return (
    <Sheet
      open={open}
      onClose={onClose}
      wide
      title={tr.t('profile.edit')}
      closeLabel={tr.t('common.close')}
      footer={
        <button
          className="btn btn-primary btn-lg mb-2 w-full"
          disabled={!draft.name.trim() || !draft.offers.length || !draft.wants.length || !draft.avail}
          onClick={() => {
            updateMe(draft)
            toast({ text: tr.t('profile.savedToast'), tone: 'ok' })
            onClose()
          }}
        >
          {tr.t('common.save')}
        </button>
      }
    >
      <div className="no-scrollbar -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1">
        {(
          [
            ['about', tr.t('person.about')],
            ['offers', tr.t('profile.offers')],
            ['wants', tr.t('profile.wants')],
            ['avail', tr.t('profile.availability')],
          ] as const
        ).map(([k, l]) => (
          <button key={k} className={cx('chip shrink-0', tab === k && 'on')} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'about' && (
        <div className="space-y-5">
          <label className="block">
            <span className="mb-1.5 block font-semibold">{tr.t('onboarding.nameTitle')}</span>
            <input className="field" value={draft.name} maxLength={30} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-semibold">{tr.t('profile.bio')}</span>
            <textarea className="field" value={draft.bio} maxLength={400} onChange={(e) => set({ bio: e.target.value })} placeholder={tr.t('profile.bioPlaceholder')} />
          </label>
          <div>
            <span className="mb-1.5 block font-semibold">{tr.t('profile.zone')}</span>
            <ComuneSearch value={draft.comuneId} onChange={(id) => set({ comuneId: id })} />
          </div>
          <label className="block">
            <span className="mb-1.5 flex justify-between font-semibold">
              {tr.t('onboarding.radius')} <span className="num">{Math.min(draft.radiusKm, max)} km</span>
            </span>
            <input type="range" min={1} max={max} value={Math.min(draft.radiusKm, max)} onChange={(e) => set({ radiusKm: +e.target.value })} className="w-full" />
          </label>
        </div>
      )}
      {tab === 'offers' && <SkillPicker value={draft.offers} onChange={(offers) => set({ offers })} withLevel exclude={new Set(draft.wants)} />}
      {tab === 'wants' && (
        <SkillPicker
          value={draft.wants.map((id) => ({ id, level: 1 }))}
          onChange={(w) => set({ wants: w.map((x) => x.id) })}
          exclude={new Set(draft.offers.map((o) => o.id))}
          excludeLabel={tr.t('onboarding.alreadyOffered')}
        />
      )}
      {tab === 'avail' && (
        <div>
          <AvailabilityGrid value={draft.avail} onChange={(avail) => set({ avail })} />
          <div className="mt-6 flex flex-wrap gap-2">
            {(['live', 'online', 'both'] as const).map((m) => (
              <button key={m} className={cx('chip !min-h-10', draft.mode === m && 'on')} onClick={() => set({ mode: m })}>
                {tr.m.modes[m]}
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  )
}
