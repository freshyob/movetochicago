import { useEffect, useState } from 'react'
import fallback from '../data/dailyContent.seed.json'

const categoryColor = {
  News: 'bg-municipal text-porcelain',
  Food: 'bg-flagred text-porcelain',
  Festivals: 'bg-limestone text-ink',
  Entertainment: 'bg-skyblue text-porcelain',
  Schools: 'bg-slate text-porcelain',
}

export default function ChicagoDaily() {
  const [data, setData] = useState(fallback)

  useEffect(() => {
    // /api/daily-content is populated by a job that runs three times a day
    // (see /api/cron-refresh-daily-content.js), sourcing short, real items
    // from named trusted Chicago outlets. Falls back to the bundled list
    // above if the endpoint isn't reachable yet.
    fetch('/api/daily-content')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-black text-5xl text-ink mb-3">Chicago Daily</h1>
      <p className="text-slate max-w-2xl mb-2">
        A running feed of what's happening in the city — food, festivals,
        schools, and neighborhood news — refreshed throughout the day.
      </p>
      {data.generatedAt && (
        <p className="text-xs font-mono text-slate mb-10">
          Updated {new Date(data.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {data.items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block border border-municipal/15 p-6 rounded-xl hover:border-flagred transition-colors"
          >
            <span className={`inline-block text-xs font-mono px-2 py-1 rounded-xl mb-3 ${categoryColor[item.category] || 'bg-limestone text-ink'}`}>
              {item.category}
            </span>
            <h3 className="font-display font-bold text-xl mb-2 text-ink">{item.headline}</h3>
            <p className="text-sm text-slate leading-relaxed mb-2">{item.summary}</p>
            <div className="text-xs font-mono text-slate">{item.source} — Read more →</div>
          </a>
        ))}
      </div>
    </div>
  )
}
