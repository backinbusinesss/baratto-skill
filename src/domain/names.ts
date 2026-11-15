/** Nomi e cognomi per i profili demo. I cognomi sono divisi per area, per dare un po' di realismo. */

export const FEMALE = `Giulia Sofia Aurora Alice Ginevra Emma Giorgia Beatrice Anna Vittoria Martina Chiara Francesca
Sara Elisa Federica Valentina Alessia Silvia Elena Laura Paola Roberta Serena Ilaria Marta Caterina Irene Camilla
Noemi Arianna Rebecca Bianca Ludovica Carlotta Matilde Veronica Daniela Cristina Monica Barbara Simona Antonella
Patrizia Rosa Teresa Lucia Giovanna Maria Gabriella Luisa Margherita Nicoletta Elisabetta Debora Michela Angela
Rita Grazia Stefania Manuela Lorenza Viola Greta Agnese Asia`.split(/\s+/)

export const MALE = `Leonardo Francesco Alessandro Lorenzo Mattia Tommaso Gabriele Andrea Riccardo Edoardo Matteo
Giuseppe Antonio Marco Luca Giovanni Roberto Stefano Paolo Davide Simone Federico Daniele Michele Alberto Emanuele
Fabio Massimo Claudio Carlo Pietro Nicola Salvatore Vincenzo Enrico Filippo Giacomo Samuele Diego Luigi Mario
Franco Sergio Angelo Domenico Giorgio Bruno Raffaele Gianluca Cristian Valerio Ivan Dario Mirko Fabrizio Marcello
Ettore Elia Christian Jacopo Achille Umberto`.split(/\s+/)

const COMMON = `Rossi Russo Ferrari Esposito Bianchi Romano Colombo Ricci Marino Greco Bruno Gallo Conti De_Luca
Mancini Costa Giordano Rizzo Lombardi Moretti Barbieri Fontana Santoro Mariani Rinaldi Caruso Ferrara Galli Martini
Leone Longo Gentile Martinelli Vitale Lombardo Serra Coppola De_Santis D'Angelo Marchetti Parisi Villa Conte Ferraro
Ferri Fabbri Bianco Marini Grasso Valentini Messina Sala De_Angelis Gatti Pellegrini Palumbo Sanna Farina Rizzi
Monti Cattaneo Morelli Amato Silvestri Mazza Testa Grassi Pellegrino Carbone Giuliani Benedetti Barone Rossetti
Caputo Montanari Guerra Palmieri Bernardi Martino Fiore De_Rosa Ferretti Bellini Basile Riva Donati Piras Vitali
Battaglia Sartori Neri Costantini Milani Pagano Ruggiero Sorrentino D'Amico Orlando Negri`.split(/\s+/)

const NORTH = `Brambilla Colombo Galbiati Zanetti Bortolin Pozzi Fumagalli Sironi Bassi Zanella Fabris Bertolini
Castelli Pavan Visentin Gasparini Zago Rigoni Tagliaferri Bonetti Cereda Molteni Ghezzi Formenti Viola Zorzi
Bergamaschi Rota Agostini Pedrotti`.split(/\s+/)
const CENTER = `Bartolini Lazzeri Baldini Paoletti Cecchi Mencarelli Tognetti Bigi Nardi Ceccarelli Pierini Baldi
Lorenzini Santucci Mezzetti Rosati Fratini Ciampi Tozzi Mencacci Petrucci Biagini Fanelli Brunetti`.split(/\s+/)
const SOUTH = `Esposito Russo De_Luca Iovine Capasso Cozzolino Amoroso Ianniello Di_Lorenzo Scognamiglio Lo_Russo
Pugliese Calabrese Lo_Bianco La_Rosa Musumeci Scuderi Cannizzaro Romeo Arena Lo_Presti Di_Stefano Spinelli
Mastrangelo Cassano Lorusso Liguori Ferraiuolo Sciortino Barbagallo Pappalardo`.split(/\s+/)
const SARDINIA = `Sanna Piras Pinna Melis Serra Mura Carta Floris Deiana Cocco Porcu Usai Murgia Loi Atzeni`.split(/\s+/)

const fix = (s: string) => s.replace(/_/g, ' ')

