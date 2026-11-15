import type { Theme } from '@/store/app'

export const THEME_COLORS = { light: '#F5EFE3', dark: '#14120F' }

export function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const resolved = resolveTheme(theme)
  document.documentElement.dataset.theme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved])
}

/**
 * Script in linea nel <head>: imposta il tema prima che la pagina venga disegnata,
 * così non c'è il lampo di colore sbagliato. Legge le impostazioni salvate se ci sono.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t='system';try{var s=JSON.parse(localStorage.getItem('baratto-skill:v1')||'null');if(s&&s.state&&s.state.settings&&s.state.settings.theme)t=s.state.settings.theme}catch(e){}if(t==='system')t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`
