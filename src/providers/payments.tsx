'use client'

/**
 * PRESA DEI PAGAMENTI — demo, pronta per Stripe.
 *
 * Oggi `checkout(plan)` apre un modulo di pagamento finto (nessun addebito) e, se va a buon
 * fine, attiva il piano nello store. Per collegare Stripe basta sostituire `DemoGateway`
 * con un gateway vero che rispetti la stessa interfaccia `PaymentGateway`:
 *
 *   1. il client chiama il server (es. POST /api/checkout { plan }) che crea una
 *      Stripe Checkout Session in modalità `subscription` con il prezzo del piano
 *      (price_… per mensile e annuale, `trial_period_days: 14`);
 *   2. il client fa `window.location = session.url` (o usa Stripe Elements in pagina);
 *   3. il webhook `checkout.session.completed` / `customer.subscription.updated` aggiorna
 *      il piano dell'account sul server; al ritorno l'app rilegge il piano dall'account.
 *
 * L'interfaccia è pensata anche per gli acquisti in-app (Google Play / App Store) se un
 * giorno l'app finirà in una webview: cambia il gateway, non le schermate.
 */
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { PLANS, type Plan, type PlanId, TRIAL_DAYS } from '@/domain/plans'
import { useApp } from '@/store/app'

export type CheckoutResult = 'success' | 'cancelled'

export interface PaymentGateway {
  /** Avvia l'abbonamento al piano. Risolve quando l'utente ha pagato o rinunciato. */
  subscribe(plan: Plan, opts: { trialDays: number }): Promise<CheckoutResult>
  /** Disdice l'abbonamento (resta attivo fino a fine periodo sul gateway vero). */
  cancel(): Promise<void>
}

export interface PaymentsApi {
  checkout(plan: PlanId): Promise<CheckoutResult>
  cancelSubscription(): Promise<void>
  /** true mentre il modulo di pagamento è aperto */
  busy: boolean
}

export interface CheckoutUiProps {
  plan: Plan
  trialDays: number
  onDone(result: CheckoutResult): void
}

const PaymentsContext = createContext<PaymentsApi | null>(null)

/**
 * Fornisce `usePayments()` all'app. `Checkout` è la finestra di pagamento demo
 * (src/features/premium/DemoCheckout.tsx): con Stripe non servirà più.
 */
export function PaymentsProvider({ children, Checkout }: { children: ReactNode; Checkout: (p: CheckoutUiProps) => ReactNode }) {
  const [pending, setPending] = useState<{ plan: Plan; resolve(r: CheckoutResult): void } | null>(null)

  /** Il gateway demo: mostra il modulo finto e aspetta la scelta dell'utente. */
  const gateway: PaymentGateway = useMemo(
    () => ({
      subscribe: (plan) => new Promise<CheckoutResult>((resolve) => setPending({ plan, resolve })),
      cancel: async () => {},
    }),
    [],
  )

  const checkout = useCallback(
    async (planId: PlanId) => {
      const plan = PLANS[planId]
      if (!plan || plan.priceCents === 0) return 'cancelled' as const
      const result = await gateway.subscribe(plan, { trialDays: TRIAL_DAYS })
      // il piano lo attiva la presa (domani: il webhook del server), non la pagina
      if (result === 'success') useApp.getState().setPlan(planId)
      return result
    },
    [gateway],
  )

  const cancelSubscription = useCallback(async () => {
    await gateway.cancel()
    useApp.getState().setPlan('free')
  }, [gateway])

  const api = useMemo(() => ({ checkout, cancelSubscription, busy: !!pending }), [checkout, cancelSubscription, pending])

  return (
    <PaymentsContext.Provider value={api}>
      {children}
      {pending && (
        <Checkout
          plan={pending.plan}
          trialDays={TRIAL_DAYS}
          onDone={(r) => {
            pending.resolve(r)
            setPending(null)
          }}
        />
      )}
    </PaymentsContext.Provider>
  )
}

export function usePayments(): PaymentsApi {
  const ctx = useContext(PaymentsContext)
  if (!ctx) throw new Error('usePayments va usato dentro PaymentsProvider')
  return ctx
}
