'use client'

import { CreditCard, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { formatPrice } from '@/domain/plans'
import type { CheckoutUiProps } from '@/providers/payments'
import { useT } from '@/store/hooks'
import { Sheet } from '@/ui/Sheet'

/**
 * Il modulo di pagamento DEMO: i campi sono già compilati con la carta di prova di Stripe
 * e nessun dato esce dal browser. Con Stripe vero questa finestra sparisce (Checkout ospitato).
 */
export function DemoCheckout({ plan, trialDays, onDone }: CheckoutUiProps) {
  const tr = useT()
  const [busy, setBusy] = useState(false)
  const price = formatPrice(plan.priceCents, tr.lang)
  const period = plan.period === 'year' ? tr.t('premium.perYear') : tr.t('premium.perMonth')
  const trialEnd = tr.date(new Date(Date.now() + trialDays * 86400000), { day: 'numeric', month: 'long' })
  const pay = () => {
    setBusy(true)
    setTimeout(() => onDone('success'), 1200)
  }
  return (
    <Sheet
      open
      onClose={() => !busy && onDone('cancelled')}
      title={`${tr.t('checkout.title')} · ${plan.period === 'year' ? tr.t('premium.yearly') : tr.t('premium.monthly')}`}
      closeLabel={tr.t('common.close')}
      footer={
        <button className="btn btn-primary btn-lg mb-2 w-full" onClick={pay} disabled={busy} data-autofocus>
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
          {busy ? tr.t('checkout.processing') : tr.t('checkout.startTrial')}
        </button>
      }
    >
      <p className="rounded-lg bg-yellow/60 px-3 py-2 text-sm font-medium text-[#10162f]">{tr.t('checkout.demo')}</p>
      <div className="mt-4 space-y-3" aria-disabled>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{tr.t('checkout.card')}</span>
          <div className="field flex items-center gap-2 !bg-well text-muted">
            <CreditCard size={18} /> 4242 4242 4242 4242
          </div>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{tr.t('checkout.expiry')}</span>
            <div className="field !bg-well text-muted">12 / 34</div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{tr.t('checkout.cvc')}</span>
            <div className="field !bg-well text-muted">123</div>
          </label>
        </div>
      </div>
      <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-line-strong pt-4">
        <span className="font-semibold">{tr.t('checkout.total')}</span>
        <span className="text-2xl font-extrabold" style={{ fontStretch: '80%' }}>
          0 €
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{tr.t('checkout.trialNote', { date: trialEnd, price, period })}</p>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-faint">
        <Lock size={12} /> {tr.t('checkout.secure')}
      </p>
    </Sheet>
  )
}
