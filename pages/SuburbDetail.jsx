import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import suburbs from '../data/suburbs.json'
import ListingCard from '../components/ListingCard.jsx'
import { fetchListings } from '../lib/idx.js'

export default function SuburbDetail() {
  const { slug } = useParams()
  const item = suburbs.find((s) => s.slug === slug)
  const [listings, setListings] = useState([])

  useEffect(() => {
    if (!item) return
    fetchListings({ suburb: item.name, limit: 6 }).then(setListings)
  }, [item])

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-slate">We could not find that suburb.</p>
        <Link to="/suburbs" className="text-flagred font-semibold">← Back to all suburbs</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link to="/suburbs" className="text-sm text-flagred font-semibold">← All Suburbs</Link>

      <div className="mt-6 aspect-[16/7] w-full overflow-hidden rounded-xl bg-limestone relative">
        <img src={item.photo} alt="" className="w-full h-full object-cover" />
        {item.photoCredit && (
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded-xl">
            {item.photoCredit}
          </div>
        )}
      </div>

      <div className="text-xs uppercase tracking-wide text-slate font-mono mt-6 mb-2">{item.region}</div>
      <h1 className="font-display font-black text-6xl text-ink leading-none mb-6">{item.name}</h1>
      <p className="text-lg text-slate leading-relaxed mb-8">{item.description}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-1">Commute</div>
          <p className="text-sm text-ink">{item.commute}</p>
        </div>
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-1">Schools</div>
          <p className="text-sm text-ink">{item.schools}</p>
        </div>
      </div>

      <h2 className="font-display font-bold text-2xl mb-4">Homes for Sale in {item.name}</h2>
      {listings.length === 0 ? (
        <p className="text-sm text-slate">No active listings in this area right now — check back soon, or ask an agent directly.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
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