const AREA: Record<string, 'north' | 'center' | 'south' | 'sardinia'> = {
  Piemonte: 'north',
  "Valle d'Aosta": 'north',
  Lombardia: 'north',
  'Trentino-Alto Adige': 'north',
  Veneto: 'north',
  'Friuli-Venezia Giulia': 'north',
  Liguria: 'north',
  'Emilia-Romagna': 'north',
  Toscana: 'center',
  Umbria: 'center',
  Marche: 'center',
  Lazio: 'center',
  Abruzzo: 'south',
  Molise: 'south',
  Campania: 'south',
  Puglia: 'south',
  Basilicata: 'south',
  Calabria: 'south',
  Sicilia: 'south',
  Sardegna: 'sardinia',
}

export function surnamesFor(region: string): { local: string[]; common: string[] } {
  const area = AREA[region] ?? 'center'
  const local = { north: NORTH, center: CENTER, south: SOUTH, sardinia: SARDINIA }[area]
  return { local: local.map(fix), common: COMMON.map(fix) }
}

/**
 * Persone arrivate da altri paesi: nome, cognome, genere e la lingua madre,
 * che spesso offrono come competenza (id del catalogo) e parlano (codice ISO).
 */
export const FOREIGN: { first: string; last: string; g: 'f' | 'm'; skill: string; lang: string }[] = [
  { first: 'Olena', last: 'Kovalenko', g: 'f', skill: 'ukrainian', lang: 'uk' },
  { first: 'Andriy', last: 'Shevchuk', g: 'm', skill: 'ukrainian', lang: 'uk' },
  { first: 'Ioana', last: 'Popescu', g: 'f', skill: 'romanian', lang: 'ro' },
  { first: 'Mihai', last: 'Dumitru', g: 'm', skill: 'romanian', lang: 'ro' },
  { first: 'Ana', last: 'García', g: 'f', skill: 'spanish', lang: 'es' },
  { first: 'Javier', last: 'Morales', g: 'm', skill: 'spanish', lang: 'es' },
  { first: 'Camille', last: 'Dubois', g: 'f', skill: 'french', lang: 'fr' },
  { first: 'Julien', last: 'Moreau', g: 'm', skill: 'french', lang: 'fr' },
  { first: 'Lena', last: 'Schneider', g: 'f', skill: 'german', lang: 'de' },
  { first: 'Jonas', last: 'Weber', g: 'm', skill: 'german', lang: 'de' },
  { first: 'Emily', last: 'Carter', g: 'f', skill: 'english', lang: 'en' },
  { first: 'James', last: "O'Connor", g: 'm', skill: 'english', lang: 'en' },
  { first: 'Wei', last: 'Zhang', g: 'm', skill: 'mandarin', lang: 'zh' },
  { first: 'Mei', last: 'Chen', g: 'f', skill: 'mandarin', lang: 'zh' },
  { first: 'Yuki', last: 'Tanaka', g: 'f', skill: 'japanese', lang: 'ja' },
  { first: 'Ji-woo', last: 'Park', g: 'f', skill: 'korean', lang: 'ko' },
  { first: 'Ahmed', last: 'Benali', g: 'm', skill: 'arabic', lang: 'ar' },
  { first: 'Fatima', last: 'El Amrani', g: 'f', skill: 'arabic', lang: 'ar' },
  { first: 'Priya', last: 'Sharma', g: 'f', skill: 'hindi', lang: 'hi' },
  { first: 'Arjun', last: 'Singh', g: 'm', skill: 'hindi', lang: 'hi' },
  { first: 'Elif', last: 'Yılmaz', g: 'f', skill: 'turkish', lang: 'tr' },
  { first: 'Kostas', last: 'Papadopoulos', g: 'm', skill: 'greek', lang: 'el' },
  { first: 'Agnieszka', last: 'Nowak', g: 'f', skill: 'polish', lang: 'pl' },
  { first: 'Ermal', last: 'Hoxha', g: 'm', skill: 'albanian', lang: 'sq' },
  { first: 'Ana', last: 'Silva', g: 'f', skill: 'portuguese', lang: 'pt' },
  { first: 'Lucas', last: 'Oliveira', g: 'm', skill: 'portuguese', lang: 'pt' },
  { first: 'Daan', last: 'de Vries', g: 'm', skill: 'dutch', lang: 'nl' },
  { first: 'Astrid', last: 'Lindqvist', g: 'f', skill: 'swedish', lang: 'sv' },
  { first: 'Dmitri', last: 'Ivanov', g: 'm', skill: 'russian', lang: 'ru' },
  { first: 'Amina', last: 'Diallo', g: 'f', skill: 'french', lang: 'fr' },
  { first: 'Kofi', last: 'Mensah', g: 'm', skill: 'english', lang: 'en' },
  { first: 'Neema', last: 'Mwangi', g: 'f', skill: 'swahili', lang: 'sw' },
]
