// api/cron-refresh-daily-content.js
//
// Scheduled job (see vercel.json "crons" — runs 3x/day) that grows the
// Chicago Daily feed, covering five categories: News, Food, Festivals,
// Entertainment, and Schools. It calls the Claude API with the web_search
// tool, instructed to pull only from named trusted Chicago outlets, and
// APPENDS new, deduplicated items to a running list in Vercel KV rather
// than overwriting it — so the feed grows through the day instead of
// resetting each run.
//
// Setup:
//   1. Get an Anthropic API key: https://console.anthropic.com
//   2. In Vercel: Project Settings → Environment Variables → add
//      ANTHROPIC_API_KEY and CRON_SECRET (any random string you choose).
//   3. vercel.json schedules this 3x/day — Vercel adds the same CRON_SECRET
//      as a Bearer token automatically when it calls this endpoint, which
//      is what the check below verifies.
//
// This uses the real Anthropic API (api.anthropic.com), billed per-request
// — a deployed site like this needs its own API key at standard API rates.

import { kv } from '@vercel/kv'

const CATEGORIES = ['News', 'Food', 'Festivals', 'Entertainment', 'Schools']
const MAX_ITEMS = 60 // keep the feed from growing forever

const TRUSTED_SOURCES = {
  News: ['Block Club Chicago', 'Chicago Sun-Times', 'WBEZ', 'Chicago Tribune'],
  Food: ['Eater Chicago', 'Time Out Chicago', 'Chicago Tribune Food & Dining', 'WTTW Chicago'],
  Festivals: ['Choose Chicago events calendar', 'Chicago Park District', 'City of Chicago DCASE'],
  Entertainment: ['Time Out Chicago', 'WTTW Chicago', 'Choose Chicago'],
  Schools: ['Chicago Public Schools (cps.edu)', 'Chalkbeat Chicago'],
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const sourceList = CATEGORIES.map((c) => `- ${c}: ${TRUSTED_SOURCES[c].join(', ')}`).join('\n')

  const prompt = `You maintain the "Chicago Daily" feed on a Chicago relocation
website. Search the web for what is genuinely current right now in Chicago
across these five categories, pulling ONLY from the named trusted source per
category:

${sourceList}

For each category, find 1-2 real, current items. Each item MUST link to a
specific article, page, or event listing — never a homepage or a category
index page like "timeout.com/chicago". If you can't find a specific,
current, real item with a real specific URL for a category, skip that
category rather than inventing one or linking to a generic homepage.

For each item, write a short ORIGINAL summary in your own words (2-3
sentences, no direct quotes, no close paraphrasing of the source's
sentences) and include the real source name and the real specific URL.

Respond with ONLY valid JSON, no markdown fences, no preamble, in this exact
shape:
{
  "items": [
    { "id": "string", "category": "News|Food|Festivals|Entertainment|Schools", "headline": "string", "summary": "string", "source": "string", "url": "string" }
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
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    })

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)

    const data = await response.json()
    const textBlock = data.content.find((b) => b.type === 'text')
    const cleaned = (textBlock?.text || '').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Load the existing feed and merge in only genuinely new items (dedupe
    // by URL, since the same real event/article shouldn't show up twice
    // even across multiple runs in a day).
    const existing = (await kv.get('daily-content-items')) || []
    const existingUrls = new Set(existing.map((i) => i.url))

    const freshItems = (parsed.items || [])
      .filter((i) => i.url && !existingUrls.has(i.url))
      .map((i) => ({ ...i, addedAt: new Date().toISOString() }))

    const merged = [...freshItems, ...existing].slice(0, MAX_ITEMS)

    await kv.set('daily-content-items', merged)
    await kv.set('daily-content', { generatedAt: new Date().toISOString(), items: merged })

    res.status(200).json({ ok: true, added: freshItems.length, total: merged.length })
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh daily content', detail: String(err) })
  }
}
