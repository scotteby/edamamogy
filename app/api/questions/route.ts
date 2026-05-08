import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SAMPLE_PUZZLES } from '@/lib/samplePuzzles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TODAY = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()

const DATE_STR = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
})

export async function GET() {
  // Check if we already have AI-generated puzzles for today
  const { data: existing } = await supabase
    .from('edamamogy_highscores')
    .select('puzzles, ai_generated')
    .eq('date', TODAY)
    .maybeSingle()

  if (existing?.puzzles?.length && existing?.ai_generated) {
    return NextResponse.json({ puzzles: existing.puzzles })
  }

  // No AI puzzles yet — generate from Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
  }

  const prompt = `Generate 5 etymology word puzzles for a daily word game called Edamamogy (${DATE_STR}).

Difficulty: AIM FOR HARDER WORDS. Mix of medium and challenging vocabulary — think GRE-level words that educated adults might not immediately recognize. Avoid obvious words like telescope, biography, telephone.

Good examples of the difficulty level we want:
- Pusillanimous (pusill + anim + ous) — cowardly
- Loquacious (loqu + acious) — talkative
- Ephemeral (epi + hemer + al) — lasting a short time
- Concatenate (con + caten + ate) — link together in a chain
- Perspicacious (per + spic + acious) — having a ready insight

Each puzzle shows players a word definition and they must assemble the correct Latin/Greek root beans to build the word.

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
- Include at least 2 words most people would not immediately know
- Decoys should be plausible roots from the same language family
- Etymology facts should mention 2-3 other common words sharing the same root
- Use the combining form of roots as they appear in the word (e.g. "graphy" not "graph", "logy" not "logos")
- Mix categories: science, medicine, law, philosophy, psychology, literature`

  try {
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
      return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
    }

    const text = json.content[0].text.trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim()

    const parsed = JSON.parse(text)
    const puzzles = parsed.puzzles

    const { error: upsertError } = await supabase
      .from('edamamogy_highscores')
      .upsert(
        { date: TODAY, score: 0, set_at: '', puzzles, ai_generated: true, updated_at: new Date().toISOString() },
        { onConflict: 'date' }
      )

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError)
    }

    // Temporarily return debug info
    return NextResponse.json({ 
      puzzles,
      debug: {
        source: 'claude_api',
        model: json.model,
        firstWord: puzzles[0]?.answer,
        upsertError: upsertError?.message || null
      }
    })
 } catch (e: any) {
    console.error('Question generation failed:', e.message)
    // Temporarily return the error so we can see it
    return NextResponse.json({ 
      error: e.message, 
      stack: e.stack?.split('\n').slice(0, 3),
      puzzles: SAMPLE_PUZZLES 
    })
  }
}
