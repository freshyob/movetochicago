export default function PlaceFacts({ item }) {
  const hasAny =
    item.distanceFromLoop || item.famousResidents || item.funFacts || item.popularSpots || item.rankings

  if (!hasAny) return null

  return (
    <div className="mb-12 space-y-6">
      {(item.distanceFromLoop || item.rankings) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {item.distanceFromLoop && (
            <div className="border border-municipal/15 p-5 rounded-xl">
              <div className="font-mono text-xs uppercase text-slate mb-1">Distance from the Loop</div>
              <p className="text-sm text-ink">{item.distanceFromLoop}</p>
            </div>
          )}
          {item.rankings && item.rankings.length > 0 && (
            <div className="border border-flagred/20 bg-flagred/5 p-5 rounded-xl">
              <div className="font-mono text-xs uppercase text-flagred mb-1">Recognition</div>
              <ul className="text-sm text-ink space-y-1">
                {item.rankings.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {item.funFacts && item.funFacts.length > 0 && (
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-2">Fun Facts</div>
          <ul className="text-sm text-ink space-y-2 list-disc pl-4">
            {item.funFacts.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </div>
      )}

      {item.famousResidents && item.famousResidents.length > 0 && (
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-2">Famous Residents</div>
          <ul className="text-sm text-ink space-y-1.5">
            {item.famousResidents.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      )}

      {item.popularSpots && item.popularSpots.length > 0 && (
        <div className="border border-municipal/15 p-5 rounded-xl">
          <div className="font-mono text-xs uppercase text-slate mb-2">Popular Restaurants &amp; Bars</div>
          <div className="flex flex-wrap gap-2">
            {item.popularSpots.map((s) => (
              <span key={s.name} className="text-xs font-mono px-3 py-1.5 bg-limestone/60 text-ink rounded-xl">
                {s.name} <span className="text-slate">· {s.type}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
