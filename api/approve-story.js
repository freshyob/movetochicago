// api/approve-story.js
//
// POST endpoint to approve or reject a pending story draft.
//
// Usage:
//   POST /api/approve-story
//   { "secret": "YOUR_CRON_SECRET", "slug": "the-draft-slug", "action": "approve" }
//   or "action": "reject"
//
// On approve: moves the draft from "stories-pending" into "stories-published"
// (assigning a photo is still a manual step — see README) and it will start
// showing up on /stories and its detail page.
// On reject: just removes it from the pending queue.
//
// A real admin UI would be nicer than curl/Postman for this, but this keeps
// the surface area small — wrap it in whatever internal tool you like.

import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST' })
    return
  }

  const { secret, slug, action, photo, photoCredit } = req.body || {}

  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  if (!slug || !['approve', 'reject'].includes(action)) {
    res.status(400).json({ error: 'Provide slug and action ("approve" or "reject")' })
    return
  }

  const pending = (await kv.get('stories-pending')) || []
  const idx = pending.findIndex((s) => s.slug === slug)
  if (idx === -1) {
    res.status(404).json({ error: 'No pending draft with that slug' })
    return
  }

  const [draft] = pending.splice(idx, 1)
  await kv.set('stories-pending', pending)

  if (action === 'reject') {
    res.status(200).json({ ok: true, rejected: slug })
    return
  }

  // Approve: move into the published list the frontend actually reads.
  const published = (await kv.get('stories-published')) || []
  const finalStory = {
    ...draft,
    status: 'published',
    publishedAt: new Date().toISOString(),
    // Photo is deliberately left blank by the cron job — pass one in here,
    // or default to a neutral placeholder so the layout doesn't break.
    photo: photo || draft.photo || 'https://commons.wikimedia.org/wiki/Special:FilePath/Chicago%20Skyline%20Hi-Res.jpg?width=1200',
    photoCredit: photoCredit || draft.photoCredit || null,
  }
  published.unshift(finalStory)
  // Keep the most recent 60 published auto-stories so the list doesn't grow
  // forever; the hand-written seed stories in stories.json are unaffected.
  await kv.set('stories-published', published.slice(0, 60))

  res.status(200).json({ ok: true, published: finalStory.slug })
}
