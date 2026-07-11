import { Link } from 'react-router-dom'

const typeColor = {
  'Neighborhood Story': 'bg-municipal text-porcelain',
  'Restaurant Review': 'bg-flagred text-porcelain',
  'Festival Preview': 'bg-limestone text-ink',
}

export default function StoryCard({ story, featured = false }) {
  return (
    <Link
      to={`/stories/${story.slug}`}
      className={`group block overflow-hidden rounded-xl border border-municipal/15 bg-white hover:border-flagred transition-colors ${
        featured ? 'md:col-span-2 md:grid md:grid-cols-2' : ''
      }`}
    >
      <div className={`overflow-hidden bg-limestone ${featured ? 'aspect-[4/3] md:aspect-auto md:h-full' : 'aspect-[16/10]'}`}>
        <img
          src={story.photo}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col justify-center">
        <span className={`inline-block w-fit text-xs font-mono px-2 py-1 rounded-xl mb-3 ${typeColor[story.type] || 'bg-limestone text-ink'}`}>
          {story.type}
        </span>
        <h3 className={`font-display font-bold leading-tight text-ink group-hover:text-flagred transition-colors ${featured ? 'text-3xl' : 'text-xl'}`}>
          {story.title}
        </h3>
        <p className="mt-2 text-sm text-slate leading-relaxed">{story.dek}</p>
        <div className="mt-3 text-xs font-mono text-slate">{story.author} · {story.readTime}</div>
      </div>
    </Link>
  )
}
