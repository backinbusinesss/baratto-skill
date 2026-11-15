'use client'

import { Award } from 'lucide-react'
import { useEffect } from 'react'
import { badgeById, earnedBadges } from '@/domain/badges'
import { getT } from '@/i18n'
import { badgeName } from '@/i18n/badges'
import { useApp } from '@/store/app'
import { myStats } from '@/store/selectors'
import { toast } from './Toaster'

/**
 * Guarda lo store e, quando un'azione sblocca nuovi badge, li annuncia (al massimo tre alla volta).
 * Quando cambia il profilo (onboarding, ospite, ricomincia) riparte senza annunciare nulla.
 */
export function BadgeWatcher() {
  useEffect(() => {
    let me = useApp.getState().me
    let had = new Set(earnedBadges(myStats(useApp.getState())))
    return useApp.subscribe((s) => {
      if (!s.me) return
      const now = earnedBadges(myStats(s))
      if (s.me.joined !== me?.joined || s.me.name !== me?.name) {
        me = s.me
        had = new Set(now)
        return
      }
      me = s.me
      const fresh = now.filter((id) => !had.has(id))
      had = new Set(now)
      const tr = getT(s.settings.lang)
      for (const id of fresh.slice(0, 3)) {
        const b = badgeById(id)
        if (b) toast({ text: tr.t('toasts.badge', { name: badgeName(tr, b) }), href: '/app/profilo/', tone: 'warn', icon: <Award size={18} /> })
      }
    })
  }, [])
  return null
}
