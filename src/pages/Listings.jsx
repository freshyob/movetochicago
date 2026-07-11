import { useEffect, useState } from 'react'
import ListingCard from '../components/ListingCard.jsx'
import { fetchListings } from '../lib/idx.js'

export default function Listings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings({ limit: 24 }).then((data) => {
      setListings(data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display font-black text-5xl text-ink mb-3">Current Listings</h1>
      <p className="text-slate max-w-2xl mb-10">
        Every listing here comes from the RE/MAX Metropolitan IL MLS feed.
      </p>

      {loading ? (
        <p className="text-sm text-slate">Loading listings…</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  )
}
