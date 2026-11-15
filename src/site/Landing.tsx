import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CATEGORIES, categoryById } from '@/content/categories'
import { COMUNI } from '@/content/comuni'
import { SKILLS } from '@/content/skills'
import { getPeople } from '@/domain/people'
import { getT, type Lang } from '@/i18n'
import { CategoryIcon } from '@/ui/Icon'
import { ItalyMap } from '@/ui/ItalyMap'
import { Bento } from './Bento'
import { Counter, FillStatement, Marquee, Reveal, RevealItem, SmoothScroll, WordRise } from './fx'
import { HeroStage } from './HeroStage'
import { Pricing } from './Pricing'
import { SiteDemo } from './SiteDemo'
import { SiteFooter, SiteHeader } from './SiteChrome'
import { StoryStack } from './StoryStack'

export function Landing({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const people = getPeople()
  // un campione per la mappa: basta a dare l'idea, senza appesantire la pagina
  const sample = people.filter((_, i) => i % 3 === 0)
  const rowA = SKILLS.filter((_, i) => i % 6 === 0)
  const rowB = SKILLS.filter((_, i) => i % 6 === 3)

  const chip = (id: string) => {
    const s = SKILLS.find((x) => x.id === id)!
    return (
      <span key={id} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sheet px-4 py-2 text-[0.95rem] font-medium shadow-paper">
        <span style={{ color: categoryById(s.cat).color }}>
          <CategoryIcon id={s.cat} size={15} />
        </span>
        {tr.skill(id)}
      </span>
    )
  }

  return (
    <div lang={lang} className="overflow-x-clip">
      <SmoothScroll />
      <SiteHeader lang={lang} />
      <main>
        {/* hero */}
        <section className="relative">
          <div className="hero-glow left-[-10%] top-[-6rem] h-[28rem] w-[28rem] bg-cobalt/40" aria-hidden />
          <div className="hero-glow right-[-6%] top-[10rem] h-[24rem] w-[24rem] bg-yellow/60" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 lg:grid-cols-[1.08fr_1fr] lg:pb-28 lg:pt-36">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-sheet/70 px-3 py-1.5 text-sm font-medium text-muted backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
                </span>
                {tr.t('site.stage.live', { people: people.length.toLocaleString(tr.locale, { useGrouping: 'always' } as Intl.NumberFormatOptions), cities: COMUNI.length })}
              </p>
              <h1 className="display mt-6 text-[clamp(3.2rem,8.4vw,6.4rem)] [perspective:900px]">
                <WordRise lines={[{ text: tr.t('site.heroTitle1') }, { text: tr.t('site.heroTitle2'), className: 'text-cobalt' }]} />
              </h1>
              <p className="mt-7 max-w-[33rem] text-lg leading-relaxed text-muted">{tr.t('site.heroText')}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/app/" className="btn btn-primary btn-lg shadow-[0_18px_40px_-16px_var(--cobalt)]">
                  {tr.t('site.heroCta')} <ArrowRight size={18} />
                </Link>
                <a href="#come-funziona" className="btn btn-outline btn-lg">
                  {tr.t('site.heroCta2')}
                </a>
              </div>
              <p className="mt-4 text-sm text-faint">{tr.t('site.heroNote')}</p>
            </div>
            <HeroStage lang={lang} />
          </div>
        </section>

        {/* nastri di competenze */}
        <section aria-label={tr.t('site.marqueeLabel')} className="space-y-3 pb-8">
          <Marquee speed={70}>{rowA.map((s) => chip(s.id))}</Marquee>
          <Marquee speed={80} reverse>
            {rowB.map((s) => chip(s.id))}
          </Marquee>
        </section>

        {/* numeri */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {[
              [SKILLS.length, tr.t('site.statSkills')],
              [CATEGORIES.length, tr.t('site.statCategories')],
              [COMUNI.length, tr.t('site.statCities')],
              [people.length, tr.t('site.statPeople')],
            ].map(([n, label]) => (
              <RevealItem key={String(label)} className="border-l border-line-strong pl-5">
                <Counter to={n as number} locale={tr.locale} className="block text-[clamp(3.4rem,8vw,6rem)] font-extrabold leading-none tracking-tight [font-stretch:62%]" />
                <span className="mt-2 block text-muted">{label}</span>
              </RevealItem>
            ))}
          </Reveal>
        </section>

        {/* frase che si inchiostra */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:py-28">
          <FillStatement text={tr.t('site.statement')} className="text-[clamp(2rem,4.6vw,3.9rem)] font-bold leading-[1.08] tracking-[-0.02em] [font-stretch:86%]" />
        </section>

        {/* come funziona: mazzo di carte */}
        <section id="come-funziona" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6">
          <h2 className="display mb-10 text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.howTitle')}</h2>
          <StoryStack lang={lang} />
        </section>

        {/* funzioni */}
        <section id="competenze" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.bento.title')}</h2>
            <p className="mt-4 text-lg text-muted">{tr.t('site.bento.text')}</p>
          </div>
          <Bento lang={lang} />
        </section>

        {/* l'unica pausa scura: la demo interattiva */}
        <section className="relative overflow-hidden bg-[#0b0f22] py-24 text-[#eef0fa] lg:py-32">
          <div className="hero-glow left-1/2 top-[-12rem] h-[30rem] w-[44rem] -translate-x-1/2 bg-cobalt/70" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.demoTitle')}</h2>
            <p className="mt-4 max-w-2xl text-lg text-[#eef0fa]/75">{tr.t('site.demoText')}</p>
            <div className="mt-12 rounded-[28px] border border-white/10 bg-paper p-5 text-ink shadow-[0_40px_120px_-40px_rgba(111,134,255,0.6)] sm:p-9">
              <SiteDemo lang={lang} />
            </div>
          </div>
        </section>

        {/* mappa */}
        <section id="mappa" className="scroll-mt-24 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
            <Reveal>
              <RevealItem>
                <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.mapTitle')}</h2>
              </RevealItem>
              <RevealItem>
                <p className="mt-5 text-lg text-muted">{tr.t('site.mapText', { count: COMUNI.length })}</p>
              </RevealItem>
              <RevealItem>
                <Link href="/app/" className="btn btn-primary btn-lg mt-8">
                  {tr.t('site.heroCta')} <ArrowRight size={18} />
                </Link>
              </RevealItem>
            </Reveal>
            <div className="relative mx-auto w-full max-w-[480px]">
              <div className="hero-glow inset-[15%] bg-cobalt/30" aria-hidden />
              <ItalyMap
                className="relative"
                label={tr.t('site.mapTitle')}
                dots={sample.map((p) => ({ id: p.id, lat: p.lat, lon: p.lon, tone: p.premium ? 'premium' : p.seed % 4 === 0 ? 'perfect' : 'match' }))}
              />
            </div>
          </div>
        </section>

        {/* voci */}
        <section className="relative overflow-hidden bg-cobalt py-24 text-white">
          <div className="hero-glow right-[-10%] top-[-10rem] h-[26rem] w-[26rem] bg-yellow/40" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.voicesTitle')}</h2>
            <Reveal className="mt-12 grid gap-6 md:grid-cols-3">
              {tr.m.site.voices.map(([q, who], i) => (
                <RevealItem key={who}>
                  <figure className="paper h-full p-7 text-[#10162f]" style={{ transform: `rotate(${(i - 1) * 1.5}deg)` }}>
                    <blockquote className="hand text-[1.65rem] leading-tight">“{q}”</blockquote>
                    <figcaption className="mt-5 text-sm font-semibold text-[#565d75]">{who}</figcaption>
                  </figure>
                </RevealItem>
              ))}
            </Reveal>
          </div>
        </section>

        {/* prezzi */}
        <section id="prezzi" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6 lg:py-32">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.pricingTitle')}</h2>
            <p className="mt-4 text-lg text-muted">{tr.t('site.pricingText')}</p>
          </div>
          <Pricing lang={lang} />
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-24 sm:px-6">
          <h2 className="display text-[clamp(2.8rem,6.5vw,5rem)]">{tr.t('site.faqTitle')}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {tr.m.site.faq.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-well text-xl transition-transform duration-300 group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[65ch] text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* invito finale */}
        <section className="px-4 pb-16 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-yellow px-6 py-20 text-center text-[#10162f] sm:px-12">
            <div className="hero-glow left-1/2 top-[-8rem] h-[20rem] w-[36rem] -translate-x-1/2 bg-white/80" aria-hidden />
            <h2 className="display relative text-[clamp(3.2rem,9vw,6.8rem)]">{tr.t('site.ctaTitle')}</h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg">{tr.t('site.ctaText')}</p>
            <Link href="/app/" className="btn btn-lg relative mt-9 !bg-[#10162f] !text-white shadow-[0_20px_40px_-18px_#10162f]">
              {tr.t('site.heroCta')} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </div>
  )
}
