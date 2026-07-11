// api/stories-pending.js
//
// GET endpoint for reviewing draft stories written by cron-refresh-stories.js
// before they go live. Protected by CRON_SECRET so random visitors can't see
// unpublished drafts.
//
// Usage: GET /api/stories-pending?secret=YOUR_CRON_SECRET
// Returns the queue of drafts waiting for a yes/no. Build a simple internal
// page around this (or just call it directly) to review headline, dek, body,
// and source before approving.

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const pending = (await kv.get('stories-pending')) || []
  res.status(200).json({ pending })
}
