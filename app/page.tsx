'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase, getLocalDate } from '@/lib/supabase'
import { maxPossibleScore, MAX_TIME, PUZZLES_PER_DAY } from '@/lib/scoring'

export default function Home() {
  const [highscore, setHighscore] = useState<{ score: number; set_at: string } | null>(null)
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    async function loadHS() {
      const today = getLocalDate()
      const { data } = await supabase.from('edamamogy_highscores').select('score,set_at').eq('date', today).maybeSingle()
      if (data) setHighscore(data)
    }
    loadHS()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <h1 className="text-3xl font-medium text-white mb-1">Edamamogy</h1>
          <p className="text-sm text-gray-500 tracking-wide">word origins, daily</p>
          <p className="text-sm text-green-400 mt-2">{dateStr}</p>
        </div>

        {/* High score banner */}
        <div className="bg-[#161d2e] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between fade-up">
          <div>
            <p className="text-sm text-gray-500 mb-1">Today's high score</p>
            {highscore ? (
              <>
                <p className="text-xl font-medium text-green-400">{highscore.score} / {maxPossibleScore()}</p>
                <p className="text-sm text-gray-600 mt-1">Set at {highscore.set_at}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium text-gray-600">—</p>
                <p className="text-sm text-gray-700 mt-1">No games played yet</p>
              </>
            )}
          </div>
          <span className="text-3xl">🌱</span>
        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 gap-3 mb-8 fade-up">
          {[
            { label: '10 pts', sub: 'correct answer' },
            { label: '+5 bonus', sub: 'answer fast' },
            { label: `${PUZZLES_PER_DAY} words`, sub: 'per day' },
            { label: `${MAX_TIME} sec`, sub: 'per puzzle' },
          ].map(r => (
            <div key={r.label} className="bg-[#161d2e] border border-white/10 rounded-xl p-3">
              <p className="text-sm font-medium text-green-400">{r.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{r.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 fade-up">
          <Link
            href="/game"
            className="w-full py-3.5 bg-[#3B6D11] hover:bg-[#27500A] text-[#EAF3DE] rounded-xl text-base font-medium text-center transition-colors"
          >
            Play today's game
          </Link>
          <Link
            href="/practice"
            className="w-full py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 rounded-xl text-sm font-medium text-center transition-colors"
          >
            Practice mode
          </Link>
        </div>

        <p className="text-center text-sm text-gray-700 mt-8">
          Build words from Latin &amp; Greek roots
        </p>
      </div>
    </main>
  )
}
