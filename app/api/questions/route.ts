import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePuzzles } from '@/lib/generatePuzzles'
import { SAMPLE_PUZZLES } from '@/lib/samplePuzzles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TODAY = (() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})()

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const param = url.searchParams.get('difficulty')
    const useCache = param === null

    const { data: existing } = await supabase
      .from('edamamogy_highscores')
      .select('puzzles')
      .eq('date', TODAY)
      .maybeSingle()

    if (useCache && existing?.puzzles?.length) {
      return NextResponse.json({ puzzles: existing.puzzles, source: 'cache' })
    }

    const puzzles = await generatePuzzles('medium')

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
