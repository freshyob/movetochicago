// src/lib/idx.js
//
// IDX INTEGRATION NOTES
// ----------------------------------------------------------------------------
// Listings cannot be scraped from remaxmetropolitanil.com — MLS data is
// licensed, and most brokerage sites (including RE/MAX franchise sites) sit
// behind bot detection specifically because scraping violates MLS rules of
// use. To get real listings here, you need one of:
//
//   1. RESO Web API access from your MLS (MRED / Midwest Real Estate Data),
//      requested through your broker/office. This is the modern standard —
//      most Chicago-area MLSs support it directly.
//   2. An IDX vendor that already has a data agreement in place, e.g.
//      IDX Broker, Realtyna (WPL/RESO), or Chime/kvCORE (which RE/MAX
//      franchises often already use for their CRM). These typically hand you
//      either a JS widget to embed, or a REST API + API key.
//   3. RE/MAX's own franchise platform (Booj or similar) may already expose
//      an API or widget you're entitled to as a franchisee — worth asking
//      your broker/IT contact before building a custom integration.
//
// Until credentials are in hand, this file returns mock listings shaped
// exactly like what a RESO Web API response looks like, so swapping in the
// real feed later is a one-function change (see fetchListings below).
// ----------------------------------------------------------------------------

import mockListings from '../data/listings.mock.json'

const IDX_API_BASE = import.meta.env.VITE_IDX_API_BASE // set once you have real credentials
const IDX_API_KEY = import.meta.env.VITE_IDX_API_KEY

export async function fetchListings({ neighborhood, suburb, limit = 12 } = {}) {
  if (!IDX_API_BASE || !IDX_API_KEY) {
    // No real feed configured yet — serve mock data so the site is fully
    // functional during development and design review.
    let results = mockListings
    if (neighborhood) {
      results = results.filter((l) => l.neighborhood === neighborhood)
    }
    if (suburb) {
      results = results.filter((l) => l.suburb === suburb)
    }
    return results.slice(0, limit)
  }

  // Real RESO Web API call once VITE_IDX_API_BASE / VITE_IDX_API_KEY are set.
  // RESO Web API uses OData-style filtering, e.g.:
  //   GET {base}/Property?$filter=City eq 'Chicago'&$top=12
  const params = new URLSearchParams()
  const filters = []
  if (neighborhood) filters.push(`MLSAreaMajor eq '${neighborhood}'`)
  if (suburb) filters.push(`City eq '${suburb}'`)
  if (filters.length) params.set('$filter', filters.join(' and '))
  params.set('$top', String(limit))

  const res = await fetch(`${IDX_API_BASE}/Property?${params.toString()}`, {
    headers: { Authorization: `Bearer ${IDX_API_KEY}` },
  })
  if (!res.ok) throw new Error(`IDX fetch failed: ${res.status}`)
  const data = await res.json()

  // Map RESO fields to the shape the UI expects.
  return (data.value || []).map((p) => ({
    id: p.ListingKey,
    address: p.UnparsedAddress,
    price: p.ListPrice,
    beds: p.BedroomsTotal,
    baths: p.BathroomsTotalInteger,
    sqft: p.LivingArea,
    photo: p.Media?.[0]?.MediaURL,
    neighborhood: p.MLSAreaMajor,
    suburb: p.City,
    status: p.StandardStatus,
    listingUrl: p.ListingURL,
  }))
}
