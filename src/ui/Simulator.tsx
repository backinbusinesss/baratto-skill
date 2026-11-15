'use client'

import { Check, MessageCircle, RefreshCw, X } from 'lucide-react'
import { useEffect } from 'react'
import { findPerson, useApp } from '@/store/app'
import { getT } from '@/i18n'
import { toast } from './Toaster'

/**
 * Fa "vivere" la demo: ogni secondo le persone simulate rispondono alle proposte
 * e ai messaggi (vedi `tick` nello store). Gli eventi diventano notifiche.
 */
export function Simulator() {
  useEffect(() => {
    const run = () => {
      const s = useApp.getState()
      if (!s.me) return
      const events = s.tick()
      if (!events.length) return
      const tr = getT(s.settings.lang)
      const here = typeof location !== 'undefined' ? location.search : ''
      for (const ev of events) {
        const p = findPerson(s.neighbors, ev.personId)
        const name = p?.first ?? '…'
        if (ev.type === 'message') {
          // niente notifica se la conversazione è già aperta
          if (here.includes(`id=${ev.personId}`)) continue
          toast({ text: tr.t('toasts.newMessage', { name }), href: `/app/chat/?id=${ev.personId}`, icon: <MessageCircle size={18} /> })
        } else if (ev.type === 'accepted') {
          toast({ text: tr.t('exchanges.acceptedToast', { name }), href: `/app/scambio/?id=${ev.exchangeId}`, tone: 'ok', icon: <Check size={18} /> })
        } else if (ev.type === 'countered') {
          toast({ text: tr.t('exchanges.counteredToast', { name }), href: `/app/scambio/?id=${ev.exchangeId}`, tone: 'warn', icon: <RefreshCw size={18} /> })
        } else {
          toast({ text: tr.t('exchanges.declinedToast', { name }), href: `/app/scambio/?id=${ev.exchangeId}`, icon: <X size={18} /> })
        }
      }
    }
    const id = setInterval(run, 1000)
    return () => clearInterval(id)
  }, [])
  return null
}
