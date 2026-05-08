import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_anthropic_key: !!process.env.ANTHROPIC_API_KEY,
    time: new Date().toISOString()
  })
}
