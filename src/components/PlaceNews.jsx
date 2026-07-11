import { useEffect, useState } from 'react'

export default function PlaceNews({ slug }) {
  const [news, setNews] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/neighborhood-news?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setNews(data.items || []))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [slug])

  if (!loaded || news.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="font-display font-bold text-2xl mb-4">Recent News</h2>
      <div className="space-y-3">
        {news.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block border border-municipal/15 p-4 rounded-xl hover:border-flagred transition-colors"
          >
            <div className="text-sm font-semibold text-ink mb-1">{item.headline}</div>
            <p className="text-xs text-slate leading-relaxed mb-1">{item.summary}</p>
            <div className="text-[11px] font-mono text-slate">{item.source}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
