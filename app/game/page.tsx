'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Puzzle, Root, GameResult } from '@/types'
import { getLocalDate, supabase } from '@/lib/supabase'
import { calcScore, maxPossibleScore, scoreEmoji, scoreMessage, MAX_TIME, PUZZLES_PER_DAY } from '@/lib/scoring'
import Pod from '@/components/Pod'
import Bean from '@/components/Bean'
import Timer from '@/components/Timer'
import EtymologyCard from '@/components/EtymologyCard'
import ProgressDots from '@/components/ProgressDots'

type Screen = 'loading' | 'game' | 'summary'
type AnswerState = 'unanswered' | 'correct' | 'wrong' | 'timeout'

export default function GamePage() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [qi, setQi] = useState(0)
  const [slots, setSlots] = useState<(Root | null)[]>([])
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set())
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [feedback, setFeedback] = useState('')
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [answersRevealed, setAnswersRevealed] = useState(false)
  const [timeUsed, setTimeUsed] = useState(0)
  const [results, setResults] = useState<GameResult[]>([])
  const [dotResults, setDotResults] = useState<(boolean | null)[]>(Array(PUZZLES_PER_DAY).fill(null))
  const [totalScore, setTotalScore] = useState(0)
  const [highscore, setHighscore] = useState<{ score: number; setAt: string } | null>(null)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const startTimeRef = useRef<number>(0)
  const today = getLocalDate()
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => { loadGame() }, [])

  useEffect(() => {
    if (!timerKey) return
    const timer = setTimeout(() => {
      setAnswersRevealed(true)
      setTimerRunning(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [timerKey])

async function loadGame() {
  try {
    // Load high score from Supabase separately
    const { data: existing } = await supabase
      .from('edamamogy_highscores')
      .select('score, set_at, puzzles')
      .eq('date', today)
      .maybeSingle()

    if (existing?.score) {
      setHighscore({ score: existing.score, setAt: existing.set_at })
    }

    // Always fetch fresh puzzles from the API
    // The API route handles caching in Supabase internally
    const res = await fetch('/api/questions')
    const json = await res.json()
    const loadedPuzzles: Puzzle[] = json.puzzles

    setPuzzles(loadedPuzzles)
    initPuzzle(loadedPuzzles[0])
    setScreen('game')
  } catch {
    const res = await fetch('/api/questions')
    const json = await res.json()
    setPuzzles(json.puzzles)
    initPuzzle(json.puzzles[0])
    setScreen('game')
  }
}

  function initPuzzle(puzzle: Puzzle) {
    setSlots(Array(puzzle.roots.length).fill(null))
    setUsedIds(new Set())
    setAnswerState('unanswered')
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
    setFeedback(`Time's up! The word was: ${puzzles[qi].answer}`)
    recordResult(false, MAX_TIME)
  }, [answerState, puzzles, qi])

  function placeBean(root: Root) {
    if (answerState !== 'unanswered') return
    const nextSlot = slots.findIndex(s => s === null)
    if (nextSlot === -1) return
    const newSlots = [...slots]
    newSlots[nextSlot] = root
    setSlots(newSlots)
    setUsedIds(prev => new Set([...prev, root.id]))
  }

  function removeFromSlot(index: number) {
    if (answerState !== 'unanswered') return
    const root = slots[index]
    if (!root) return
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
    setUsedIds(prev => { const n = new Set(prev); n.delete(root.id); return n })
  }

  function clearPod() {
    setSlots(Array(puzzles[qi].roots.length).fill(null))
    setUsedIds(new Set())
  }

  function checkAnswer() {
    const puzzle = puzzles[qi]
    const filled = slots.filter(Boolean) as Root[]
    if (filled.length !== puzzle.roots.length) return

    const correct = puzzle.roots.every((r, i) => filled[i]?.id === r.id)
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)

    setTimerRunning(false)

    if (correct) {
      setAnswerState('correct')
      const pts = calcScore(true, elapsed)
      const bonus = pts - 10
      setFeedback(bonus > 0 ? `Correct! +${pts} pts (includes +${bonus} speed bonus)` : `Correct! +${pts} pts`)
      recordResult(true, elapsed)
    } else {
      setAnswerState('wrong')
      setFeedback(`Not quite — try a different combination`)
      setShakeKey(k => k + 1)
      setTimeout(() => {
        clearPod()
        setAnswerState('unanswered')
        setFeedback('')
        setTimerRunning(true)
      }, 1200)
    }
  }

  function recordResult(correct: boolean, elapsed: number) {
    const puzzle = puzzles[qi]
    const pts = calcScore(correct, elapsed)
    const result: GameResult = { puzzleId: puzzle.id, correct, timeUsed: elapsed, pts }
    const newResults = [...results, result]
    const newScore = totalScore + pts
    setResults(newResults)
    setTotalScore(newScore)
    setDotResults(prev => { const n = [...prev]; n[qi] = correct; return n })
  }

  async function nextPuzzle() {
    if (qi + 1 >= puzzles.length) {
      await finishGame()
    } else {
      const next = qi + 1
      setQi(next)
      initPuzzle(puzzles[next])
    }
  }

  async function finishGame() {
    const finalScore = results.reduce((sum, r) => sum + r.pts, 0) + (answerState === 'correct' ? 0 : 0)
    const setAt = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    try {
      const res = await fetch('/api/highscore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, score: totalScore, set_at: setAt, puzzles })
      })
      const json = await res.json()
      setIsNewRecord(json.isNewRecord)
      setHighscore({ score: json.bestScore, setAt })
    } catch { }

    setScreen('summary')
  }

  const allFilled = puzzles[qi] && slots.every(s => s !== null)
  const puzzle = puzzles[qi]
  const allBeans = puzzle ? [...puzzle.roots, ...puzzle.decoys].sort(() => Math.random() - 0.5) : []

  if (screen === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🌱</p>
          <p className="text-gray-500 text-sm">Growing today's roots...</p>
        </div>
      </main>
    )
  }

  if (screen === 'summary') {
    return <SummaryScreen
      results={results}
      puzzles={puzzles}
      totalScore={totalScore}
      highscore={highscore}
      isNewRecord={isNewRecord}
      dateStr={dateStr}
    />
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-4">
      <div className="w-full max-w-sm">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-1">
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">← back</Link>
          <h1 className="text-base font-medium text-white">Edamamogy</h1>
          <div className="text-sm text-gray-600">daily</div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-white/5 rounded-full my-2">
          <div
            className="h-full bg-[#3B6D11] rounded-full transition-all duration-500"
            style={{ width: `${(qi / puzzles.length) * 100}%` }}
          />
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#3B6D11] font-medium">Word {qi + 1} / {puzzles.length}</span>
          <ProgressDots total={PUZZLES_PER_DAY} current={qi} results={dotResults} />
          {answersRevealed && <Timer maxTime={MAX_TIME} running={timerRunning} onExpire={handleTimerExpire} resetKey={timerKey} />}
        </div>

        {/* Definition card */}
        <div className="bg-[#161d2e] border border-white/10 rounded-2xl p-3 mb-3 fade-up">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-1">What word means...</p>
          <p className="text-base text-white leading-snug">{puzzle.definition}</p>
          <p className="text-sm text-gray-600 italic mt-1">{puzzle.partOfSpeech}</p>
        </div>

        {/* Pod */}
        <div className="mb-3" key={`pod-${shakeKey}`}>
          <Pod
            slots={slots}
            totalSlots={puzzle.roots.length}
            revealed={answerState === 'correct' || answerState === 'timeout'}
            answer={puzzle.answer}
            onRemove={removeFromSlot}
          />
        </div>

        {/* Beans tray */}
        {answerState === 'unanswered' && answersRevealed && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {allBeans.map(root => (
                <Bean
                  key={root.id}
                  root={root}
                  used={usedIds.has(root.id)}
                  onClick={() => placeBean(root)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <p className={`text-sm text-center mb-2 fade-up ${answerState === 'correct' ? 'text-[#97C459]' : 'text-red-400'}`}>
            {feedback}
          </p>
        )}

        {/* Etymology reveal */}
        {(answerState === 'correct' || answerState === 'timeout') && (
          <div className="mb-3">
            <EtymologyCard fact={puzzle.etymologyFact} answer={puzzle.answer} />
          </div>
        )}

        {/* Action buttons */}
        {answerState === 'unanswered' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={checkAnswer}
              disabled={!allFilled}
              className="w-full py-3 bg-[#3B6D11] hover:bg-[#27500A] disabled:opacity-30 disabled:cursor-not-allowed text-[#EAF3DE] rounded-xl text-sm font-medium transition-colors"
            >
              Check answer
            </button>
            <button
              onClick={clearPod}
              className="w-full py-2.5 border border-white/10 hover:border-white/20 text-gray-500 rounded-xl text-sm transition-colors"
            >
              Clear pod
            </button>
          </div>
        )}

        {(answerState === 'correct' || answerState === 'timeout') && (
          <button
            onClick={nextPuzzle}
            className="w-full py-3 bg-[#3B6D11] hover:bg-[#27500A] text-[#EAF3DE] rounded-xl text-sm font-medium transition-colors"
          >
            {qi + 1 >= puzzles.length ? 'See results →' : 'Next word →'}
          </button>
        )}

      </div>
    </main>
  )
}

function SummaryScreen({ results, puzzles, totalScore, highscore, isNewRecord, dateStr }: {
  results: GameResult[]
  puzzles: Puzzle[]
  totalScore: number
  highscore: { score: number; setAt: string } | null
  isNewRecord: boolean
  dateStr: string
}) {
  const max = maxPossibleScore()
  const emoji = scoreEmoji(totalScore)
  const msg = scoreMessage(totalScore)

  const shareText = `Edamamogy — ${dateStr}\n\n${emoji} I scored ${totalScore}/${max}\n\n${results.map((r, i) => `${puzzles[i]?.roots.map(ro => ro.text).join(' + ')} = ${puzzles[i]?.answer} ${r.correct ? '✓' : '✗'}`).join('\n')}\n\n#Edamamogy`

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm fade-up">

        <div className="text-center mb-6">
          <p className="text-4xl mb-2">{emoji}</p>
          <p className="text-xl font-medium text-white mb-1">{msg}</p>
          <p className="text-sm text-gray-500">{dateStr}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Your score', val: `${totalScore}/${max}`, color: 'text-[#97C459]' },
            { label: "Today's best", val: highscore ? `${highscore.score}/${max}` : '—', color: 'text-white' },
            { label: 'Words correct', val: `${results.filter(r => r.correct).length}/${results.length}`, color: 'text-white' },
          ].map(c => (
            <div key={c.label} className="bg-[#161d2e] rounded-xl p-3 text-center">
              <p className="text-sm text-gray-600 mb-1">{c.label}</p>
              <p className={`text-lg font-medium ${c.color}`}>{c.val}</p>
            </div>
          ))}
        </div>

        {/* High score block */}
        {highscore && (
          <div className="bg-[#161d2e] border border-white/10 rounded-xl p-4 mb-5">
            <p className="text-sm text-gray-600 uppercase tracking-wider mb-3">Today's high score</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-medium text-[#97C459]">{highscore.score} <span className="text-base text-gray-600">/ {max}</span></p>
                <p className="text-sm text-gray-600 mt-1">Set at {highscore.setAt}</p>
              </div>
              {isNewRecord
                ? <span className="text-sm bg-[#1a2e0a] border border-[#3B6D11]/40 text-[#97C459] px-3 py-1 rounded-full">New record!</span>
                : totalScore < highscore.score
                  ? <p className="text-sm text-gray-600 text-right">Need<br /><span className="text-[#97C459] font-medium">{highscore.score - totalScore + 1} more pts</span><br />to beat it</p>
                  : null
              }
            </div>
          </div>
        )}

        {/* Result rows */}
        <div className="bg-[#161d2e] border border-white/10 rounded-xl p-4 mb-5">
          {results.map((r, i) => {
            const p = puzzles[i]
            if (!p) return null
            return (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex-1 mr-3">
                  <p className="text-sm text-white">{p.answer}</p>
                  <p className="text-sm text-gray-600">{p.roots.map(ro => ro.text).join(' + ')}</p>
                </div>
                <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${r.correct ? 'bg-[#1a2e0a] text-[#97C459]' : 'bg-red-900/30 text-red-400'}`}>
                  {r.correct ? `+${r.pts} pts` : '0 pts'}
                </span>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => navigator.share ? navigator.share({ text: shareText }) : navigator.clipboard.writeText(shareText)}
          className="w-full py-3 bg-[#3B6D11] hover:bg-[#27500A] text-[#EAF3DE] rounded-xl text-sm font-medium mb-3 transition-colors"
        >
          Share result
        </button>
        <Link href="/" className="block w-full py-2.5 border border-white/10 hover:border-white/20 text-gray-500 rounded-xl text-sm text-center transition-colors">
          Back to home
        </Link>

      </div>
    </main>
  )
}
