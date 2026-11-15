import { Check, Search, Sparkles } from 'lucide-react'
import { getT, type Lang } from '@/i18n'
import { Avatar } from '@/ui/Avatar'
import { SkillIcon } from '@/ui/Icon'

/**
 * "Come funziona" come mazzo di carte: ogni passo resta appiccicato un po' più in basso
 * del precedente e cambia tono, così scorrendo si sfoglia il mazzo. Solo CSS (position: sticky).
 */
export function StoryStack({ lang }: { lang: Lang }) {
  const tr = getT(lang)
  const steps = tr.m.site.how
  const visuals = [
    <div key="0" className="flex flex-wrap gap-2">
      {['english', 'fresh-pasta', 'photography', 'canva', 'guitar', 'excel'].map((id, i) => (
        <span key={id} className={i < 3 ? 'chip on !min-h-10 !px-4' : 'chip !min-h-10 !px-4'}>
          {i < 3 ? <Check size={14} /> : <SkillIcon id={id} size={15} />}
          {tr.skill(id)}
        </span>
      ))}
    </div>,
    <div key="1" className="space-y-2">
      <div className="flex items-center gap-2 rounded-full bg-sheet px-4 py-2.5 shadow-paper">
        <Search size={16} className="text-faint" />
        <span className="text-muted">{tr.skill('pc-repair')}</span>
        <span className="ml-auto rounded-full bg-mint-soft px-2 py-0.5 text-xs font-bold text-mint-ink">14</span>
      </div>
      {['Ivan', 'Rita'].map((n, i) => (
        <div key={n} className="flex items-center gap-3 rounded-2xl bg-sheet p-3 shadow-paper">
          <Avatar seed={`story-${n}`} name={n} size={36} />
          <span className="flex-1 text-sm font-semibold">
            {n} <span className="font-normal text-muted">· {i ? '3,2 km' : '1,1 km'}</span>
          </span>
          <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-bold text-mint-ink">{tr.t('kinds.perfect')}</span>
        </div>
      ))}
    </div>,
    <div key="2" className="flex items-end gap-6">
      <p className="num text-[5.5rem] font-extrabold leading-[0.8] text-cobalt" style={{ fontStretch: '62%' }}>
        +1h
      </p>
      <p className="hand max-w-[12rem] text-[1.6rem] leading-tight">
        <Sparkles size={18} className="mb-1 inline text-yellow-ink" /> {tr.t('site.spendAnywhere')}
      </p>
    </div>,
  ]
  const tones = ['bg-sheet', 'bg-[color-mix(in_srgb,var(--yellow)_22%,var(--sheet))]', 'bg-mint-soft']
  return (
    <ol className="story">
      {steps.map(([title, text], i) => (
        <li key={title} className={`story-card ${tones[i]}`} style={{ top: 96 + i * 18 }}>
          <div className="flex items-center justify-between text-sm font-semibold text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cobalt" />
              {tr.t('site.nav.how')}
            </span>
            <span className="num">
              0{i + 1} / 0{steps.length}
            </span>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <h3 className="display text-[clamp(2.6rem,5.5vw,4.4rem)]">{title}</h3>
              <p className="mt-4 max-w-md text-lg text-muted">{text}</p>
            </div>
            <div>{visuals[i]}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
