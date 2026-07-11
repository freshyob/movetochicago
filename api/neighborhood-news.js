// api/neighborhood-news.js
//
// GET /api/neighborhood-news?slug=lincoln-park
// Returns whatever recent news items cron-refresh-neighborhood-news.js has
// collected for that specific place. Returns an empty list (not an error)
// if nothing has been collected for that place yet — most places will be
// empty until the rotation reaches them, which is expected with 42 places
// and one pick per day.

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const { slug } = req.query
  if (!slug) {
    res.status(400).json({ error: 'Missing slug query param' })
    return
  }

  try {
    const items = (await kv.get(`neighborhood-news:${slug}`)) || []
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    res.status(200).json({ items })
  } catch (err) {
    res.status(200).json({ items: [] })
  }
}
