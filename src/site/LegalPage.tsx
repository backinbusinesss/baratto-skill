import Link from 'next/link'
import type { ReactNode } from 'react'
import { SiteFooter, SiteHeader } from './SiteChrome'

/** Impaginazione comune delle pagine legali (in italiano, con una nota per chi legge in inglese). */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader lang="it" />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="display text-[clamp(2.8rem,8vw,4.4rem)]">{title}</h1>
        <p className="mt-3 text-sm text-muted">Ultimo aggiornamento: {updated}</p>
        <p className="mt-2 text-sm text-faint" lang="en">
          English readers: this page is available in Italian only. Baratto Skill is a demo and stores no personal data on any server.
        </p>
        <div className="legal mt-10 space-y-5 text-[1.02rem] leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_a]:text-cobalt [&_a]:underline">
          {children}
        </div>
        <p className="mt-12">
          <Link href="/" className="btn btn-outline">
            Torna al sito
          </Link>
        </p>
      </main>
      <SiteFooter lang="it" />
    </>
  )
}
