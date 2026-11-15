'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cx } from '@/lib/cx'
import { useApp } from '@/store/app'
import { useT } from '@/store/hooks'
import { Sheet } from '@/ui/Sheet'
import { toast } from '@/ui/Toaster'

export function ReviewSheet({ exchangeId, name, open, onClose }: { exchangeId: string; name: string; open: boolean; onClose(): void }) {
  const tr = useT()
  const review = useApp((s) => s.review)
  const [stars, setStars] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [text, setText] = useState('')
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={tr.t('review.title', { name })}
      closeLabel={tr.t('common.close')}
      footer={
        <button
          className="btn btn-primary btn-lg mb-2 w-full"
          onClick={() => {
            review(exchangeId, { stars, tags, text: text.trim() })
            toast({ text: tr.t('review.thanks'), tone: 'ok', icon: <Star size={18} /> })
            onClose()
          }}
        >
          {tr.t('review.submit')}
        </button>
      }
    >
      <div className="flex justify-center gap-1 py-2" role="radiogroup" aria-label="★">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n}/5`} onClick={() => setStars(n)} className="p-1 transition-transform hover:scale-110">
            <Star size={38} fill={n <= stars ? 'var(--yellow)' : 'transparent'} stroke={n <= stars ? 'var(--yellow-ink)' : 'var(--line-strong)'} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {tr.m.review.tags.map((tag) => {
          const on = tags.includes(tag)
          return (
            <button key={tag} className={cx('chip', on && 'on')} aria-pressed={on} onClick={() => setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])}>
              {tag}
            </button>
          )
        })}
      </div>
      <textarea className="field mt-5" value={text} onChange={(e) => setText(e.target.value)} placeholder={tr.t('review.placeholder')} maxLength={400} aria-label={tr.t('review.placeholder')} />
    </Sheet>
  )
}
