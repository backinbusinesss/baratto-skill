import type { MetadataRoute } from 'next'
import { assetUrl } from '@/lib/asset'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: assetUrl('app/'),
    name: 'Baratto Skill',
    short_name: 'Baratto',
    description: "Scambia competenze con le persone della tua zona: un'ora vale un'ora.",
    start_url: assetUrl('app/'),
    scope: assetUrl(''),
    display: 'standalone',
    orientation: 'portrait',
    lang: 'it',
    dir: 'ltr',
    background_color: '#F4F5F0',
    theme_color: '#2742D9',
    categories: ['social', 'education', 'lifestyle'],
    icons: [
      { src: assetUrl('icons/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: assetUrl('icons/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: assetUrl('icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Vicini', url: assetUrl('app/vicini/'), icons: [{ src: assetUrl('icons/icon-192.png'), sizes: '192x192' }] },
      { name: 'Scambi', url: assetUrl('app/scambi/'), icons: [{ src: assetUrl('icons/icon-192.png'), sizes: '192x192' }] },
      { name: 'Chat', url: assetUrl('app/chat/'), icons: [{ src: assetUrl('icons/icon-192.png'), sizes: '192x192' }] },
    ],
  }
}
