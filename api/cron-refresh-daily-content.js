// api/cron-refresh-daily-content.js
//
// Scheduled job (see vercel.json "crons") that refreshes the Chicago Daily
// feed once a day. It calls the Claude API with the web_search tool to pull
// current Chicago news, food openings, festivals, and school announcements,
// asks for structured JSON back, and writes the result to Vercel KV for
// daily-content.js to serve.
//
// Setup:
//   1. Get an Anthropic API key: https://console.anthropic.com
//   2. In Vercel: Project Settings → Environment Variables → add
//      ANTHROPIC_API_KEY and CRON_SECRET (any random string you choose).
//   3. vercel.json already schedules this to run once daily — Vercel adds
//      the same CRON_SECRET as a Bearer token automatically when it calls
//      this endpoint, which is what the check below verifies.
//
// This uses the real Anthropic API (api.anthropic.com), which is billed
// per-request — unlike Claude usage inside claude.ai/artifacts, a deployed
// site like this needs its own API key and pays standard API rates.

import { kv } from '@vercel/kv'

const CATEGORIES = ['News', 'Food', 'Festivals', 'Schools']

export default async function handler(req, res) {
  // Verify this is actually the Vercel Cron trigger, not a public request.
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const prompt = `You help maintain a Chicago relocation website. Search the web for
what's genuinely current today in Chicago across these four categories:
${CATEGORIES.join(', ')}. For each category, find 1-2 real, current items
(a real festival happening soon, a real recent restaurant opening, a real
current news story relevant to someone new to the city, a real CPS/school
enrollment deadline or announcement). For each item, write a short original
summary in your own words (2-3 sentences, do not quote sources directly) and
include the source name and a real URL you found it at.

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact
shape:
{
  "items": [
    { "id": "string", "category": "News|Food|Festivals|Schools", "headline": "string", "summary": "string", "source": "string", "url": "string" }
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
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const textBlock = data.content.find((b) => b.type === 'text')
    const cleaned = (textBlock?.text || '').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const payload = {
      generatedAt: new Date().toISOString(),
      items: parsed.items,
    }

    await kv.set('daily-content', payload)
    res.status(200).json({ ok: true, count: parsed.items.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh daily content', detail: String(err) })
  }
}
