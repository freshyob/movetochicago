// api/cron-refresh-stories.js
//
// Scheduled job that writes ONE new "Chicago Stories" article per day —
// a Neighborhood Story, Restaurant Review, or Festival Preview — ghostwritten
// under Jason Hinsley's byline, sourced from real current Chicago news.
//
// IMPORTANT — human review gate:
// Unlike the Chicago Daily job (short blurbs with a visible source link),
// this writes a full article attributed to a real, named person (Jason
// Hinsley, Founder & Designated Managing Broker). That carries real risk:
// the model can misstate a fact, mischaracterize a business, or paraphrase
// a source too closely. So this job does NOT publish directly — it writes
// a draft to a "pending" queue in KV. A person has to approve it (via
// api/approve-story.js) before it appears on the live site. This is a
// deliberate design choice, not an oversight — publishing unreviewed
// AI-written text under a real broker's name is a genuine liability and
// trust risk for a brokerage. If you decide you want fully hands-off
// publishing anyway, see the note at the bottom of this file for the
// one-line change that does it — but I'd think hard before flipping that.
//
// Setup: same ANTHROPIC_API_KEY / CRON_SECRET / Vercel KV as
// cron-refresh-daily-content.js — no additional setup needed if that's
// already configured.

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
  'Eater Chicago',
  'Time Out Chicago',
  'Choose Chicago',
  'Crain\'s Chicago Business',
]

const VOICE_GUIDE = `Write in the voice of Jason Hinsley, a Chicago real estate
broker writing for people relocating to the city. Match this style exactly:

- Plain, varied sentence lengths. Not every sentence is the same length or
  shape. Short sentences land hard sometimes. Others run longer with a
  specific concrete detail in them.
- Contractions throughout ("it's", "you're", "doesn't").
- Concrete, specific details — a street name, a CTA line, a wait time, a
  price point — never vague filler like "vibrant" or "eclectic mix."
- One dry aside or bit of personality per piece is good. Don't oversell.
- Never use symmetric "on one hand / on the other hand" constructions, and
  never open three paragraphs in a row the same way.
- End on something specific and practical for someone actually house-hunting
  or considering the area — not a generic summary sentence.
- Absolutely do not sound like AI-generated marketing copy. No "nestled in
  the heart of," no "boasts," no rule-of-three lists piled up for rhythm.
- 3-4 short paragraphs total. This runs on a real estate site, not a
  magazine — keep it tight.`

function pickSubject() {
  // Rotate across all neighborhoods + suburbs so coverage stays broad
  // rather than always writing about the same few places.
  const all = [
    ...neighborhoods.map((n) => ({ ...n, kind: 'neighborhood' })),
    ...suburbs.map((s) => ({ ...s, kind: 'suburb' })),
  ]
  const dayIndex = Math.floor(Date.now() / 86400000) // days since epoch
  return all[dayIndex % all.length]
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const subject = pickSubject()
  const placeName = subject.name

  const prompt = `${VOICE_GUIDE}

Search the web for something genuinely current and specific about
${placeName}, Chicago (a ${subject.kind}) — a real recent restaurant opening,
a real upcoming festival or event, a real piece of local news, a real
development or trend — from one of these trusted sources only:
${TRUSTED_SOURCES.join(', ')}.

If you cannot find anything genuinely current and specific from a trusted
source about ${placeName} itself, it's fine to write a grounded piece about
the neighborhood's/suburb's character instead, but do NOT fabricate a fake
current event or a fake business as if it were news.

Decide which type this piece is: "Neighborhood Story", "Restaurant Review",
or "Festival Preview".

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "type": "Neighborhood Story | Restaurant Review | Festival Preview",
  "title": "string",
  "dek": "one sentence, under 25 words",
  "body": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "sourceUsed": "name of the trusted source used, or 'general knowledge' if none",
  "sourceUrl": "a real URL if one was used, else empty string"
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

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`)

    const data = await response.json()
    const textBlock = data.content.find((b) => b.type === 'text')
    const cleaned = (textBlock?.text || '').replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const draft = {
      id: `pending-${Date.now()}`,
      slug: `${subject.slug}-${Date.now()}`,
      type: parsed.type,
      title: parsed.title,
      dek: parsed.dek,
      body: parsed.body,
      author: 'Jason Hinsley',
      authorTitle: 'Founder & Designated Managing Broker, RE/MAX Metropolitan IL',
      readTime: `${Math.max(2, Math.round(parsed.body.join(' ').split(' ').length / 200))} min read`,
      relatedNeighborhood: subject.slug,
      photo: null, // intentionally left for manual assignment — see README
      sourceUsed: parsed.sourceUsed,
      sourceUrl: parsed.sourceUrl,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }

    const pending = (await kv.get('stories-pending')) || []
    pending.unshift(draft)
    // Cap the pending queue so it doesn't grow forever if nobody reviews it.
    await kv.set('stories-pending', pending.slice(0, 30))

    res.status(200).json({ ok: true, draft: { title: draft.title, slug: draft.slug } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate story draft', detail: String(err) })
  }

  // To make this fully automatic instead of review-gated, you would replace
  // the "stories-pending" write above with a direct merge into
  // "stories-published" (same shape api/stories.js reads). I'd recommend
  // against it, but that's the one line that changes.
}
