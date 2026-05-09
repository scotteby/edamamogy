import { Puzzle } from '@/types'

type Difficulty = 'easy' | 'medium' | 'hard'

const cache: Partial<Record<Difficulty, Puzzle[]>> = {}

export function getCached(difficulty: Difficulty): Puzzle[] | null {
  return cache[difficulty] ?? null
}

export function prefetch(difficulty: Difficulty): void {
  if (cache[difficulty]) return
  fetch(`/api/questions?difficulty=${difficulty}`)
    .then(r => r.json())
    .then(json => { cache[difficulty] = json.puzzles })
    .catch(() => {})
}

export function consume(difficulty: Difficulty): Puzzle[] | null {
  const puzzles = cache[difficulty] ?? null
  delete cache[difficulty]
  return puzzles
}
