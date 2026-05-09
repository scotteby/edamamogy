'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase, getLocalDate } from '@/lib/supabase'
import { maxPossibleScore, MAX_TIME, PUZZLES_PER_DAY } from '@/lib/scoring'
import { prefetch } from '@/lib/practiceCache'

export default function Home() {
  const [highscore, setHighscore] = useState<{ score: number; set_at: string } | null>(null)
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    async function loadHS() {
      const today = getLocalDate()
      const { data } = await supabase
        .from('edamamogy_highscores')
        .select('score, set_at')
        .eq('date', today)
        .gt('score', 0)
        .maybeSingle()
      if (data) setHighscore(data)
    }
    loadHS()
    prefetch('medium')
  }, [])

  return (
    <main className="flex flex-col items-center justify-center px-4 py-6" style={{ background: '#f5f7f2', minHeight: '100dvh' }}>
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6 fade-up">
          <h1 className="text-3xl font-medium mb-1" style={{ color: '#1a3a08' }}>Edamamogy</h1>
          <p className="text-sm" style={{ color: '#6b8f5e' }}>word origins, daily</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#3B6D11' }}>{dateStr}</p>
        </div>

        {/* High score banner */}
        <div className="rounded-2xl p-4 mb-5 flex items-center justify-between fade-up"
          style={{ background: '#fff', border: '1px solid #d4e8c2' }}>
          <div>
            <p className="text-xs mb-1" style={{ color: '#6b8f5e' }}>Today's high score</p>
            {highscore ? (
              <>
                <p className="text-xl font-medium" style={{ color: '#3B6D11' }}>{highscore.score} / {maxPossibleScore()}</p>
                <p className="text-xs mt-1" style={{ color: '#9db88a' }}>Set at {highscore.set_at}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium" style={{ color: '#c5d9b8' }}>—</p>
                <p className="text-xs mt-1" style={{ color: '#c5d9b8' }}>No games played yet</p>
              </>
            )}
          </div>
          <span className="text-3xl">🌱</span>
        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 gap-3 mb-6 fade-up">
          {[
            { label: '15 pts', sub: 'correct answer' },
            { label: '+5 bonus', sub: 'answer fast' },
            { label: `${PUZZLES_PER_DAY} words`, sub: 'per day' },
            { label: `${MAX_TIME} sec`, sub: 'per puzzle' },
          ].map(r => (
            <div key={r.label} className="rounded-xl p-3"
              style={{ background: '#fff', border: '1px solid #d4e8c2' }}>
              <p className="text-sm font-medium" style={{ color: '#3B6D11' }}>{r.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b8f5e' }}>{r.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 fade-up">
          <Link
            href="/game"
            className="w-full py-3.5 rounded-xl text-base font-medium text-center transition-colors"
            style={{ background: '#3B6D11', color: '#EAF3DE' }}
          >
            Play today's game
          </Link>
          <Link
            href="/practice"
            className="w-full py-3 rounded-xl text-sm font-medium text-center transition-colors"
            style={{ background: '#fff', border: '1px solid #d4e8c2', color: '#3B6D11' }}
          >
            Practice mode
          </Link>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9db88a' }}>
          Build words from Latin &amp; Greek roots
        </p>
      </div>
    </main>
  )
}
