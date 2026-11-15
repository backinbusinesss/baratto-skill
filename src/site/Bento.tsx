import { CalendarPlus, Check, Crown, Hourglass, MapPin } from 'lucide-react'
import { BADGES } from '@/domain/badges'
import { getT, type Lang } from '@/i18n'
import { Avatar } from '@/ui/Avatar'
import { NamedIcon } from '@/ui/Icon'
import { Reveal, RevealItem } from './fx'

/** Le funzioni dell'app come piccole interfacce vive (HTML e CSS, niente immagini). */
export function Bento({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const b = tr.m.site.bento

  return (
    <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-6" stagger={0.07}>
      {/* abbinamento */}
      <RevealItem className="bento md:col-span-4">
        <BentoHead title={b.matchTitle} text={b.matchText} />
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <MiniPerson seed="bento-giulia" name="Giulia" give={tr.skill('english')} wants={tr.skill('pc-repair')} />
          <div className="relative mx-auto grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mint text-white shadow-lg sm:mx-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
            </svg>
            <span className="absolute inset-0 animate-ping rounded-full bg-mint/40" aria-hidden />
          </div>
          <MiniPerson seed="bento-ivan" name="Ivan" give={tr.skill('pc-repair')} wants={tr.skill('english')} />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <span className="rounded-full bg-mint-soft px-2.5 py-1 text-xs font-bold text-mint-ink">{tr.t('kinds.perfect')}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-well">
            <span className="bento-bar block h-full rounded-full bg-mint" />
          </span>
          <span className="num text-sm font-bold">96%</span>
        </div>
      </RevealItem>

      {/* banca del tempo */}
      <RevealItem className="bento bento-ink md:col-span-2">
        <BentoHead dark title={b.bankTitle} text={b.bankText} />
        <div className="mt-5 flex items-end gap-4">
          <svg viewBox="0 0 60 100" className="h-24 w-auto" aria-hidden>
            <path d="M8 4h44M8 96h44" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M12 6c0 22 14 30 18 44-4 14-18 22-18 44h36c0-22-14-30-18-44 4-14 18-22 18-44z" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2.5" />
            <clipPath id="bento-hg">
              <path d="M12 6c0 22 14 30 18 44-4 14-18 22-18 44h36c0-22-14-30-18-44 4-14 18-22 18-44z" />
            </clipPath>
            <g clipPath="url(#bento-hg)">
              <rect className="sand-top" x="0" y="20" width="60" height="30" fill="var(--yellow)" />
              <rect className="sand-bottom" x="0" y="70" width="60" height="30" fill="var(--yellow)" />
              <rect className="sand-stream" x="29" y="48" width="2" height="46" fill="var(--yellow)" />
            </g>
          </svg>
          <ul className="flex-1 space-y-1.5 text-sm">
            <li className="flex justify-between"><span className="opacity-70">{tr.skill('english')}</span><span className="num font-bold text-mint">+1 h</span></li>
            <li className="flex justify-between"><span className="opacity-70">{tr.skill('pc-repair')}</span><span className="num font-bold">−1 h</span></li>
            <li className="flex justify-between"><span className="opacity-70">{tr.skill('fresh-pasta')}</span><span className="num font-bold text-mint">+1,5 h</span></li>
          </ul>
        </div>
      </RevealItem>

      {/* chat */}
      <RevealItem className="bento md:col-span-2">
        <BentoHead title={b.chatTitle} text={b.chatText} />
        <div className="mt-5 space-y-2 text-[0.82rem]">
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-well px-3 py-2">{b.chat1}</p>
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-cobalt px-3 py-2 text-on-cobalt">{b.chat2}</p>
          <span className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-well px-3 py-2.5" aria-label={b.typing}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        </div>
      </RevealItem>

      {/* raggio */}
      <RevealItem className="bento md:col-span-2">
        <BentoHead title={b.radiusTitle} text={b.radiusText} />
        <div className="relative mx-auto mt-4 aspect-square w-40" aria-hidden>
          <span className="absolute inset-0 rounded-full border-2 border-dashed border-cobalt/60 bg-cobalt/8" />
          <span className="radar absolute inset-0 rounded-full" />
          {[
            [22, 30, 'var(--mint)'],
            [70, 24, 'var(--cobalt)'],
            [64, 70, 'var(--mint)'],
            [30, 66, 'var(--cobalt)'],
            [48, 16, 'var(--yellow)'],
            [82, 52, 'var(--cobalt)'],
          ].map(([x, y, c], i) => (
            <span key={i} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-sheet" style={{ left: `${x}%`, top: `${y}%`, background: c as string }} />
          ))}
          <MapPin size={22} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full fill-coral text-coral" />
        </div>
      </RevealItem>

      {/* agenda */}
      <RevealItem className="bento md:col-span-2">
        <BentoHead title={b.agendaTitle} text={b.agendaText} />
        <div className="ticket mt-5 shadow-paper" style={{ ['--cut' as string]: '64%' }}>
          <div className="grid grid-cols-[64%_36%]">
            <div className="p-3.5">
              <div className="flex items-center gap-2">
                <Avatar seed="bento-sara" name="Sara" size={26} />
                <span className="text-sm font-bold">Sara</span>
              </div>
              <p className="mt-2 text-xs text-muted">{tr.skill('guitar')} ⇄ {tr.skill('photography')}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-well px-2 py-0.5 text-[0.7rem] font-semibold">
                <CalendarPlus size={12} /> .ics
              </span>
            </div>
            <div className="perforation flex flex-col items-center justify-center text-center">
              <span className="text-xs text-muted">{b.day}</span>
              <span className="num text-3xl font-extrabold leading-none" style={{ fontStretch: '70%' }}>21</span>
              <span className="text-[0.68rem] text-muted">10:00</span>
            </div>
          </div>
        </div>
      </RevealItem>

      {/* scambi a tre */}
      <RevealItem className="bento md:col-span-3">
        <BentoHead title={b.triadTitle} text={b.triadText} />
        <div className="relative mx-auto mt-4 h-36 w-56" aria-hidden>
          <svg viewBox="0 0 224 144" className="absolute inset-0 text-line-strong">
            <path id="triad-path" d="M112 22 L196 118 L28 118 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 5" />
          </svg>
          <span className="triad-dot absolute left-0 top-0 h-3 w-3 rounded-full bg-yellow ring-2 ring-ink" />
          <span className="absolute left-1/2 top-0 -translate-x-1/2"><Avatar seed="bento-tu" name="Tu" size={44} /></span>
          <span className="absolute bottom-0 right-0"><Avatar seed="bento-b" name="Marta" size={44} /></span>
          <span className="absolute bottom-0 left-0"><Avatar seed="bento-c" name="Leo" size={44} /></span>
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted">
          <Crown size={13} className="text-yellow-ink" /> {b.withPremium}
        </p>
      </RevealItem>

      {/* badge */}
      <RevealItem className="bento md:col-span-3">
        <BentoHead title={b.badgesTitle} text={b.badgesText} />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {BADGES.slice(2, 8).map((b, i) => (
            <span
              key={b.id}
              className="stamp grid h-16 w-16 place-items-center"
              style={{ color: b.color, transform: `rotate(${(i % 3) * 6 - 6}deg)`, background: `color-mix(in srgb, ${b.color} 12%, var(--sheet))` }}
              title={tr.m.badges[b.id][0]}
            >
              <NamedIcon name={b.icon} size={24} />
            </span>
          ))}
        </div>
      </RevealItem>
    </Reveal>
  )
}

function BentoHead({ title, text, dark }: { title: string; text: string; dark?: boolean }) {
  return (
    <div>
      <h3 className="text-[1.35rem]">{title}</h3>
      <p className={dark ? 'mt-1 text-sm opacity-70' : 'mt-1 text-sm text-muted'}>{text}</p>
    </div>
  )
}

function MiniPerson({ seed, name, give, wants }: { seed: string; name: string; give: string; wants: string }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl bg-paper p-3">
      <Avatar seed={seed} name={name} size={40} />
      <div className="min-w-0 text-sm">
        <p className="font-bold">{name}</p>
        <p className="truncate text-muted">
          <Check size={12} className="mr-1 inline text-mint" />
          {give}
        </p>
        <p className="truncate text-muted">
          <Hourglass size={12} className="mr-1 inline text-cobalt" />
          {wants}
        </p>
      </div>
    </div>
  )
}
