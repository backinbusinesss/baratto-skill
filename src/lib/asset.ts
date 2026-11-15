/** Percorso pubblico di un file in `public/`, con il prefisso del sottopercorso (NEXT_PUBLIC_BASE_PATH) se c'è. */
export function assetUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '')
  return `${base}/${path.replace(/^\/+/, '')}`
}
