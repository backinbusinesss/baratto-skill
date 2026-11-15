import { getT, type Lang } from '@/i18n'

/**
 * La bacheca dell'hero: volantini scritti "a mano" con le linguette.
 * Una sola animazione all'apertura: la linguetta evidenziata si stacca e scende.
 */
export function HeroBoard({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const flyers = [
    { title: tr.skill('english'), note: lang === 'it' ? 'conversazione, anche online' : 'conversation, online too', tabs: ['Marta', 'Luca', 'Wei', 'Sara'], rot: -4, pin: 'var(--coral)', x: '0%', y: '6%', w: '52%' },
    { title: tr.skill('pc-repair'), note: lang === 'it' ? 'in cambio di inglese?' : 'swap for English?', tabs: ['Giorgio', 'Ivan', 'Anna', 'Dario'], rot: 3, pin: 'var(--cobalt)', x: '47%', y: '0%', w: '50%', tear: 1 },
    { title: tr.skill('fresh-pasta'), note: lang === 'it' ? 'come la nonna' : 'like grandma’s', tabs: ['Olena', 'Pietro', 'Ada'], rot: -1.5, pin: 'var(--mint)', x: '10%', y: '52%', w: '44%' },
    { title: tr.skill('guitar'), note: lang === 'it' ? 'primi accordi' : 'first chords', tabs: ['Jonas', 'Rita', 'Leo'], rot: 5, pin: 'var(--yellow)', x: '55%', y: '50%', w: '40%' },
  ]
  return (
    <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[520px]" aria-hidden>
      {flyers.map((f, i) => (
        <div key={i} className="absolute" style={{ left: f.x, top: f.y, width: f.w, transform: `rotate(${f.rot}deg)` }}>
          <div className="flyer px-4 pb-4 pt-6">
            <span className="flyer-pin" style={{ ['--pin' as string]: f.pin }} />
            <p className="hand text-[clamp(1.5rem,4.2vw,2.2rem)] leading-[0.95]">{f.title}!</p>
            <p className="hand mt-1 text-[clamp(1rem,2.4vw,1.25rem)] leading-tight text-muted">{f.note}</p>
          </div>
          <div className="tabs-row !overflow-visible">
            {f.tabs.map((t, j) => (
              <span key={t} className={`tear-tab !max-h-[5.5rem] !text-[0.72rem] ${f.tear === j ? 'hero-tear hit' : ''}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .hero-tear { animation: tear 1.6s 0.9s cubic-bezier(.3,.7,.2,1) both; }
          @keyframes tear {
            0% { transform: rotate(180deg); }
            35% { transform: rotate(180deg) translateY(-8px) rotate(-6deg); }
            100% { transform: rotate(180deg) translateY(-46px) translateX(-10px) rotate(-14deg); box-shadow: 0 10px 18px -8px rgba(16,22,47,.5); }
          }
        }
      `}</style>
    </div>
  )
}
