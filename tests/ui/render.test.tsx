import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/app/',
  useSearchParams: () => new URLSearchParams(),
}))

import { Home } from '@/features/home/Home'
import { Onboarding } from '@/features/onboarding/Onboarding'
import { DemoCheckout } from '@/features/premium/DemoCheckout'
import { PLANS } from '@/domain/plans'
import { AccountProvider, isValidEmail, useAccount } from '@/providers/account'
import { PaymentsProvider, usePayments } from '@/providers/payments'
import { Landing } from '@/site/Landing'
import { initialData, useApp } from '@/store/app'

beforeEach(() => {
  localStorage.clear()
  useApp.setState({ ...initialData('it') })
})

describe('sito', () => {
  it('la home italiana ha il titolo, il link all’app e la demo', () => {
    render(<Landing lang="it" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Io ti insegno')
    expect(screen.getAllByRole('link', { name: /Inizia a scambiare/ })[0].getAttribute('href')).toMatch(/^\/app\/?$/)
    expect(screen.getAllByText(/\d+ scambi? perfett[io]/).length).toBeGreaterThan(0)
  })

  it('la home inglese è tradotta', () => {
    render(<Landing lang="en" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('I teach you')
    expect(screen.getAllByRole('link', { name: 'Italiano' })[0]).toHaveAttribute('href', '/')
  })
})

describe('app', () => {
  it('dall’onboarding si entra come ospite e si vede la bacheca', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)
    await user.click(screen.getByRole('button', { name: /Entra come ospite/ }))
    expect(useApp.getState().me?.name).toBe('Giulia')
    render(<Home />)
    expect(screen.getByRole('heading', { name: /Giulia/ })).toBeInTheDocument()
    expect(screen.getByText('Scambi perfetti vicino a te')).toBeInTheDocument()
  })

  it('l’onboarding non va avanti senza un nome', async () => {
    const user = userEvent.setup()
    render(<Onboarding />)
    await user.click(screen.getByRole('button', { name: /Crea il tuo profilo/ }))
    const next = screen.getByRole('button', { name: /Continua/ })
    expect(next).toBeDisabled()
    await user.type(screen.getByPlaceholderText('Il tuo nome'), 'Ada')
    expect(next).toBeEnabled()
  })
})

describe('prese demo', () => {
  it('il pagamento demo attiva il piano scelto', async () => {
    useApp.getState().enterDemo()
    let api: ReturnType<typeof usePayments> | null = null
    function Grab() {
      api = usePayments()
      return null
    }
    render(
      <PaymentsProvider Checkout={DemoCheckout}>
        <Grab />
      </PaymentsProvider>,
    )
    let p: Promise<unknown> = Promise.resolve()
    act(() => {
      p = api!.checkout('premium-monthly')
    })
    expect(await screen.findByText(/Pagamento demo/)).toBeInTheDocument()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await act(async () => {
      screen.getByRole('button', { name: /Inizia la prova gratuita/ }).click()
      vi.advanceTimersByTime(1500)
    })
    vi.useRealTimers()
    await expect(p).resolves.toBe('success')
    expect(useApp.getState().plan).toBe('premium-monthly')
    expect(PLANS['premium-monthly'].featured).toBe(true)
  })

  it('l’account demo resta nel browser', async () => {
    expect(isValidEmail('ada@example.com')).toBe(true)
    expect(isValidEmail('ada@')).toBe(false)
    let api: ReturnType<typeof useAccount> | null = null
    function Grab() {
      api = useAccount()
      return <span>{api.account?.email ?? 'ospite'}</span>
    }
    render(
      <AccountProvider>
        <Grab />
      </AccountProvider>,
    )
    await act(async () => {
      await api!.signIn('Ada@Example.com')
    })
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(localStorage.getItem('baratto-skill:account')).toContain('ada@example.com')
  })
})
