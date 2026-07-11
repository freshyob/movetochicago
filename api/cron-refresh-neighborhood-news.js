// api/cron-refresh-neighborhood-news.js
//
// Scheduled job that keeps a small "recent news" list for each neighborhood
// and suburb, shown on that place's detail page. Runs once a day, picks the
// next place in rotation (same rotation approach as cron-refresh-stories.js,
// offset by a day so the two don't always hit the same place), and searches
// trusted sources for real, current items that specifically mention it.
//
// Unlike cron-refresh-stories.js, this is short factual blurbs with a
// visible source link — not long-form content under Jason's byline — so it
// publishes automatically, same reasoning as cron-refresh-daily-content.js.
//
// Setup: same ANTHROPIC_API_KEY / CRON_SECRET / Vercel KV as the other cron
// jobs — no additional setup if those are already configured.

import { kv } from '@vercel/kv'
import fs from 'fs'
import path from 'path'

const neighborhoods = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/neighborhoods.json'), 'utf-8'))
const suburbs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/suburbs.json'), 'utf-8'))

const TRUSTED_SOURCES = [
  'Block Club Chicago',
  'Chicago Sun-Times',
  'WBEZ',
  'Chicago Tribune',
  'Crain\'s Chicago Business',
  'Patch (local editions)',
  'Daily Herald (for suburbs)',
]

const MAX_ITEMS_PER_PLACE = 5

function pickSubject() {
  const all = [...neighborhoods, ...suburbs]
  // Offset by 1 from the stories rotation so the two jobs don't always
  // land on the same place on the same day.
  const dayIndex = Math.floor(Date.now() / 86400000) + 1
  return all[dayIndex % all.length]
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const place = pickSubject()

  const prompt = `Search the web for real, current news specifically about
${place.name}, a Chicago neighborhood/suburb, from these trusted sources
only: ${TRUSTED_SOURCES.join(', ')}.

Find up to 2 real, current items that specifically mention ${place.name} by
name — local development news, a business opening or closing, a community
event, a safety or infrastructure story, anything genuinely current and
specific to this place. Do not use anything that only mentions ${place.name}
in passing as part of a broader Chicago-wide list.

If you can't find anything genuinely current and specific with a real URL,
return an empty items array rather than inventing something.

For each item, write a short ORIGINAL summary (1-2 sentences, no direct
quotes) and include the real source name and real specific URL.

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "items": [
    { "headline": "string", "summary": "string", "source": "string", "url": "string" }
  ]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    })

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)

    const data = await response.json()
    const textBlock = data.content.find((b) => b.type === 'text')
    const cleaned = (textBlock?.text || '').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const key = `neighborhood-news:${place.slug}`
    const existing = (await kv.get(key)) || []
    const existingUrls = new Set(existing.map((i) => i.url))

    const freshItems = (parsed.items || [])
      .filter((i) => i.url && !existingUrls.has(i.url))
      .map((i) => ({ ...i, addedAt: new Date().toISOString() }))

    const merged = [...freshItems, ...existing].slice(0, MAX_ITEMS_PER_PLACE)
    await kv.set(key, merged)

    res.status(200).json({ ok: true, place: place.slug, added: freshItems.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh neighborhood news', detail: String(err) })
  }
}
