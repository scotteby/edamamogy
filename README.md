# Edamamogy

A daily word etymology game. Combine Latin and Greek root beans to build words.

## Setup

### 1. Supabase

Create a new Supabase project and run this SQL in the SQL Editor:

```sql
create table highscores (
  id bigint generated always as identity primary key,
  date text not null unique,
  score integer not null default 0,
  set_at text not null default '',
  puzzles jsonb,
  updated_at timestamp with time zone default now()
);

alter table highscores enable row level security;

create policy "Allow public read" on highscores for select using (true);
create policy "Allow public insert" on highscores for insert with check (true);
create policy "Allow public update" on highscores for update using (true);
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Vercel deployment

Add the same three environment variables in:
**Vercel → Project → Settings → Environment Variables**

### 4. Deploy

Push to GitHub — Vercel auto-deploys.

## Development

```bash
npm install
npm run dev
```

## Game modes

- `/` — Home screen with today's high score
- `/game` — Daily game: tap beans to assemble words in order
- `/practice` — Practice mode: tap the missing root from 4 options
