/**
 * Dopo `next build` con `output: 'export'`: Next 16 scrive i pezzi di pagina per la navigazione
 * client in sottocartelle (out/app/profilo/__next.app/profilo/__PAGE__.txt), ma il browser li
 * chiede con i punti al posto delle barre (out/app/profilo/__next.app.profilo.__PAGE__.txt).
 * Su un hosting statico (GitHub Pages) quelle richieste darebbero 404: qui si creano le copie.
 *
 * Uso: node scripts/flatten-rsc.mjs [cartella]
 */
import { copyFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/**
 * Dal percorso annidato al nome piatto, o null se il file non va copiato.
 * "app/profilo/__next.app/profilo/__PAGE__.txt" → "app/profilo/__next.app.profilo.__PAGE__.txt"
 */
export function flatName(path) {
  const parts = path.split('/')
  const i = parts.findIndex((p) => p.startsWith('__next.') && !p.endsWith('.txt'))
  if (i < 0 || i === parts.length - 1) return null
  return [...parts.slice(0, i), parts.slice(i).join('.')].join('/')
}

export function flattenRsc(outDir) {
  let n = 0
  for (const full of walk(outDir)) {
    const rel = relative(outDir, full).split(sep).join('/')
    if (!rel.endsWith('.txt')) continue
    const flat = flatName(rel)
    if (!flat) continue
    const dest = join(outDir, ...flat.split('/'))
    if (!existsSync(dest)) {
      copyFileSync(full, dest)
      n++
    }
  }
  return n
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const n = flattenRsc(process.argv[2] ?? 'out')
  console.log(`flatten-rsc: ${n} file copiati`)
}
