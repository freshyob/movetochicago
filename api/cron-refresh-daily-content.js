// api/cron-refresh-daily-content.js
//
// Scheduled job (see vercel.json "crons") that refreshes the Chicago Daily
// feed once a day, covering five categories: News, Food, Festivals,
// Entertainment, and Schools. It calls the Claude API with the web_search
// tool, instructed to pull only from named trusted Chicago outlets, asks
// for structured JSON back, and writes the result to Vercel KV for
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
//
// This runs fully automatically with no human review, unlike the Stories
// pipeline (cron-refresh-stories.js). That's a deliberate difference: these
// are short, clearly-sourced news blurbs with a named source and link, not
// long-form content attributed to a person, so the risk profile is lower.
// If you'd rather add a review step here too, mirror the pending/approve
// pattern from the Stories pipeline.

import { kv } from '@vercel/kv'

const CATEGORIES = ['News', 'Food', 'Festivals', 'Entertainment', 'Schools']

// Named, trusted Chicago sources per category — the model is instructed to
// pull only from these (or say it found nothing) rather than an open web
// search, to keep source quality and copyright posture consistent.
const TRUSTED_SOURCES = {
  News: ['Block Club Chicago', 'Chicago Sun-Times', 'WBEZ', 'Chicago Tribune'],
  Food: ['Eater Chicago', 'Time Out Chicago', 'Chicago Tribune Food & Dining'],
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
website. Search the web for what is genuinely current today in Chicago across
these five categories, pulling ONLY from the named trusted source per
category (search site-specific if helpful, e.g. "site:blockclubchicago.org"):

${sourceList}

For each category, find 1-2 real, current items — an actual recent local
news story, a real recent restaurant opening, a real upcoming festival, a
real current entertainment listing, a real CPS/school announcement or
deadline. If you cannot find a genuinely current item from a trusted source
for a category, skip that category rather than inventing one or using a
lower-quality source.

For each item, write a short ORIGINAL summary in your own words (2-3
sentences, no direct quotes, no close paraphrasing of the source's
sentences) and include the real source name and a real URL you found it at.

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
