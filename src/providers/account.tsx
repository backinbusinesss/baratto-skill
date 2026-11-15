'use client'

/**
 * PRESA DEGLI ACCOUNT — demo, pronta per un server.
 *
 * Oggi l'account è solo locale: l'email resta in questo browser e "accedere" non invia
 * nulla. Per collegare un server degli account (Supabase, Firebase Auth, Auth.js, un
 * backend proprio…) basta sostituire `localBackend` con un `AccountBackend` vero:
 *
 *   - `requestLink(email)` → POST /auth/magic-link (accesso senza password via email)
 *   - `current()`          → GET /me con il cookie di sessione
 *   - `signOut()`          → POST /auth/logout
 *   - `pushProfile(data)`  → PUT /me/profile, per sincronizzare profilo, scambi e ore
 *
 * Le schermate usano solo `useAccount()`, quindi non cambiano.
 */
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { safeStorage } from '@/lib/storage'

export interface Account {
  email: string
  since: string
}

export interface AccountBackend {
  current(): Promise<Account | null>
  /** Invia il link di accesso. Nella demo l'accesso è immediato. */
  requestLink(email: string): Promise<Account>
  signOut(): Promise<void>
  /** Sincronizza i dati dell'app sul server (nella demo non fa niente). */
  pushProfile(data: unknown): Promise<void>
}

const KEY = 'baratto-skill:account'

export const localBackend: AccountBackend = {
  async current() {
    try {
      const raw = safeStorage.getItem(KEY)
      const a = raw ? (JSON.parse(raw) as Account) : null
      return a && typeof a.email === 'string' ? a : null
    } catch {
      return null
    }
  },
  async requestLink(email) {
    const a = { email: email.trim().toLowerCase(), since: new Date().toISOString() }
    safeStorage.setItem(KEY, JSON.stringify(a))
    return a
  },
  async signOut() {
    safeStorage.removeItem(KEY)
  },
  async pushProfile() {},
}

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

export interface AccountApi {
  account: Account | null
  signIn(email: string): Promise<Account>
  signOut(): Promise<void>
}

const AccountContext = createContext<AccountApi | null>(null)

export function AccountProvider({ children, backend = localBackend }: { children: ReactNode; backend?: AccountBackend }) {
  const [account, setAccount] = useState<Account | null>(null)
  useEffect(() => {
    backend.current().then(setAccount)
  }, [backend])
  const signIn = useCallback(
    async (email: string) => {
      const a = await backend.requestLink(email)
      setAccount(a)
      return a
    },
    [backend],
  )
  const signOut = useCallback(async () => {
    await backend.signOut()
    setAccount(null)
  }, [backend])
  const api = useMemo(() => ({ account, signIn, signOut }), [account, signIn, signOut])
  return <AccountContext.Provider value={api}>{children}</AccountContext.Provider>
}

export function useAccount(): AccountApi {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount va usato dentro AccountProvider')
  return ctx
}
