import { useMemo, useState } from 'react'
import suburbs from '../data/suburbs.json'
import NeighborhoodCard from '../components/NeighborhoodCard.jsx'

export default function Suburbs() {
  const regions = useMemo(() => ['All', ...new Set(suburbs.map((s) => s.region))], [])
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? suburbs : suburbs.filter((s) => s.region === active)

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-black text-5xl text-ink mb-3">Chicagoland Suburbs</h1>
      <p className="text-slate max-w-2xl mb-8">
        More space, different schools, a different commute. Filter by region to
        find the suburb that fits.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setActive(r)}
            className={`px-4 py-2 text-sm font-mono rounded-xl border transition-colors ${
              active === r
                ? 'bg-municipal text-porcelain border-municipal'
                : 'border-municipal/20 text-ink hover:border-flagred'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {filtered.map((s) => <NeighborhoodCard key={s.slug} item={s} base="suburbs" />)}
      </div>
    </div>
  )
}
