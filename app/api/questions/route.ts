import { NextResponse } from 'next/server'
import { SAMPLE_PUZZLES } from '@/lib/samplePuzzles'

export async function GET() {
  const DATE_STR = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
  }

  const prompt = `Generate 5 etymology word puzzles for a daily word game called Edamamogy (${DATE_STR}).

Each puzzle shows players a word's definition and they must assemble the correct Latin/Greek root "beans" to build the word.

Return ONLY valid JSON — no markdown, no backticks, no explanation:

{
  "puzzles": [
    {
      "id": "unique_word_id",
      "answer": "TheWord",
      "definition": "Clear definition of the word",
      "partOfSpeech": "noun",
      "roots": [
        { "id": "root1", "text": "root1", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "root2", "text": "root2", "meaning": "what it means", "origin": "Greek/Latin: sourceword" }
      ],
      "decoys": [
        { "id": "decoy1", "text": "decoy1", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy2", "text": "decoy2", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy3", "text": "decoy3", "meaning": "what it means", "origin": "Greek/Latin: sourceword" },
        { "id": "decoy4", "text": "decoy4", "meaning": "what it means", "origin": "Greek/Latin: sourceword" }
      ],
      "etymologyFact": "Interesting 2-3 sentence fact about this word's origin and related words"
    }
  ]
}

Rules:
- Mix 2-root and 3-root words (mostly 2-root for easier play)
- Use well-known Greek/Latin roots that appear in many English words
- Decoys should be plausible but wrong roots
- Etymology facts should mention 2-3 other common words that share the same root
- Words should be recognizable but not too obvious (telescope, hydrophobia, philanthropy, chronology level)
- Mix categories: science, medicine, art, philosophy, geography`

  try {
    const https = require('https')
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText: string = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      }
      const req = https.request(options, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => data += chunk)
        res.on('end', () => resolve(data))
      })
      req.on('error', reject)
      req.write(body)
      req.end()
    })

    const json = JSON.parse(responseText)
    if (!json.content?.[0]?.text) {
      return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
    }

    const text = json.content[0].text.trim()
      .replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim()

    const parsed = JSON.parse(text)
    return NextResponse.json({ puzzles: parsed.puzzles })
  } catch {
    return NextResponse.json({ puzzles: SAMPLE_PUZZLES })
  }
}
