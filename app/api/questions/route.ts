import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SAMPLE_PUZZLES } from '@/lib/samplePuzzles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TODAY = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()

const DATE_STR = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
})

type Difficulty = 'easy' | 'medium' | 'hard'

const DIFFICULTY_BLOCKS: Record<Difficulty, string> = {
  easy: `Difficulty: EASY. Words that most educated adults will recognize, often with familiar roots. Good for learners and casual players.

Good examples of the right level:
- Sympathy (sym + pathy) — feeling together with someone
- Chronicle (chron + icle) — a record of events in time
- Geology (geo + logy) — study of the earth
- Democracy (demo + cracy) — rule by the people
- Microscope (micro + scope) — instrument for seeing small things
- Aquatic (aqua + tic) — relating to water
- Centennial (cent + ennial) — relating to a hundred years
- Photograph (photo + graph) — writing with light`,
  medium: `Difficulty: MEDIUM. Words educated adults will recognize but not immediately know the roots of. Not too easy (avoid telephone, biography) but not GRE-obscure either.

Good examples of the right level:
- Sympathy (sym + pathy) — feeling together with someone
- Chronicle (chron + icle) — a record of events in time
- Geology (geo + logy) — study of the earth
- Democracy (demo + cracy) — rule by the people
- Microscope (micro + scope) — instrument for seeing small things`,
  hard: `Difficulty: HARD. Mix of medium and challenging vocabulary — think GRE-level words that educated adults might not immediately recognize. Avoid obvious words like telescope, biography, telephone.

Good examples of the right level:
- Pusillanimous (pusill + anim + ous) — cowardly
- Loquacious (loqu + acious) — talkative
- Ephemeral (epi + hemer + al) — lasting a short time
- Concatenate (con + caten + ate) — link together in a chain
- Perspicacious (per + spic + acious) — having a ready insight`,
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const param = url.searchParams.get('difficulty')
    const difficulty: Difficulty =
      param === 'easy' || param === 'hard' ? param : 'medium'
    const useCache = difficulty === 'medium'

    const { data: existing } = await supabase
      .from('edamamogy_highscores')
      .select('puzzles')
      .eq('date', TODAY)
      .maybeSingle()

    if (useCache && existing?.puzzles?.length) {
      return NextResponse.json({ puzzles: existing.puzzles, source: 'cache' })
    }

    const prompt = `Generate 5 etymology word puzzles for a daily word game called Edamamogy (${DATE_STR}).

${DIFFICULTY_BLOCKS[difficulty]}

Return ONLY valid JSON — no markdown, no backticks, no explanation:

{
  "puzzles": [
    {
      "id": "unique_word_id",
      "answer": "TheWord",
      "definition": "Clear, precise definition of the word",
      "partOfSpeech": "noun",
      "roots": [
        { "id": "root1", "text": "root1", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "root2", "text": "root2", "meaning": "what it means", "origin": "Greek/Latin: sourceword" }
      ],
      "decoys": [
        { "id": "decoy1", "text": "decoy1", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy2", "text": "decoy2", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy3", "text": "decoy3", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy4", "text": "decoy4", "meaning": "what it means", "origin": "Greek/Latin: sourceword" }
      ],
      "etymologyFact": "Interesting 2-3 sentence fact about this word's origin and related words in common use"
    }
  ]
}

Rules:
- Mix 2-root and 3-root words
- Decoys should be plausible roots from the same language family
- Etymology facts should mention 2-3 other common words sharing the same root
- Use the combining form of roots as they appear in the word (e.g. "graphy" not "graph", "logy" not "logos")
- Mix categories: science, medicine, geography, philosophy, everyday language`

    const https = require('https')
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText: string = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      }
      const req = https.request(options, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => data += chunk)
        res.on('end', () => resolve(data))
      })
      req.on('error', reject)
      req.write(body)
      req.end()
    })

    const json = JSON.parse(responseText)

    if (!json.content?.[0]?.text) {
      console.error('Unexpected Anthropic response:', JSON.stringify(json))
      return NextResponse.json({ puzzles: SAMPLE_PUZZLES, source: 'sample_bad_response' })
    }

    const text = json.content[0].text.trim()
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/```$/, '')
      .trim()

    const puzzles = JSON.parse(text).puzzles

    if (useCache) {
      if (existing) {
        await supabase
          .from('edamamogy_highscores')
          .update({ puzzles, ai_generated: true, updated_at: new Date().toISOString() })
          .eq('date', TODAY)
      } else {
        await supabase
          .from('edamamogy_highscores')
          .insert({ date: TODAY, score: 0, set_at: '', puzzles, ai_generated: true, updated_at: new Date().toISOString() })
      }
    }

    return NextResponse.json({ puzzles, source: 'claude' })

  } catch (e: any) {
    console.error('Route error:', e.message)
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES, source: 'sample_error', error: e.message })
  }
}
