// api/stories.js
//
// GET endpoint the frontend calls to load the full Chicago Stories list —
// the hand-written seed stories bundled in the app PLUS any auto-generated
// stories that have been approved (see approve-story.js). The seed stories
// always show; approved stories are added on top, newest first.

import { kv } from '@vercel/kv'
import fs from 'fs'
import path from 'path'

const seedStories = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/stories.json'), 'utf-8'))

export default async function handler(req, res) {
  try {
    const published = (await kv.get('stories-published')) || []
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
    res.status(200).json({ stories: [...published, ...seedStories] })
  } catch (err) {
    // If KV isn't configured yet, just serve the seed stories so the site
    // still works.
    res.status(200).json({ stories: seedStories })
  }
}
