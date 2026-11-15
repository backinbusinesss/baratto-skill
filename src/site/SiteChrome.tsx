import Link from 'next/link'
import { getT, type Lang } from '@/i18n'
import { Logo } from '@/ui/Logo'

/** Barra di navigazione a pillola di vetro, sospesa sopra la pagina. */
export function SiteHeader({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const home = lang === 'en' ? '/en/' : '/'
  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-line bg-paper/75 py-2 pl-4 pr-2 shadow-[0_10px_30px_-18px_rgba(16,22,47,0.45)] backdrop-blur-xl backdrop-saturate-150">
        <Link href={home} aria-label="Baratto Skill">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 text-[0.92rem] font-medium text-muted md:flex">
          {(
            [
              ['come-funziona', tr.t('site.nav.how')],
              ['competenze', tr.t('site.nav.skills')],
              ['mappa', tr.t('site.nav.map')],
              ['prezzi', tr.t('site.nav.pricing')],
              ['faq', tr.t('site.nav.faq')],
            ] as const
          ).map(([id, label]) => (
            <a key={id} href={`${home}#${id}`} className="rounded-full px-3 py-1.5 transition-colors hover:bg-well hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link href={tr.t('site.langHref')} hrefLang={lang === 'it' ? 'en' : 'it'} className="btn btn-ghost btn-sm">
            {tr.t('site.langSwitch')}
          </Link>
          <Link href="/app/" className="btn btn-primary btn-sm">
            {tr.t('common.openApp')}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  return (
    <footer className="overflow-hidden border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">{tr.t('site.footerText')}</p>
          <p className="hand mt-4 text-xl">{tr.t('site.madeIn')}</p>
        </div>
        <div>
          <p className="font-bold">{tr.t('common.appName')}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/app/" className="hover:text-ink">{tr.t('common.openApp')}</Link></li>
            <li><Link href="/app/premium/" className="hover:text-ink">{tr.t('common.premium')}</Link></li>
            <li><Link href={tr.t('site.langHref')} className="hover:text-ink">{tr.t('site.langSwitch')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-bold">{tr.t('site.footerLegal')}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/privacy/" className="hover:text-ink">{tr.t('site.privacy')}</Link></li>
            <li><Link href="/cookie/" className="hover:text-ink">{tr.t('site.cookie')}</Link></li>
            <li><Link href="/termini/" className="hover:text-ink">{tr.t('site.terms')}</Link></li>
          </ul>
        </div>
      </div>
      <p className="wordmark mx-auto mt-10 max-w-6xl select-none px-2 text-center" aria-hidden>
        Baratto
      </p>
      <p className="pb-6 text-center text-xs text-faint">© {new Date().getFullYear()} Baratto Skill</p>
    </footer>
  )
}
