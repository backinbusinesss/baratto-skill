import { ArrowRight, Check, Crown } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES } from '@/content/categories'
import { COMUNI } from '@/content/comuni'
import { SKILLS, skillsInCategory } from '@/content/skills'
import { getPeople } from '@/domain/people'
import { formatPrice, PLANS, PREMIUM_RADIUS_KM, TRIAL_DAYS, yearlySavingPct } from '@/domain/plans'
import { getT, type Lang } from '@/i18n'
import { CategoryIcon } from '@/ui/Icon'
import { ItalyMap } from '@/ui/ItalyMap'
import { HeroBoard } from './HeroBoard'
import { SiteDemo } from './SiteDemo'
import { SiteFooter, SiteHeader } from './SiteChrome'

export function Landing({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const people = getPeople()
  // un campione per la mappa: basta a dare l'idea, senza appesantire la pagina
  const sample = people.filter((_, i) => i % 3 === 0)
  const free = PLANS.free

  return (
    <div lang={lang}>
      <SiteHeader lang={lang} />
      <main>
        {/* hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
          <div>
            <h1 className="display text-[clamp(3.6rem,11vw,7.4rem)]">
              {tr.t('site.heroTitle1')}
              <br />
              <span className="text-cobalt">{tr.t('site.heroTitle2')}</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted">{tr.t('site.heroText')}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/app/" className="btn btn-primary btn-lg">
                {tr.t('site.heroCta')} <ArrowRight size={18} />
              </Link>
              <a href="#come-funziona" className="btn btn-outline btn-lg">
                {tr.t('site.heroCta2')}
              </a>
            </div>
            <p className="mt-4 text-sm text-faint">{tr.t('site.heroNote')}</p>
          </div>
          <HeroBoard lang={lang} />
        </section>

        {/* numeri, in una riga di testo */}
        <div className="border-y border-line bg-sheet">
          <p className="mx-auto max-w-6xl px-4 py-5 text-center text-[1.05rem] sm:px-6">
            <strong className="num text-cobalt">{SKILLS.length}</strong> {tr.t('site.statSkills')}, <strong className="num text-cobalt">{CATEGORIES.length}</strong> {tr.t('site.statCategories')},{' '}
            <strong className="num text-cobalt">{COMUNI.length}</strong> {tr.t('site.statCities')} {tr.t('common.and')} <strong className="num text-cobalt">{people.length.toLocaleString(tr.locale)}</strong>{' '}
            {tr.t('site.statPeople')}.
          </p>
        </div>

        {/* come funziona: tre passi in sequenza */}
        <section id="come-funziona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.howTitle')}</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {tr.m.site.how.map(([title, text], i) => (
              <li key={title} className="ticket p-6 shadow-paper" style={{ ['--cut' as string]: '100%' }}>
                <span className="num text-[3.4rem] font-extrabold leading-none text-cobalt" style={{ fontStretch: '62%' }}>
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[1.45rem]">{title}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* demo interattiva */}
        <section className="bg-ink py-20 text-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.demoTitle')}</h2>
            <p className="mt-3 max-w-2xl opacity-75">{tr.t('site.demoText')}</p>
            <div className="mt-10 rounded-3xl bg-paper p-5 text-ink sm:p-8" data-theme-scope>
              <SiteDemo lang={lang} />
            </div>
          </div>
        </section>

        {/* il catalogo come muro di parole */}
        <section id="competenze" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.catsTitle')}</h2>
              <p className="mt-4 text-lg text-muted">{tr.t('site.catsText')}</p>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2">
                {CATEGORIES.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-[0.95rem]">
                    <span style={{ color: c.color }}>
                      <CategoryIcon id={c.id} size={17} />
                    </span>
                    <span className="flex-1">{tr.cat(c.id)}</span>
                    <span className="num text-sm text-faint">{skillsInCategory(c.id).length}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[1.05rem] leading-[1.9] text-muted" aria-label={tr.t('site.catsTitle')}>
              {SKILLS.filter((_, i) => i % 2 === 0).map((s, i) => (
                <span key={s.id}>
                  <span
                    className={i % 7 === 0 ? 'font-extrabold text-ink' : i % 3 === 0 ? 'font-semibold text-ink/80' : ''}
                    style={{ fontSize: i % 7 === 0 ? '1.35em' : undefined, fontStretch: i % 5 === 0 ? '75%' : '100%' }}
                  >
                    {tr.skill(s.id)}
                  </span>
                  <span className="text-line-strong"> / </span>
                </span>
              ))}
              <span className="hand text-2xl text-cobalt">…+{SKILLS.length - Math.ceil(SKILLS.length / 2)}</span>
            </p>
          </div>
        </section>

        {/* mappa */}
        <section id="mappa" className="scroll-mt-20 border-y border-line bg-sheet py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.mapTitle')}</h2>
              <p className="mt-4 text-lg text-muted">{tr.t('site.mapText', { count: COMUNI.length })}</p>
              <Link href="/app/" className="btn btn-primary mt-8">
                {tr.t('site.heroCta')} <ArrowRight size={18} />
              </Link>
            </div>
            <div className="mx-auto w-full max-w-[460px]">
              <ItalyMap
                label={tr.t('site.mapTitle')}
                dots={sample.map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, tone: p.premium ? 'premium' : p.seed % 4 === 0 ? 'perfect' : 'match' }))}
              />
            </div>
          </div>
        </section>

        {/* banca del tempo */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.bankTitle')}</h2>
              <p className="mt-4 max-w-xl text-lg text-muted">{tr.t('site.bankText')}</p>
              <ul className="mt-6 space-y-2">
                {tr.m.site.bankPoints.map((b) => (
                  <li key={b} className="flex items-center gap-2 font-medium">
                    <Check size={18} className="text-mint" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ticket mx-auto w-full max-w-sm shadow-paper" style={{ ['--cut' as string]: '58%' }}>
              <div className="grid grid-cols-[58%_42%]">
                <div className="p-5">
                  <p className="text-sm text-muted">{tr.t('site.ticketGive')}</p>
                  <p className="hand text-3xl leading-none">{tr.skill('english')}</p>
                  <p className="mt-4 text-sm text-muted">{tr.t('site.ticketGet')}</p>
                  <p className="hand text-3xl leading-none">{tr.skill('pc-repair')}</p>
                </div>
                <div className="perforation flex flex-col items-center justify-center p-4 text-center">
                  <span className="num text-[3.4rem] font-extrabold leading-none" style={{ fontStretch: '62%' }}>
                    1:1
                  </span>
                  <span className="text-xs text-muted">{tr.t('propose.balanceEven')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* voci */}
        <section className="bg-cobalt py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.voicesTitle')}</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {tr.m.site.voices.map(([q, who], i) => (
                <figure key={who} className="paper p-6 text-[#10162f]" style={{ transform: `rotate(${(i - 1) * 1.5}deg)` }}>
                  <blockquote className="hand text-[1.55rem] leading-tight">“{q}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-[#565d75]">{who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* prezzi */}
        <section id="prezzi" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <h2 className="display max-w-3xl text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.pricingTitle')}</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">{tr.t('site.pricingText')}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="sheet p-6">
              <p className="font-bold">{tr.t('premium.free')}</p>
              <p className="num mt-2 text-5xl font-extrabold" style={{ fontStretch: '70%' }}>0 €</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex gap-2"><Check size={16} className="text-mint" /> {tr.t('premium.freeLimits.proposals', { n: free.proposalsPerMonth ?? 0 })}</li>
                <li className="flex gap-2"><Check size={16} className="text-mint" /> {tr.t('premium.freeLimits.active', { n: free.activeExchanges ?? 0 })}</li>
                <li className="flex gap-2"><Check size={16} className="text-mint" /> {tr.t('premium.freeLimits.radius', { km: free.maxRadiusKm })}</li>
              </ul>
            </div>
            {(['premium-monthly', 'premium-yearly'] as const).map((id) => {
              const p = PLANS[id]
              const yearly = id === 'premium-yearly'
              return (
                <div key={id} className={`relative rounded-[14px] p-6 ${yearly ? 'bg-ink text-paper' : 'sheet'}`}>
                  {yearly && <span className="absolute -top-3 right-4 rotate-2 rounded-md bg-yellow px-2.5 py-1 text-xs font-bold text-[#10162f]">{tr.t('premium.save', { pct: yearlySavingPct() })}</span>}
                  <p className="flex items-center gap-1.5 font-bold">
                    <Crown size={16} className={yearly ? 'text-yellow' : 'text-yellow-ink'} /> {yearly ? tr.t('premium.yearly') : tr.t('premium.monthly')}
                  </p>
                  <p className="mt-2">
                    <span className="num text-5xl font-extrabold" style={{ fontStretch: '70%' }}>{formatPrice(p.priceCents, lang)}</span>
                    <span className="text-sm opacity-70">{yearly ? tr.t('premium.perYear') : tr.t('premium.perMonth')}</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {[tr.t('premium.features.featured'), tr.t('premium.features.unlimited'), tr.t('premium.features.radius', { km: PREMIUM_RADIUS_KM }), tr.t('premium.features.triads'), tr.t('premium.features.filters')].map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check size={16} className={yearly ? 'text-yellow' : 'text-mint'} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/app/premium/" className={`btn mt-6 w-full ${yearly ? 'btn-yellow' : 'btn-primary'}`}>
                    {tr.t('premium.trial', { days: TRIAL_DAYS })}
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-20 sm:px-6">
          <h2 className="display text-[clamp(2.6rem,6vw,4.2rem)]">{tr.t('site.faqTitle')}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {tr.m.site.faq.map(([q, a]) => (
              <details key={q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-well text-xl transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-[65ch] text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* invito finale */}
        <section className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[28px] bg-yellow px-6 py-14 text-center text-[#10162f] sm:px-12">
            <h2 className="display text-[clamp(3rem,8vw,5.6rem)]">{tr.t('site.ctaTitle')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg">{tr.t('site.ctaText')}</p>
            <Link href="/app/" className="btn btn-ink btn-lg mt-8 !bg-[#10162f] !text-white">
              {tr.t('site.heroCta')} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </div>
  )
}
