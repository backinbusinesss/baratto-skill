import type { CategoryId } from '@/content/categories'

/** Nomi e descrizioni brevi delle categorie in italiano. */
export const categories: Record<CategoryId, { name: string; blurb: string }> = {
  languages: { name: 'Lingue', blurb: 'Conversazione, grammatica, dialetti e lingua dei segni' },
  tech: { name: 'Informatica', blurb: 'Dal PC che non parte al primo sito web' },
  music: { name: 'Musica', blurb: 'Strumenti, canto, teoria e produzione' },
  sport: { name: 'Sport e movimento', blurb: 'Allenarsi in compagnia, dal padel al tango' },
  cooking: { name: 'Cucina', blurb: 'Ricette di casa, lievitati e cucine del mondo' },
  home: { name: 'Casa e fai da te', blurb: 'Riparare, montare, imbiancare, risparmiare' },
  study: { name: 'Studio e ripetizioni', blurb: 'Ripetizioni, tesi, test e metodo di studio' },
  art: { name: 'Arte e creatività', blurb: 'Disegno, foto, ceramica, teatro e scrittura' },
  wellness: { name: 'Benessere', blurb: 'Yoga, respiro, postura e buone abitudini' },
  garden: { name: 'Giardino e natura', blurb: 'Orto, potature, api e piante di casa' },
  career: { name: 'Lavoro e carriera', blurb: 'CV, colloqui, marketing e burocrazia' },
  fashion: { name: 'Moda e cucito', blurb: 'Orli, uncinetto, sartoria e stile' },
  family: { name: 'Famiglia e animali', blurb: 'Bambini, nonni, cani, gatti e tempo insieme' },
  motors: { name: 'Motori e mobilità', blurb: 'Bici, auto, moto, camper e barche' },
}
