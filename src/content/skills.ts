import { CATEGORIES, type CategoryId } from './categories'

/**
 * Il catalogo delle competenze: solo gli id, divisi per categoria.
 * I nomi sono in src/i18n/<lingua>/skills.ts (stessi id).
 * Un id che finisce con `~` inverte la regola "online" della sua categoria
 * (es. in Sport quasi tutto è dal vivo, ma gli scacchi si giocano anche online).
 */
const RAW: Record<CategoryId, string> = {
  languages: `english spanish french german portuguese russian mandarin japanese korean arabic hindi turkish greek
    dutch swedish norwegian danish finnish polish romanian ukrainian albanian serbo-croatian hungarian czech hebrew
    persian swahili latin ancient-greek italian-l2 lis neapolitan esperanto`,
  tech: `pc-repair pc-basics smartphone-help excel word powerpoint google-workspace email-pec spid canva social-media
    wordpress html-css javascript python java sql react web-design photoshop lightroom video-editing podcast
    3d-printing arduino raspberry-pi home-network cybersecurity backup linux ai-tools seo ecommerce game-dev mac-iphone`,
  music: `guitar electric-guitar bass piano drums violin cello flute clarinet saxophone trumpet accordion harmonica
    ukulele mandolin harp singing lyric-singing choir music-theory solfeggio songwriting music-production dj
    mixing-mastering tamburello organ percussion rap ear-training live-sound~ luthier~`,
  sport: `running cycling mountain-bike swimming tennis padel football basketball volleyball beach-volley climbing
    hiking skiing snowboard surf windsurf kitesurf sailing kayak boxing kickboxing judo karate fencing chess~
    personal-training~ calisthenics~ skateboard roller-skating golf table-tennis archery horse-riding salsa tango
    swing hip-hop-dance`,
  cooking: `home-cooking fresh-pasta bread pizza sourdough pastry cake-design gluten-free vegan vegetarian sushi
    indian-cuisine mexican-cuisine chinese-cuisine middle-eastern neapolitan-cuisine emilian-cuisine sicilian-cuisine
    preserves fermentation cheese-making wine-tasting coffee-barista cocktails craft-beer meal-prep baby-food
    knife-skills bbq chocolate gelato healthy-cooking~`,
  home: `plumbing electrical painting-walls wallpaper tiling carpentry furniture-assembly furniture-restoration
    upholstery drywall small-repairs appliance-repair locks-doors flooring insulation decluttering~ eco-cleaning
    interior-design~ home-staging energy-saving~ smart-home moving-help masonry welding boiler-care mold-removal
    curtains power-tools pallet-diy natural-pest-control`,
  study: `math-middle math-high calculus geometry physics chemistry biology italian-grammar literature history
    philosophy geography latin-greek-translation economics statistics accounting law-basics homework-primary
    dsa-support thesis study-method admission-tests invalsi english-certifications driving-theory speed-reading
    memory-techniques logic computer-science electronics astronomy art-history public-competitions scientific-writing`,
  art: `drawing watercolor oil-painting acrylic illustration digital-illustration~ comics calligraphy lettering
    photography film-photography smartphone-photography~ pottery-wheel clay-modeling sculpture mosaic decoupage origami
    scrapbooking printmaking screen-printing theater improv creative-writing~ poetry~ storytelling~ magic-tricks
    jewelry-making leather-craft candle-soap macrame graphic-design~ street-art`,
  wellness: `yoga pilates meditation mindfulness breathing stretching posture massage~ nutrition-education
    sleep-habits stress-management tai-chi qi-gong walking-group~ nordic-walking~ gentle-gym self-defense~
    first-aid~ skin-care journaling digital-detox active-listening pregnancy-yoga kids-yoga feldenkrais facial-yoga
    breathwork-cold~`,
  garden: `vegetable-garden balcony-garden houseplants pruning grafting composting bonsai succulents orchids
    permaculture beekeeping chickens lawn-care irrigation foraging mushrooms seed-saving aromatic-herbs fruit-trees
    olive-pruning vineyard hydroponics birdwatching flower-arranging terrarium garden-design`,
  career: `cv-writing job-interview linkedin public-speaking presentations negotiation time-management
    project-management agile-scrum business-plan personal-budget tax-return freelance-vat digital-marketing copywriting
    branding sales customer-service translation proofreading startup-mentoring grant-writing leadership networking
    crowdfunding event-planning online-selling career-guidance bureaucracy`,
  fashion: `sewing-basics sewing-machine alterations pattern-making tailoring knitting crochet embroidery cross-stitch
    quilting upcycling fabric-dyeing cobbler bag-making personal-styling~ color-analysis~ capsule-wardrobe~
    vintage-hunting ironing haircut barbering nail-art makeup cosplay bobbin-lace weaving felting`,
  family: `babysitting pet-sitting dog-walking dog-training cat-care aquarium kids-parties storytelling-kids
    new-parents elderly-company elderly-tech montessori pet-grooming horse-care small-pets pediatric-first-aid
    school-runs errands reading-aloud board-games genealogy~ family-photos~ gift-wrapping kids-crafts`,
  motors: `bike-repair ebike motorcycle-maintenance car-maintenance tire-change car-detailing driving-practice
    parking scooter-maintenance vintage-cars camper-life road-trip-planning~ nautical-license~ boat-maintenance
    drone-flying rc-models car-buying~ cycle-touring eco-driving~ motorcycle-touring`,
}

export interface SkillDef {
  id: string
  cat: CategoryId
  /** si può insegnare anche a distanza */
  online: boolean
}

export const SKILLS: SkillDef[] = CATEGORIES.flatMap((c) =>
  RAW[c.id]
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const flip = token.endsWith('~')
      return { id: flip ? token.slice(0, -1) : token, cat: c.id, online: flip ? !c.online : c.online }
    }),
)

const BY_ID = new Map(SKILLS.map((s) => [s.id, s]))
export const skillById = (id: string): SkillDef | undefined => BY_ID.get(id)
export const skillsInCategory = (cat: CategoryId): SkillDef[] => SKILLS.filter((s) => s.cat === cat)
