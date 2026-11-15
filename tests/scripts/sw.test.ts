// @ts-expect-error modulo JavaScript senza tipi
import { buildServiceWorker } from '../../scripts/generate-sw.mjs'

describe('service worker', () => {
  it('mette in cache le pagine con il prefisso e salta sw.js', () => {
    const sw = buildServiceWorker(
      [
        { path: 'index.html', hash: 'a' },
        { path: 'app/index.html', hash: 'b' },
        { path: 'sw.js', hash: 'c' },
      ],
      '/baratto-skill',
    )
    expect(sw).toContain("'/baratto-skill/app/'")
    expect(sw).toContain("'/baratto-skill/'")
    expect(sw).not.toContain("'/baratto-skill/sw.js'")
    expect(sw).toMatch(/const CACHE = 'bs-[0-9a-f]{12}'/)
  })
})

// @ts-expect-error modulo JavaScript senza tipi
import { flatName } from '../../scripts/flatten-rsc.mjs'

describe('flatten-rsc', () => {
  it('trasforma i percorsi annidati in nomi con i punti', () => {
    expect(flatName('app/profilo/__next.app/profilo/__PAGE__.txt')).toBe('app/profilo/__next.app.profilo.__PAGE__.txt')
    expect(flatName('app/__next.app/__PAGE__.txt')).toBe('app/__next.app.__PAGE__.txt')
    expect(flatName('en/__next.en/__PAGE__.txt')).toBe('en/__next.en.__PAGE__.txt')
    expect(flatName('app/__next._tree.txt')).toBeNull()
    expect(flatName('index.txt')).toBeNull()
  })
})
