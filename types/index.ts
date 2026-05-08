export interface Root {
  id: string
  text: string
  meaning: string
  origin: string // e.g. "Greek: bios"
}

export interface Puzzle {
  id: string
  answer: string           // e.g. "Telescope"
  definition: string
  partOfSpeech: string
  roots: Root[]            // ordered correct roots e.g. [tele, scope]
  decoys: Root[]           // wrong beans shown in concept 1 tray / concept 2 options
  etymologyFact: string    // shown after answer revealed
}

export interface DailySet {
  date: string             // YYYY-MM-DD local
  puzzles: Puzzle[]
}

export interface HighScore {
  date: string
  score: number
  set_at: string
  puzzles: Puzzle[]
}

export interface GameResult {
  puzzleId: string
  correct: boolean
  timeUsed: number
  pts: number
}
