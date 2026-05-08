# Edamamogy

A daily word etymology game where players combine Latin/Greek root "beans" to build words.

## Stack
- Framework: Next.js 14 App Router, TypeScript strict
- Database: Supabase (highscores table)
- Styling: Tailwind CSS, dark theme (#0a0e1a background)
- Hosting: Vercel

## Game modes
- **Daily game** (`/game`) — Concept 1: tap beans to assemble all roots in correct order
- **Practice mode** (`/practice`) — Concept 2: one root is hidden, pick it from 4 options

## Supabase table: highscores
```sql
create table highscores (
  id bigint generated always as identity primary key,
  date text not null unique,
  score integer not null default 0,
  set_at text not null default '',
  puzzles jsonb,
  updated_at timestamp with time zone default now()
);
```

## Key files
- `types/index.ts` — all shared types (Puzzle, Root, GameResult etc.)
- `lib/supabase.ts` — Supabase client + getLocalDate() helper
- `lib/scoring.ts` — score calculation constants and helpers
- `lib/samplePuzzles.ts` — fallback puzzles if API fails
- `app/api/questions/route.ts` — generates daily puzzles via Claude API
- `app/api/highscore/route.ts` — GET/POST high scores
- `components/Pod.tsx` — the bean assembly pod UI
- `components/Bean.tsx` — individual bean button
- `components/Timer.tsx` — countdown timer
- `components/EtymologyCard.tsx` — etymology fact reveal
- `components/ProgressDots.tsx` — 5 dot progress tracker

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` (server-side only)

## Design decisions
- Use getLocalDate() not toISOString() to avoid UTC timezone issues
- Supabase uses .maybeSingle() not .single() to avoid 406 errors
- Puzzles are stored in Supabase alongside highscores so all players share the same daily set
- If Claude API fails, falls back to SAMPLE_PUZZLES
- Bean order matters in daily game — wrong order = shake animation + retry
- Green color palette: #3B6D11 (dark), #97C459 (mid), #EAF3DE (light)
