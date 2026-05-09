'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Puzzle, Root } from '@/types'
import { calcScore, maxPossibleScore, scoreEmoji, scoreMessage, MAX_TIME, PUZZLES_PER_DAY } from '@/lib/scoring'
import { consume } from '@/lib/practiceCache'
import EtymologyCard from '@/components/EtymologyCard'
import ProgressDots from '@/components/ProgressDots'
import Timer from '@/components/Timer'
import Pod from '@/components/Pod'

type AnswerState = 'unanswered' | 'correct' | 'wrong' | 'timeout'
type Difficulty = 'easy' | 'medium' | 'hard'

export default function PracticePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [qi, setQi] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [chosenId, setChosenId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [answersRevealed, setAnswersRevealed] = useState(false)
  const [results, setResults] = useState<{ correct: boolean; pts: number }[]>([])
  const [dotResults, setDotResults] = useState<(boolean | null)[]>(Array(PUZZLES_PER_DAY).fill(null))
  const [totalScore, setTotalScore] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [missingIndex, setMissingIndex] = useState(0)
  const [options, setOptions] = useState<Root[]>([])
  const startTimeRef = useRef<number>(0)
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => { loadPuzzles(difficulty) }, [difficulty])

  useEffect(() => {
    if (!timerKey) return
    const timer = setTimeout(() => {
      setAnswersRevealed(true)
      setTimerRunning(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [timerKey])

  async function loadPuzzles(diff: Difficulty) {
    setLoading(true)
    const cached = consume(diff)
    const loaded: Puzzle[] = cached ?? await fetch(`/api/questions?difficulty=${diff}`).then(r => r.json()).then(j => j.puzzles)
    setPuzzles(loaded)
    setQi(0)
    setResults([])
    setTotalScore(0)
    setDotResults(Array(PUZZLES_PER_DAY).fill(null))
    setShowSummary(false)
    initPuzzle(loaded, 0)
    setLoading(false)
  }

  function initPuzzle(pList: Puzzle[], index: number) {
    const puzzle = pList[index]
    // Pick a random root to hide
    const hiddenIdx = Math.floor(Math.random() * puzzle.roots.length)
    setMissingIndex(hiddenIdx)
    // Build 4 options: correct + 3 decoys (shuffled)
    const correct = puzzle.roots[hiddenIdx]
    const decoys = puzzle.decoys.slice(0, 3)
    const shuffled = [correct, ...decoys].sort(() => Math.random() - 0.5)
    setOptions(shuffled)
    setAnswerState('unanswered')
    setChosenId(null)
    setFeedback('')
    setAnswersRevealed(false)
    setTimerRunning(false)
    setTimerKey(k => k + 1)
    startTimeRef.current = Date.now()
  }

  const handleTimerExpire = useCallback(() => {
    if (answerState !== 'unanswered') return
    setTimerRunning(false)
    setAnswerState('timeout')
    setFeedback(`Time's up!`)
    pushResult(false, MAX_TIME)
  }, [answerState])

  function selectOption(root: Root) {
    if (answerState !== 'unanswered') return
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    setTimerRunning(false)
    setChosenId(root.id)
    const puzzle = puzzles[qi]
    const correct = root.id === puzzle.roots[missingIndex].id
    if (correct) {
      setAnswerState('correct')
      const pts = calcScore(true, elapsed)
      const bonus = pts - 10
      setFeedback(bonus > 0 ? `Correct! +${pts} pts (includes +${bonus} speed bonus)` : `Correct! +${pts} pts`)
      pushResult(true, elapsed)
    } else {
      setAnswerState('wrong')
      setFeedback(`Not quite — the missing root was "${puzzle.roots[missingIndex].text}"`)
      pushResult(false, elapsed)
    }
  }

  function pushResult(correct: boolean, elapsed: number) {
    const pts = calcScore(correct, elapsed)
    setResults(prev => [...prev, { correct, pts }])
    setTotalScore(prev => prev + pts)
    setDotResults(prev => { const n = [...prev]; n[qi] = correct; return n })
  }

  function nextPuzzle() {
    if (qi + 1 >= puzzles.length) {
      setShowSummary(true)
    } else {
      const next = qi + 1
      setQi(next)
      initPuzzle(puzzles, next)
    }
  }

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Growing roots...</p>
    </main>
  )

  const puzzle = puzzles[qi]

  if (showSummary) {
    const max = maxPossibleScore()
    const emoji = scoreEmoji(totalScore)
    const msg = scoreMessage(totalScore)
    return (
      <main className="min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-sm fade-up">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">{emoji}</p>
            <p className="text-xl font-medium text-white mb-1">{msg}</p>
            <p className="text-sm text-[#3B6D11]">Practice mode</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#161d2e] rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600 mb-1">Score</p>
              <p className="text-lg font-medium text-[#97C459]">{totalScore}/{max}</p>
            </div>
            <div className="bg-[#161d2e] rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600 mb-1">Correct</p>
              <p className="text-lg font-medium text-white">{results.filter(r => r.correct).length}/{results.length}</p>
            </div>
          </div>
          <div className="bg-[#161d2e] border border-white/10 rounded-xl p-4 mb-5">
            {results.map((r, i) => {
              const p = puzzles[i]
              if (!p) return null
              return (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white">{p.answer}</p>
                    <p className="text-sm text-gray-600">{p.roots.map(ro => ro.text).join(' + ')}</p>
                  </div>
                  <span className={`text-sm px-2.5 py-1 rounded-full ${r.correct ? 'bg-[#1a2e0a] text-[#97C459]' : 'bg-red-900/30 text-red-400'}`}>
                    {r.correct ? `+${r.pts}` : '0 pts'}
                  </span>
                </div>
              )
            })}
          </div>
          <Link href="/game" className="block w-full py-3 bg-[#3B6D11] hover:bg-[#27500A] text-[#EAF3DE] rounded-xl text-sm font-medium text-center mb-3 transition-colors">
            Play daily game
          </Link>
          <button onClick={() => { setQi(0); setResults([]); setTotalScore(0); setDotResults(Array(PUZZLES_PER_DAY).fill(null)); setShowSummary(false); initPuzzle(puzzles, 0) }}
            className="w-full py-2.5 border border-white/10 text-gray-500 rounded-xl text-sm transition-colors">
            Practice again
          </button>
        </div>
      </main>
    )
  }

  const missingRoot = puzzle.roots[missingIndex]

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-2">
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">← back</Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Practice</span>
            <div className="flex gap-1">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => { if (d !== difficulty) setDifficulty(d) }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    difficulty === d
                      ? 'bg-[#3B6D11] border-[#3B6D11] text-[#EAF3DE]'
                      : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-[3px] bg-white/5 rounded-full my-2">
          <div className="h-full bg-[#3B6D11] rounded-full transition-all duration-500"
            style={{ width: `${(qi / puzzles.length) * 100}%` }} />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#3B6D11] font-medium">Word {qi + 1} / {puzzles.length}</span>
          <ProgressDots total={PUZZLES_PER_DAY} current={qi} results={dotResults} />
          {answersRevealed && <Timer maxTime={MAX_TIME} running={timerRunning} onExpire={handleTimerExpire} resetKey={timerKey} />}
        </div>

        {/* Pod */}
        <div className="mb-3">
          <Pod
            slots={puzzle.roots.map((r, i) =>
              i === missingIndex && answerState !== 'correct' && answerState !== 'timeout' ? null : r
            )}
            totalSlots={puzzle.roots.length}
            revealed={answerState === 'correct' || answerState === 'timeout'}
            answer={puzzle.answer}
            onRemove={() => {}}
          />
        </div>

        {/* Clue card */}
        <div className="bg-[#161d2e] border border-white/10 rounded-2xl p-3 mb-3">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-1">The missing root means...</p>
          <p className="text-base text-white">{missingRoot.meaning}</p>
          <p className="text-sm text-gray-600 italic mt-0.5">{missingRoot.origin}</p>
        </div>

        {/* Option beans */}
        {answersRevealed && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {options.map(opt => {
              const isCorrect = opt.id === missingRoot.id
              const isChosen = opt.id === chosenId
              const isAnswered = answerState !== 'unanswered'
              let cls = 'bg-[#161d2e] border-white/10'
              if (isAnswered && isCorrect) cls = 'bg-[#1a2e0a] border-[#3B6D11]'
              else if (isAnswered && isChosen && !isCorrect) cls = 'bg-red-900/20 border-red-500/50'
              return (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt)}
                  disabled={isAnswered}
                  className={`flex flex-col items-center p-3 rounded-2xl border-[1.5px] transition-all bean ${cls} ${!isAnswered ? 'hover:border-[#3B6D11]/60 hover:bg-[#1a2e0a]/40' : ''}`}
                >
                  <span className={`text-base font-medium ${isAnswered && isCorrect ? 'text-[#97C459]' : isAnswered && isChosen ? 'text-red-400' : 'text-white'}`}>
                    {opt.text}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {feedback && (
          <p className={`text-sm text-center mb-2 fade-up ${answerState === 'correct' ? 'text-[#97C459]' : 'text-red-400'}`}>
            {feedback}
          </p>
        )}

        {(answerState === 'correct' || answerState === 'wrong' || answerState === 'timeout') && (
          <div className="mb-3">
            <EtymologyCard fact={puzzle.etymologyFact} answer={puzzle.answer} />
          </div>
        )}

        {answerState !== 'unanswered' && (
          <button onClick={nextPuzzle}
            className="w-full py-3 bg-[#3B6D11] hover:bg-[#27500A] text-[#EAF3DE] rounded-xl text-sm font-medium transition-colors">
            {qi + 1 >= puzzles.length ? 'See results →' : 'Next word →'}
          </button>
        )}

      </div>
    </main>
  )
}
