import { Puzzle } from '@/types'

export const SAMPLE_PUZZLES: Puzzle[] = [
  {
    id: 'pusillanimous',
    answer: 'Pusillanimous',
    definition: 'Showing a lack of courage or determination; timid and cowardly',
    partOfSpeech: 'adjective',
    roots: [
      { id: 'pusill', text: 'pusill', meaning: 'very small, tiny', origin: 'Latin: pusillus' },
      { id: 'anim', text: 'anim', meaning: 'spirit, soul, mind', origin: 'Latin: animus' },
    ],
    decoys: [
      { id: 'magn', text: 'magn', meaning: 'great, large', origin: 'Latin: magnus' },
      { id: 'fort', text: 'fort', meaning: 'strong, brave', origin: 'Latin: fortis' },
      { id: 'bell', text: 'bell', meaning: 'war', origin: 'Latin: bellum' },
      { id: 'vit', text: 'vit', meaning: 'life', origin: 'Latin: vita' },
    ],
    etymologyFact: 'Pusillanimous joins Latin pusillus (very small) + animus (spirit) — literally "small-spirited." The same animus root gives us animated, animal, and unanimous (one spirit). Pusillus itself comes from pusus (boy) + -illus (diminutive), so it originally meant "boyish-spirited."',
  },
  {
    id: 'loquacious',
    answer: 'Loquacious',
    definition: 'Tending to talk a great deal; garrulous and wordy',
    partOfSpeech: 'adjective',
    roots: [
      { id: 'loqu', text: 'loqu', meaning: 'to speak, talk', origin: 'Latin: loqui' },
      { id: 'acious', text: 'acious', meaning: 'tending to, full of', origin: 'Latin: -ax, -acis' },
    ],
    decoys: [
      { id: 'aud', text: 'aud', meaning: 'to hear', origin: 'Latin: audire' },
      { id: 'scrib', text: 'scrib', meaning: 'to write', origin: 'Latin: scribere' },
      { id: 'voc', text: 'voc', meaning: 'voice, call', origin: 'Latin: vox' },
      { id: 'ment', text: 'ment', meaning: 'mind', origin: 'Latin: mens' },
    ],
    etymologyFact: 'Loquacious comes from Latin loqui (to speak). The same root gives us eloquent (speaking out well), colloquial (speaking together, informal), soliloquy (speaking alone), and ventriloquist — literally "belly speaker," from the ancient belief that voices came from the stomach.',
  },
  {
    id: 'ephemeral',
    answer: 'Ephemeral',
    definition: 'Lasting for a very short time; transitory and fleeting',
    partOfSpeech: 'adjective',
    roots: [
      { id: 'epi', text: 'epi', meaning: 'upon, over, near', origin: 'Greek: epi' },
      { id: 'hemer', text: 'hemer', meaning: 'day', origin: 'Greek: hēmera' },
    ],
    decoys: [
      { id: 'chrono', text: 'chrono', meaning: 'time', origin: 'Greek: khronos' },
      { id: 'aeon', text: 'aeon', meaning: 'age, era', origin: 'Greek: aiōn' },
      { id: 'nox', text: 'nox', meaning: 'night', origin: 'Latin: nox' },
      { id: 'bio', text: 'bio', meaning: 'life', origin: 'Greek: bios' },
    ],
    etymologyFact: 'Ephemeral comes from Greek epi (upon) + hēmera (day) — literally "lasting only a day." Ancient Greeks used it for insects that lived just one day. The same hēmera root appears in words like ephemeris (a daily astronomical almanac) and the name Hemerocallis — the day lily, which blooms for only 24 hours.',
  },
  {
    id: 'perspicacious',
    answer: 'Perspicacious',
    definition: 'Having a ready insight into things; shrewd and having clear understanding',
    partOfSpeech: 'adjective',
    roots: [
      { id: 'per', text: 'per', meaning: 'through, thoroughly', origin: 'Latin: per' },
      { id: 'spic', text: 'spic', meaning: 'to look, see', origin: 'Latin: specere' },
    ],
    decoys: [
      { id: 'aud', text: 'aud', meaning: 'to hear', origin: 'Latin: audire' },
      { id: 'cogn', text: 'cogn', meaning: 'to know', origin: 'Latin: cognoscere' },
      { id: 'sens', text: 'sens', meaning: 'to feel', origin: 'Latin: sentire' },
      { id: 'mens', text: 'mens', meaning: 'mind', origin: 'Latin: mens' },
    ],
    etymologyFact: 'Perspicacious comes from Latin per (through) + specere (to look) — "one who sees through things clearly." The specere root is remarkably productive: spectacle, inspector, respect (to look back), conspicuous (visible together), and even species — originally meaning "visible kind or appearance."',
  },
  {
    id: 'vituperate',
    answer: 'Vituperate',
    definition: 'To blame or insult someone in strong or violent language; to berate harshly',
    partOfSpeech: 'verb',
    roots: [
      { id: 'viti', text: 'viti', meaning: 'fault, defect, vice', origin: 'Latin: vitium' },
      { id: 'per', text: 'per', meaning: 'through, thoroughly', origin: 'Latin: per' },
      { id: 'ate', text: 'ate', meaning: 'to do, cause', origin: 'Latin: -are' },
    ],
    decoys: [
      { id: 'laud', text: 'laud', meaning: 'praise', origin: 'Latin: laudare' },
      { id: 'bene', text: 'bene', meaning: 'well, good', origin: 'Latin: bene' },
      { id: 'mal', text: 'mal', meaning: 'bad, evil', origin: 'Latin: malus' },
    ],
    etymologyFact: 'Vituperate comes from Latin vitium (fault, vice) + parare (to prepare) — originally meaning "to find fault with." The vitium root gives us vice, vicious, and vitiate (to impair or make faulty). English borrowed heavily from this family of words to describe moral failing.',
  },
]
