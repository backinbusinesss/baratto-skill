import Link from 'next/link'
import { getT, type Lang } from '@/i18n'
import { Logo } from '@/ui/Logo'

export function SiteHeader({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const home = lang === 'en' ? '/en/' : '/'
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={home} aria-label="Baratto Skill">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-[0.95rem] font-medium text-muted md:flex">
          <a href={`${home}#come-funziona`} className="hover:text-ink">{tr.t('site.nav.how')}</a>
          <a href={`${home}#competenze`} className="hover:text-ink">{tr.t('site.nav.skills')}</a>
          <a href={`${home}#mappa`} className="hover:text-ink">{tr.t('site.nav.map')}</a>
          <a href={`${home}#prezzi`} className="hover:text-ink">{tr.t('site.nav.pricing')}</a>
          <a href={`${home}#faq`} className="hover:text-ink">{tr.t('site.nav.faq')}</a>
        </nav>
        <div className="flex items-center gap-2">
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
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
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
      <p className="pb-8 text-center text-xs text-faint">© {new Date().getFullYear()} Baratto Skill</p>
    </footer>
  )
}
