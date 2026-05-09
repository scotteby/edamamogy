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
      const { data } = await supabase.from('edamamogy_highscores').select('score,set_at').eq('date', today).maybeSingle()
      if (data) setHighscore(data)
    }
    loadHS()
    prefetch('medium')
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-10 pb-6">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8 fade-up">
          <h1 className="text-3xl font-medium text-gray-900 mb-1">Edamamogy</h1>
          <p className="text-sm text-gray-500 tracking-wide">word origins, daily</p>
          <p className="text-sm text-[#3B6D11] font-medium mt-2">{dateStr}</p>
        </div>

        {/* High score banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex items-center justify-between fade-up">
          <div>
            <p className="text-sm text-gray-500 mb-1">Today's high score</p>
            {highscore?.set_at ? (
              <>
                <p className="text-xl font-medium text-[#3B6D11]">{highscore.score} / {maxPossibleScore()}</p>
                <p className="text-sm text-gray-400 mt-1">Set at {highscore.set_at}</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium text-gray-300">—</p>
                <p className="text-sm text-gray-400 mt-1">No games played yet</p>
              </>
            )}
          </div>
          <span className="text-3xl">🌱</span>
        </div>

        {/* Rules */}
        <div className="grid grid-cols-2 gap-3 mb-8 fade-up">
          {[
            { label: '15 pts', sub: 'correct answer' },
            { label: '+5 bonus', sub: 'answer fast' },
            { label: `${PUZZLES_PER_DAY} words`, sub: 'per day' },
            { label: `${MAX_TIME} sec`, sub: 'per puzzle' },
          ].map(r => (
            <div key={r.label} className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-sm font-medium text-[#3B6D11]">{r.label}</p>
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
            className="w-full py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium text-center transition-colors"
          >
            Practice mode
          </Link>
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          Build words from Latin &amp; Greek roots
        </p>
      </div>
    </main>
  )
}
