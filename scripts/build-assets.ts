/**
 * Genera gli asset statici:
 *   src/content/italy.ts   sagoma dell'Italia (world-atlas 1:50M, ISC) come percorso SVG
 *   public/icon.svg, public/icons/*.png   icone dell'app e della PWA
 *   public/og.png          anteprima per i social (1200×630)
 *
 * Uso: npm run assets
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { geoArea, geoPath, geoTransform } from 'd3-geo'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import sharp from 'sharp'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { ITALY_PROJ, project } from '../src/content/italy-proj'
import { SKILL_ICONS } from '../src/content/skillIcons'

const require = createRequire(import.meta.url)
const root = process.cwd()
const write = (file: string, data: string | Buffer) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, data)
}

// ---------------------------------------------------------------- Italia
function buildItaly() {
  const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8')) as Topology
  const fc = feature(topo, topo.objects.countries as GeometryCollection) as unknown as {
    features: Feature<Polygon | MultiPolygon>[]
  }
  const it = fc.features.find((f) => String(f.id) === '380')
  if (!it) throw new Error('Italia non trovata in world-atlas')
  // tolgo gli isolotti più piccoli: restano penisola, Sicilia, Sardegna, Elba e le isole principali
  const polys = it.geometry.type === 'MultiPolygon' ? it.geometry.coordinates : [it.geometry.coordinates]
  const kept = polys.filter((p) => geoArea({ type: 'Polygon', coordinates: p }) * 6371 ** 2 > 60)
  const geom: MultiPolygon = { type: 'MultiPolygon', coordinates: kept }
  const proj = geoTransform({
    point(lon, lat) {
      const [x, y] = project(lon, lat)
      this.stream.point(x, y)
    },
  })
  const d = (geoPath(proj)(geom) ?? '').replace(/(\d+\.\d)\d+/g, '$1')
  const src = `/* generato da scripts/build-assets.ts (world-atlas 1:50M, licenza ISC): non modificare a mano */
export const ITALY_PATH = '${d}'
`
  write(join(root, 'src/content/italy.ts'), src)
  console.log(`italia: ${kept.length} poligoni, ${(d.length / 1024).toFixed(1)} KB, viewBox 0 0 ${ITALY_PROJ.width} ${ITALY_PROJ.height}`)
}

// ---------------------------------------------------------------- icone
function iconSvg(bg = '#2742D9', pad = 0) {
  // stesso disegno di src/ui/Logo.tsx, su 512×512
  const s = (512 - pad * 2) / 64
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${pad ? bg : 'none'}"/>
<g transform="translate(${pad} ${pad}) scale(${s})">
<rect x="${pad ? 0 : 6}" y="${pad ? 0 : 6}" width="${pad ? 64 : 52}" height="${pad ? 64 : 52}" rx="${pad ? 0 : 14}" fill="${bg}"/>
<path d="M17 18h30v18H17z" fill="#fff"/>
<path d="M17 36h30" stroke="${bg}" stroke-width="2" stroke-dasharray="3 2.5"/>
<path d="M17 36h9.5v12H17z" fill="#fff"/>
<path d="M37.5 36H47v12h-9.5z" fill="#fff"/>
<path d="M27.5 39.5h9l1 9.5h-9.5z" fill="#FFD43B" transform="rotate(-12 32 44)"/>
<path d="M22 25h14M22 30h9" stroke="${bg}" stroke-width="3" stroke-linecap="round"/>
</g></svg>`
}

async function buildIcons() {
  const plain = iconSvg()
  write(join(root, 'public/icon.svg'), plain)
  const png = (svg: string, size: number) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer()
  write(join(root, 'public/icons/icon-192.png'), await png(plain, 192))
  write(join(root, 'public/icons/icon-512.png'), await png(plain, 512))
  // maskable: il disegno sta nella zona sicura (80%) su fondo pieno
  write(join(root, 'public/icons/icon-maskable-512.png'), await png(iconSvg('#2742D9', 64), 512))
  write(join(root, 'public/icons/apple-touch-icon.png'), await png(iconSvg('#2742D9', 20), 180))
  console.log('icone: ok')
}

async function buildOg() {
  const tabs = ['Inglese', 'Chitarra', 'Riparazione PC', 'Pasta fresca', 'Yoga', 'Excel']
  const tabW = 560 / tabs.length
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#F4F5F0"/>
<rect x="0" y="0" width="1200" height="630" fill="#2742D9" opacity="0.06"/>
<text x="80" y="210" font-family="Arial Narrow, Arial, sans-serif" font-weight="800" font-size="80" fill="#10162F" letter-spacing="-2">Io ti insegno,</text>
<text x="80" y="300" font-family="Arial Narrow, Arial, sans-serif" font-weight="800" font-size="80" fill="#2742D9" letter-spacing="-2">tu mi insegni.</text>
<text x="80" y="370" font-family="Arial, sans-serif" font-size="28" fill="#565D75">Scambia competenze con chi ti sta vicino.</text>
<text x="80" y="540" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#10162F">Baratto Skill</text>
<g transform="translate(680 120) scale(0.84) rotate(4 280 200)">
  <rect x="0" y="0" width="560" height="270" fill="#fff" rx="4"/>
  <circle cx="280" cy="0" r="12" fill="#F2545B"/>
  <text x="40" y="110" font-family="Comic Sans MS, Segoe Print, cursive" font-size="58" fill="#10162F">Scambio lezioni!</text>
  <text x="40" y="180" font-family="Comic Sans MS, Segoe Print, cursive" font-size="34" fill="#565D75">un’ora vale un’ora</text>
  <line x1="0" y1="270" x2="560" y2="270" stroke="#10162F" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 8"/>
  ${tabs
    .map(
      (t, i) =>
        `<g transform="translate(${i * tabW} 270) ${i === 2 ? 'rotate(-6) translate(-8 30)' : ''}"><rect width="${tabW}" height="170" fill="${i === 2 ? '#FFD43B' : '#fff'}"/>${i > 0 ? `<line x1="0" y1="0" x2="0" y2="170" stroke="#10162F" stroke-opacity=".3" stroke-width="3" stroke-dasharray="10 8"/>` : ''}<text transform="translate(${tabW / 2 + 9} 160) rotate(-90)" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#10162F">${t}</text></g>`,
    )
    .join('')}
</g>
</svg>`
  write(join(root, 'public/og.png'), await sharp(Buffer.from(svg)).png().toBuffer())
  console.log('og.png: ok')
}

// ---------------------------------------------------------------- bandiere delle lingue (flag-icons, MIT)
function buildFlags() {
  const dir = join(dirname(require.resolve('flag-icons/package.json')), 'flags', '4x3')
  const codes = [...new Set(Object.values(SKILL_ICONS).filter((v) => v.startsWith('flag:')).map((v) => v.slice(5)))]
  for (const code of codes) {
    const dest = join(root, 'public', 'flags', `${code}.svg`)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(join(dir, `${code}.svg`), dest)
  }
  console.log(`bandiere: ${codes.length}`)
}

buildItaly()
buildFlags()
await buildIcons()
await buildOg()
