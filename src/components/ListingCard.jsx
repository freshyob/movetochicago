export default function ListingCard({ listing }) {
  const price = listing.price?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  return (
    <a
      href={listing.listingUrl}
      target="_blank"
      rel="noreferrer"
      className="group block border border-municipal/15 bg-white overflow-hidden rounded-xl hover:border-flagred transition-colors"
    >
      <div className="aspect-[4/3] overflow-hidden bg-limestone">
        {listing.photo && (
          <img
            src={listing.photo}
            alt={listing.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-4">
        <div className="font-mono text-lg font-semibold text-municipal">{price}</div>
        <div className="text-sm text-ink mt-1">{listing.address}</div>
        <div className="text-xs text-slate font-mono mt-2">
          {listing.beds} bd · {listing.baths} ba · {listing.sqft?.toLocaleString()} sqft
        </div>
      </div>
    </a>
  )
}
