'use client'

import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { cx } from '@/lib/cx'
import { type Exchange, useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Sheet } from '@/ui/Sheet'
import { toast } from '@/ui/Toaster'
import { usePerson } from '../people/useMatches'

/** Accetta (scegliendo uno degli orari proposti) o rifiuta una proposta in arrivo. */
export function IncomingActions({ ex }: { ex: Exchange }) {
  const tr = useT()
  const respond = useApp((s) => s.respond)
  const p = usePerson(ex.personId)
  const [open, setOpen] = useState(false)
  const [slot, setSlot] = useState(ex.slots[0] ?? null)
  return (
    <>
      <button className="btn btn-mint btn-sm" onClick={() => (ex.slots.length > 1 ? setOpen(true) : respond(ex.id, true))}>
        <Check size={16} /> {tr.t('exchanges.accept')}
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => respond(ex.id, false)}>
        <X size={16} /> {tr.t('exchanges.decline')}
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={tr.t('exchanges.chooseSlot')}
        closeLabel={tr.t('common.close')}
        footer={
          <button
            className="btn btn-primary btn-lg mb-2 w-full"
            disabled={!slot}
            onClick={() => {
              respond(ex.id, true, slot ?? undefined)
              setOpen(false)
              toast({ text: tr.t('chat.system.accepted', { when: slot ? tr.slot(slot) : '' }), tone: 'ok', icon: <Check size={18} /> })
            }}
          >
            <Check size={18} /> {tr.t('exchanges.accept')}
          </button>
        }
      >
        <p className="mb-3 text-muted">{p ? `${p.first} · ${tr.t('exchanges.proposedSlots')}` : tr.t('exchanges.proposedSlots')}</p>
        <div className="grid gap-2">
          {ex.slots.map((s) => (
            <button
              key={s}
              className={cx('flex min-h-12 items-center justify-between rounded-xl border-[1.5px] px-4 font-semibold', slot === s ? 'border-cobalt bg-cobalt-soft' : 'border-line-strong')}
              onClick={() => setSlot(s)}
              aria-pressed={slot === s}
            >
              {tr.slot(s)}
              {slot === s && <Check size={18} className="text-cobalt" />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}
