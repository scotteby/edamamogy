export const MAX_TIME = 20
export const BASE_PTS = 10
export const MAX_BONUS = 5
export const PUZZLES_PER_DAY = 5

export function calcScore(correct: boolean, timeUsed: number): number {
  if (!correct) return 0
  const bonus = Math.max(0, Math.round(MAX_BONUS * Math.max(0, (10 - timeUsed) / 10)))
  return BASE_PTS + bonus
}

export function maxPossibleScore(): number {
  return PUZZLES_PER_DAY * (BASE_PTS + MAX_BONUS)
}

export function scoreEmoji(score: number): string {
  const pct = score / maxPossibleScore()
  if (pct >= 0.9) return '🌱'
  if (pct >= 0.7) return '⭐'
  if (pct >= 0.5) return '👍'
  return '💡'
}

export function scoreMessage(score: number): string {
  const pct = score / maxPossibleScore()
  if (pct >= 0.9) return 'Incredible roots!'
  if (pct >= 0.7) return 'Great etymologist!'
  if (pct >= 0.5) return 'Good effort!'
  return 'Keep digging!'
}
