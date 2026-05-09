import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generatePuzzles, Difficulty } from '@/lib/generatePuzzles'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const MIN_POOL_SIZE = 5
const BATCH_SIZE = 3

export async function GET(request: Request) {
  // Verify this is coming from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, number> = {}

  for (const difficulty of DIFFICULTIES) {
    // Count how many unused sets we have
    const { count } = await supabase
      .from('practice_puzzles')
      .select('*', { count: 'exact', head: true })
      .eq('difficulty', difficulty)
      .eq('used', false)

    const available = count ?? 0
    const needed = Math.max(0, MIN_POOL_SIZE - available)
    const toGenerate = Math.min(needed, BATCH_SIZE)

    results[difficulty] = 0

    // Collect words already in the pool to avoid repeats
    const { data: existingRows } = await supabase
      .from('practice_puzzles')
      .select('puzzles')
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false })
      .limit(10)

    const usedWords = (existingRows ?? []).flatMap((row: any) =>
      (row.puzzles as any[]).map((p: any) => p.answer)
    )

    const wordsThisBatch: string[] = []

    for (let i = 0; i < toGenerate; i++) {
      try {
        const excludeWords = [...usedWords, ...wordsThisBatch]
        const puzzles = await generatePuzzles(difficulty, excludeWords)
        wordsThisBatch.push(...puzzles.map(p => p.answer))
        await supabase
          .from('practice_puzzles')
          .insert({ difficulty, puzzles, used: false })
        results[difficulty]++
      } catch (e) {
        console.error(`Failed to generate ${difficulty} set:`, e)
      }
    }
  }

  return NextResponse.json({ generated: results })
}
