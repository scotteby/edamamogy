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

Difficulty: AIM FOR MEDIUM difficulty. Words that educated adults will mostly recognize but not immediately know the roots of. Not too easy (avoid telephone, biography, telescope) but not GRE-level obscure either.

Good examples of the right difficulty level:
- Sympathy (sym + pathy) — feeling together with someone
- Chronicle (chron + icle) — a record of events in time
- Geology (geo + logy) — study of the earth
- Democracy (demo + cracy) — rule by the people
- Microscope (micro + scope) — instrument for seeing small things
- Aquatic (aqua + tic) — relating to water
- Centennial (cent + ennial) — relating to a hundred years
- Photograph (photo + graph) — writing with light`

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
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/```$/, '')
      .trim()

    const parsed = JSON.parse(text)
    const puzzles = parsed.puzzles

    // Save to Supabase with ai_generated: true so all players share today's set
    const { error: upsertError } = await supabase
      .from('edamamogy_highscores')
      .upsert(
        {
          date: TODAY,
          score: 0,
          set_at: '',
          puzzles,
          ai_generated: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'date' }
      )

    if (upsertError) {
      console.error('Supabase upsert error:', upsertError.message)
    }

    return NextResponse.json({ puzzles })

  } catch (e: any) {
    console.error('Question generation failed:', e.message)
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
  }
}
