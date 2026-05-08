import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'Missing date' }, { status: 400 })

  const { data, error } = await supabase
    .from('highscores')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ highscore: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { date, score, set_at, puzzles } = body

  if (!date || score === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('highscores')
    .select('score')
    .eq('date', date)
    .maybeSingle()

  const currentBest = existing?.score ?? 0
  const isNewRecord = score > currentBest

  if (isNewRecord) {
    const { error } = await supabase
      .from('highscores')
      .upsert({ date, score, set_at, puzzles, updated_at: new Date().toISOString() }, { onConflict: 'date' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ isNewRecord, bestScore: isNewRecord ? score : currentBest })
}
