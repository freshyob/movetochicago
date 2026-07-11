import { Link } from 'react-router-dom'

export default function NeighborhoodCard({ item, base = 'neighborhoods' }) {
  return (
    <Link
      to={`/${base}/${item.slug}`}
      className="group block border border-municipal/15 bg-white overflow-hidden rounded-xl hover:border-flagred transition-colors"
    >
      <div className="aspect-[4/3] overflow-hidden bg-limestone relative">
        <img
          src={item.photo}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wide font-mono bg-porcelain/90 text-ink px-2 py-1 rounded-xl">
          {item.side || item.region}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-2xl leading-tight text-ink group-hover:text-flagred transition-colors">
          {item.name}
        </h3>
        <p className="mt-2 text-sm text-slate leading-relaxed">{item.vibe}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span key={t} className="text-xs font-mono px-2 py-1 bg-limestone/60 text-ink rounded-xl">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
