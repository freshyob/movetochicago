import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import neighborhoods from '../data/neighborhoods.json'
import ListingCard from '../components/ListingCard.jsx'
import { fetchListings } from '../lib/idx.js'
import stories from '../data/stories.json'
import StoryCard from '../components/StoryCard.jsx'
import PlaceFacts from '../components/PlaceFacts.jsx'
import PlaceNews from '../components/PlaceNews.jsx'

export default function NeighborhoodDetail() {
  const { slug } = useParams()
  const item = neighborhoods.find((n) => n.slug === slug)
  const relatedStories = stories.filter((s) => s.relatedNeighborhood === slug)
  const [listings, setListings] = useState([])

  useEffect(() => {
    if (!item) return
    fetchListings({ neighborhood: item.name, limit: 6 }).then(setListings)
  }, [item])

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-slate">We could not find that neighborhood.</p>
        <Link to="/neighborhoods" className="text-flagred font-semibold">← Back to all neighborhoods</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/neighborhoods" className="text-sm text-flagred font-semibold">← All Neighborhoods</Link>

      <div className="mt-6 aspect-[16/7] w-full overflow-hidden rounded-xl bg-limestone relative">
        <img src={item.photo} alt="" className="w-full h-full object-cover" />
        {item.photoCredit && (
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded-xl">
            {item.photoCredit}
          </div>
        )}
      </div>

      <div className="text-xs uppercase tracking-wide text-slate font-mono mt-6 mb-2">{item.side}</div>
      <h1 className="font-display font-black text-6xl text-ink leading-none mb-6">{item.name}</h1>
      <p className="text-lg text-slate leading-relaxed mb-8">{item.description}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-1">Transit</div>
          <ul className="text-sm text-ink space-y-1">
            {item.transit.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-1">Good For</div>
          <p className="text-sm text-ink">{item.goodFor}</p>
        </div>
      </div>

      <PlaceFacts item={item} />
      <PlaceNews slug={item.slug} />

      <h2 className="font-display font-bold text-2xl mb-4">Homes for Sale in {item.name}</h2>
      {listings.length === 0 ? (
        <p className="text-sm text-slate">No active listings in this area right now — check back soon, or ask an agent directly.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}

      {relatedStories.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-2xl mb-4">Stories about {item.name}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {relatedStories.map((s) => <StoryCard key={s.slug} story={s} />)}
          </div>
        </div>
      )}

      <div className="mt-12 bg-limestone/40 p-6 rounded-xl">
        <p className="text-sm text-ink mb-3">Want to see homes in {item.name} in person?</p>
        <a href="https://www.remaxmetropolitanil.com" target="_blank" rel="noreferrer" className="bg-municipal text-porcelain px-5 py-2.5 rounded-xl font-semibold hover:bg-flagred transition-colors inline-block">
          Connect with a RE/MAX Metropolitan IL Agent
        </a>
      </div>
    </div>
  )
}
