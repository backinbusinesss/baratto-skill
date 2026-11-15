'use client'

import { ArrowLeft, Check, GraduationCap, Plus, Video, Users } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { categoryById } from '@/content/categories'
import { skillById } from '@/content/skills'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Empty, Section } from '@/ui/bits'
import { CategoryIcon } from '@/ui/Icon'
import { toast } from '@/ui/Toaster'
import { PersonFlyer } from '../people/PersonFlyer'
import { useMatches } from '../people/useMatches'

export function SkillDetail() {
  const tr = useT()
  const id = useSearchParams().get('id') ?? ''
  const s = skillById(id)
  const me = useApp((st) => st.me)!
  const updateMe = useApp((st) => st.updateMe)
  const teachers = useMatches({ skill: id, skillSide: 'offers' })
  const learners = useMatches({ skill: id, skillSide: 'wants' })
  if (!s) return <Empty>{tr.t('explore.noResults', { q: id })}</Empty>
  const c = categoryById(s.cat)
  const inOffers = me.offers.some((o) => o.id === id)
  const inWants = me.wants.includes(id)

  return (
    <div>
      <Link href={`/app/esplora/?cat=${s.cat}`} className="btn btn-ghost btn-sm -ml-3">
        <ArrowLeft size={16} /> {tr.cat(s.cat)}
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: c.color }}>
            <CategoryIcon id={s.cat} size={16} /> {tr.cat(s.cat)}
          </span>
          <h1 className="display mt-1 text-[3rem] sm:text-[4rem]">{tr.skill(id)}</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted">
            <span className="inline-flex items-center gap-1.5"><GraduationCap size={16} /> {tr.t('explore.offeredNear', { count: teachers.length })}</span>
            <span className="inline-flex items-center gap-1.5"><Users size={16} /> {tr.t('explore.wantedNear', { count: learners.length })}</span>
            <span className="inline-flex items-center gap-1.5"><Video size={16} /> {s.online ? tr.t('explore.onlineOk') : tr.t('explore.liveOnly')}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {inOffers ? (
            <span className="chip on"><Check size={14} /> {tr.t('explore.inOffers')}</span>
          ) : inWants ? (
            <span className="chip on"><Check size={14} /> {tr.t('explore.inWants')}</span>
          ) : (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  updateMe({ wants: [...me.wants, id] })
                  toast({ text: tr.t('toasts.addedWant', { skill: tr.skill(id) }), tone: 'ok' })
                }}
              >
                <Plus size={16} /> {tr.t('explore.addWant')}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  updateMe({ offers: [...me.offers, { id, level: 3 }] })
                  toast({ text: tr.t('toasts.addedOffer', { skill: tr.skill(id) }), tone: 'ok' })
                }}
              >
                <Plus size={16} /> {tr.t('explore.addOffer')}
              </button>
            </>
          )}
        </div>
      </div>

      <Section title={tr.t('explore.teachersTitle')}>
        {teachers.length ? (
          <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
            {teachers.slice(0, 12).map((m) => (
              <PersonFlyer key={m.person.id} match={m} />
            ))}
          </div>
        ) : (
          <Empty>{tr.t('explore.nobody', { km: me.radiusKm })}</Empty>
        )}
      </Section>
      {learners.length > 0 && (
        <Section title={tr.t('explore.learnersTitle')}>
          <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
            {learners.slice(0, 6).map((m) => (
              <PersonFlyer key={m.person.id} match={m} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
