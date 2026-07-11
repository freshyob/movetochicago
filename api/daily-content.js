// api/daily-content.js
// GET endpoint that serves the most recently generated daily content.
// Requires Vercel KV (or swap for any small key-value/Postgres store).
//
// Setup:
//   1. In the Vercel dashboard: Storage → Create Database → KV, link it to
//      this project. This auto-adds KV_REST_API_URL / KV_REST_API_TOKEN.
//   2. Deploy. This endpoint reads the key "daily-content" that the cron
//      job (cron-refresh-daily-content.js) writes to.

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  try {
    const data = await kv.get('daily-content')
    if (!data) {
      res.status(404).json({ error: 'No daily content generated yet' })
      return
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to load daily content', detail: String(err) })
  }
}
