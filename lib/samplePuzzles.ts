import { Puzzle } from '@/types'

export const SAMPLE_PUZZLES: Puzzle[] = [
  {
    id: 'telescope',
    answer: 'Telescope',
    definition: 'An optical instrument that makes distant objects appear closer by collecting and focusing light',
    partOfSpeech: 'noun',
    roots: [
      { id: 'tele', text: 'tele', meaning: 'far, distant', origin: 'Greek: tēle' },
      { id: 'scope', text: 'scope', meaning: 'instrument for viewing', origin: 'Greek: skopein' },
    ],
    decoys: [
      { id: 'micro', text: 'micro', meaning: 'small, tiny', origin: 'Greek: mikros' },
      { id: 'photo', text: 'photo', meaning: 'light', origin: 'Greek: phōs' },
      { id: 'hydro', text: 'hydro', meaning: 'water', origin: 'Greek: hydōr' },
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
    ],
    etymologyFact: 'Telescope was coined in 1611 from Greek tēle (far) + skopein (to look). The same root tele gives us television, telephone, and telepathy — all things that work across distance.',
  },
  {
    id: 'hydrophobia',
    answer: 'Hydrophobia',
    definition: 'An extreme or irrational fear of water; also used historically as another name for rabies',
    partOfSpeech: 'noun',
    roots: [
      { id: 'hydro', text: 'hydro', meaning: 'water', origin: 'Greek: hydōr' },
      { id: 'phobia', text: 'phobia', meaning: 'fear of', origin: 'Greek: phobos' },
    ],
    decoys: [
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
      { id: 'tele', text: 'tele', meaning: 'far, distant', origin: 'Greek: tēle' },
      { id: 'aqua', text: 'aqua', meaning: 'water', origin: 'Latin: aqua' },
      { id: 'mania', text: 'mania', meaning: 'obsession with', origin: 'Greek: mania' },
    ],
    etymologyFact: 'Hydrophobia combines Greek hydōr (water) + phobos (fear). Ancient physicians used it to describe how rabies patients would recoil from water. Today we use the prefix hydro- in hundreds of words: hydrogen, hydroelectric, dehydrate.',
  },
  {
    id: 'autobiography',
    answer: 'Autobiography',
    definition: 'A written account of a person\'s own life, written by that person',
    partOfSpeech: 'noun',
    roots: [
      { id: 'auto', text: 'auto', meaning: 'self', origin: 'Greek: autos' },
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
      { id: 'graph', text: 'graph', meaning: 'to write', origin: 'Greek: graphein' },
    ],
    decoys: [
      { id: 'tele', text: 'tele', meaning: 'far, distant', origin: 'Greek: tēle' },
      { id: 'hydro', text: 'hydro', meaning: 'water', origin: 'Greek: hydōr' },
      { id: 'logy', text: 'logy', meaning: 'study of', origin: 'Greek: logos' },
    ],
    etymologyFact: 'Autobiography uses three Greek roots: autos (self) + bios (life) + graphein (to write). It literally means "self-life-writing." The word only entered English around 1809 — before that people just called it "memoirs."',
  },
  {
    id: 'philanthropy',
    answer: 'Philanthropy',
    definition: 'The desire to promote the welfare of others, especially through the donation of money to good causes',
    partOfSpeech: 'noun',
    roots: [
      { id: 'philo', text: 'philo', meaning: 'love of', origin: 'Greek: philos' },
      { id: 'anthro', text: 'anthro', meaning: 'human, mankind', origin: 'Greek: anthrōpos' },
    ],
    decoys: [
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
      { id: 'geo', text: 'geo', meaning: 'earth, land', origin: 'Greek: gē' },
      { id: 'logy', text: 'logy', meaning: 'study of', origin: 'Greek: logos' },
      { id: 'micro', text: 'micro', meaning: 'small, tiny', origin: 'Greek: mikros' },
    ],
    etymologyFact: 'Philanthropy comes from Greek philos (loving) + anthrōpos (human being). The same philo- root appears in philosophy (love of wisdom), philharmonic (love of harmony), and Philadelphia — literally "city of brotherly love."',
  },
  {
    id: 'chronology',
    answer: 'Chronology',
    definition: 'The arrangement of events or dates in the order of their occurrence in time',
    partOfSpeech: 'noun',
    roots: [
      { id: 'chrono', text: 'chrono', meaning: 'time', origin: 'Greek: khronos' },
      { id: 'logy', text: 'logy', meaning: 'study of', origin: 'Greek: logos' },
    ],
    decoys: [
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
      { id: 'geo', text: 'geo', meaning: 'earth, land', origin: 'Greek: gē' },
      { id: 'astro', text: 'astro', meaning: 'star, space', origin: 'Greek: astron' },
      { id: 'tele', text: 'tele', meaning: 'far, distant', origin: 'Greek: tēle' },
    ],
    etymologyFact: 'Chronology pairs Greek khronos (time) + logos (study/reason). Khronos was the Greek god of time — and gave us chronic, anachronism, and synchronize. The word chronicle comes from the same root.',
  },
]
