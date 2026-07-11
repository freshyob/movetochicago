import { Link, useParams } from 'react-router-dom'
import stories from '../data/stories.json'
import neighborhoods from '../data/neighborhoods.json'
import suburbs from '../data/suburbs.json'

export default function StoryDetail() {
  const { slug } = useParams()
  const story = stories.find((s) => s.slug === slug)

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-slate">We could not find that story.</p>
        <Link to="/stories" className="text-flagred font-semibold">← Back to Chicago Stories</Link>
      </div>
    )
  }

  const related =
    neighborhoods.find((n) => n.slug === story.relatedNeighborhood) ||
    suburbs.find((s) => s.slug === story.relatedNeighborhood)
  const relatedBase = neighborhoods.find((n) => n.slug === story.relatedNeighborhood) ? 'neighborhoods' : 'suburbs'

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/stories" className="text-sm text-flagred font-semibold">← Chicago Stories</Link>

      <div className="mt-6 mb-8">
        <span className="inline-block text-xs font-mono px-2 py-1 rounded-xl mb-4 bg-limestone text-ink">
          {story.type}
        </span>
        <h1 className="font-display font-black text-4xl md:text-5xl leading-tight text-ink mb-4">{story.title}</h1>
        <p className="text-lg text-slate leading-relaxed">{story.dek}</p>
        <div className="mt-4 text-xs font-mono text-slate">
          {story.author}{story.authorTitle ? `, ${story.authorTitle}` : ''} · {story.readTime}
        </div>
      </div>

      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-limestone mb-10 relative">
        <img src={story.photo} alt="" className="w-full h-full object-cover" />
        {story.photoCredit && (
          <div className="absolute bottom-2 right-3 text-[10px] font-mono text-white/80 bg-black/30 px-2 py-0.5 rounded-xl">
            {story.photoCredit}
          </div>
        )}
      </div>

      <div className="prose-none space-y-5">
        {story.body.map((p, i) => (
          <p key={i} className="text-base md:text-lg text-ink leading-relaxed">{p}</p>
        ))}
      </div>

      <div className="mt-10 border-l-2 border-flagred pl-5 py-1">
        <p className="text-sm text-slate leading-relaxed italic">
          A note from RE/MAX Metropolitan IL: whether you're moving across the
          street or across the world, buying a home isn't just about finding
          the right house — it's about finding the right neighborhood. It's
          not a transaction. It's a life event, and we take it seriously.
        </p>
      </div>

      {related && (
        <div className="mt-12 border border-municipal/15 rounded-xl p-6 flex items-center gap-5">
          <img src={related.photo} alt="" className="w-20 h-20 object-cover rounded-xl shrink-0" />
          <div>
            <div className="text-xs font-mono uppercase text-slate mb-1">Featured in this story</div>
            <div className="font-display font-bold text-xl mb-2">{related.name}</div>
            <Link to={`/${relatedBase}/${related.slug}`} className="text-sm font-semibold text-flagred hover:underline">
              See homes &amp; details →
            </Link>
          </div>
        </div>
      )}
    </article>
  )
}
