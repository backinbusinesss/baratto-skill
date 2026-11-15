import { Shapes } from 'lucide-react'
import { type CategoryId, categoryById } from '@/content/categories'
import { SKILL_ICONS } from '@/content/skillIcons'
import { skillById } from '@/content/skills'
import { assetUrl } from '@/lib/asset'
import { cx } from '@/lib/cx'
import { CustomIcon } from './customIcons'
import { LUCIDE } from './icons.generated'

/**
 * Un'icona per nome: lucide ("chef-hat"), disegnata ("x-tennis") o bandiera ("flag:gb").
 * Le bandiere sono immagini (public/flags), le altre seguono il colore del testo.
 */
export function NamedIcon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  if (name.startsWith('flag:')) {
    const h = Math.round(size * 0.75)
    return (
      <img
        src={assetUrl(`flags/${name.slice(5)}.svg`)}
        alt=""
        aria-hidden
        width={size}
        height={h}
        loading="lazy"
        className={cx('inline-block shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(16,22,47,0.12)]', className)}
        style={{ width: size, height: h }}
      />
    )
  }
  if (name.startsWith('x-')) return <CustomIcon name={name} size={size} className={className} />
  const I = LUCIDE[name] ?? Shapes
  return <I size={size} className={className} aria-hidden />
}

export function CategoryIcon({ id, size = 18, className }: { id: CategoryId; size?: number; className?: string }) {
  return <NamedIcon name={categoryById(id).icon} size={size} className={className} />
}

/** Il nome dell'icona di una competenza (quella della categoria se manca). */
export function skillIconName(id: string): string {
  return SKILL_ICONS[id] ?? (skillById(id) ? categoryById(skillById(id)!.cat).icon : 'shapes')
}

/** L'icona di una competenza: tennis, chitarra, pasta fresca… o la bandiera della lingua. */
export function SkillIcon({ id, size = 18, className }: { id: string; size?: number; className?: string }) {
  return <NamedIcon name={skillIconName(id)} size={size} className={className} />
}

/**
 * Icona della competenza in un "gettone" colorato con il colore della categoria
 * (per elenchi, intestazioni e chip grandi).
 */
export function SkillBadgeIcon({ id, size = 36, className }: { id: string; size?: number; className?: string }) {
  const s = skillById(id)
  const color = s ? categoryById(s.cat).color : 'var(--faint)'
  const isFlag = skillIconName(id).startsWith('flag:')
  return (
    <span
      className={cx('grid shrink-0 place-items-center rounded-[30%]', className)}
      style={{ width: size, height: size, color, background: `color-mix(in srgb, ${color} 14%, var(--sheet))` }}
      aria-hidden
    >
      <SkillIcon id={id} size={Math.round(size * (isFlag ? 0.62 : 0.52))} />
    </span>
  )
}
