import { useMemo, useState } from 'react'
import neighborhoods from '../data/neighborhoods.json'
import NeighborhoodCard from '../components/NeighborhoodCard.jsx'

export default function Neighborhoods() {
  const sides = useMemo(() => ['All', ...new Set(neighborhoods.map((n) => n.side))], [])
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? neighborhoods : neighborhoods.filter((n) => n.side === active)

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-black text-5xl text-ink mb-3">Chicago Neighborhoods</h1>
      <p className="text-slate max-w-2xl mb-8">
        Chicago's 77 official community areas break down into a handful of
        "sides." Filter by side of the city to narrow things down.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        {sides.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-4 py-2 text-sm font-mono rounded-xl border transition-colors ${
              active === s
                ? 'bg-municipal text-porcelain border-municipal'
                : 'border-municipal/20 text-ink hover:border-flagred'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {filtered.map((n) => <NeighborhoodCard key={n.slug} item={n} base="neighborhoods" />)}
      </div>
    </div>
  )
}
