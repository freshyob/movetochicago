import { useEffect, useMemo, useState } from 'react'
import seedStories from '../data/stories.json'
import StoryCard from '../components/StoryCard.jsx'

export default function Stories() {
  const [stories, setStories] = useState(seedStories)
  const [active, setActive] = useState('All')

  useEffect(() => {
    // /api/stories serves seed stories + any auto-generated, approved
    // stories from the daily ghostwriting pipeline (see api/cron-refresh-stories.js).
    // Falls back silently to the bundled seed list if the endpoint isn't
    // deployed yet or KV isn't configured.
    fetch('/api/stories')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setStories(data.stories || seedStories))
      .catch(() => {})
  }, [])

  const types = useMemo(() => ['All', ...new Set(stories.map((s) => s.type))], [stories])
  const filtered = active === 'All' ? stories : stories.filter((s) => s.type === active)

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-black text-5xl text-ink mb-3">Chicago Stories</h1>
      <p className="text-slate max-w-2xl mb-2">
        Neighborhood stories, restaurant reviews, and festival previews —
        written for people deciding where in Chicago to land, not just
        visiting for a weekend.
      </p>
      <p className="text-slate max-w-2xl mb-8">
        Whether you're moving across the street or across the world, we think
        it's about more than finding the right house — it's about finding the
        right neighborhood.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-2 text-sm font-mono rounded-xl border transition-colors ${
              active === t
                ? 'bg-municipal text-porcelain border-municipal'
                : 'border-municipal/20 text-ink hover:border-flagred'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((s, i) => (
          <StoryCard key={s.slug} story={s} featured={i === 0 && active === 'All'} />
        ))}
      </div>
    </div>
  )
}
