import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/caveat/latin-600.css'
import './globals.css'
import { assetUrl } from '@/lib/asset'
import { SwRegister } from '@/lib/registerSw'
import { THEME_BOOT_SCRIPT, THEME_COLORS } from '@/lib/theme'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Baratto Skill — io ti insegno, tu mi insegni',
    template: '%s · Baratto Skill',
  },
  description:
    "Scambia competenze con le persone della tua zona: un'ora di inglese per un'ora di aiuto con il PC. Oltre 400 competenze, banca del tempo, scambi a tre. Senza soldi.",
  applicationName: 'Baratto Skill',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: ['en_GB'],
    siteName: 'Baratto Skill',
    title: 'Baratto Skill — io ti insegno, tu mi insegni',
    description: 'Scambia competenze con chi ti sta vicino. Un’ora vale un’ora.',
    images: [{ url: assetUrl('og.png'), width: 1200, height: 630, alt: 'Baratto Skill' }],
  },
  twitter: { card: 'summary_large_image', images: [assetUrl('og.png')] },
  icons: {
    icon: [{ url: assetUrl('icon.svg'), type: 'image/svg+xml' }],
    apple: [{ url: assetUrl('icons/apple-touch-icon.png'), sizes: '180x180' }],
  },
  appleWebApp: { capable: true, title: 'Baratto Skill', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_COLORS.light,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="grain antialiased">
        <div className="relative z-[1]">{children}</div>
        <SwRegister />
      </body>
    </html>
  )
}
