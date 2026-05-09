import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePuzzles } from '@/lib/generatePuzzles'
import { SAMPLE_PUZZLES } from '@/lib/samplePuzzles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Difficulty = 'easy' | 'medium' | 'hard'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const param = url.searchParams.get('difficulty')
  const difficulty: Difficulty =
    param === 'easy' || param === 'hard' ? param : 'medium'

  try {
    // Pull the oldest unused set from the pool
    const { data } = await supabase
      .from('practice_puzzles')
      .select('id, puzzles')
      .eq('difficulty', difficulty)
      .eq('used', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (data) {
      // Mark it used so the next player gets a different set
      await supabase
        .from('practice_puzzles')
        .update({ used: true })
        .eq('id', data.id)

      return NextResponse.json({ puzzles: data.puzzles, source: 'pool' })
    }

    // Pool empty — generate on the fly
    try {
      const puzzles = await generatePuzzles(difficulty)
      return NextResponse.json({ puzzles, source: 'live' })
    } catch {
      return NextResponse.json({ puzzles: SAMPLE_PUZZLES, source: 'sample' })
    }

  } catch (e: any) {
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES, source: 'sample', error: e.message })
  }
}
