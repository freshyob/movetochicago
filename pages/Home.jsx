import { Link } from 'react-router-dom'
import neighborhoods from '../data/neighborhoods.json'
import suburbs from '../data/suburbs.json'
import stories from '../data/stories.json'
import NeighborhoodCard from '../components/NeighborhoodCard.jsx'
import StoryCard from '../components/StoryCard.jsx'

const featured = neighborhoods.slice(0, 3)
const featuredSuburbs = suburbs.slice(0, 3)
const featuredStories = stories.slice(0, 3)

export default function Home() {
  return (
    <div>
      {/* Hero: full-bleed skyline photo, dark navy overlay, white text, integrated search bar */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://commons.wikimedia.org/wiki/Special:FilePath/Chicago%20Skyline%20Hi-Res.jpg?width=1800"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-municipal/80" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <h1 className="font-display font-black text-6xl md:text-8xl leading-[0.9] text-porcelain max-w-4xl">
            MOVING TO CHICAGO?
          </h1>
          <p className="mt-6 text-lg md:text-xl text-porcelain/85 max-w-xl leading-relaxed">
            Chicago is laid out on a grid radiating from State &amp; Madison — every
            address tells you exactly how far you are from downtown. This is your
            map through it: neighborhoods, suburbs, schools, and the homes
            available right now, from RE/MAX Metropolitan IL.
          </p>

          {/* Integrated home search bar */}
          <form
            className="mt-10 bg-white rounded-full p-2 flex flex-wrap gap-2 items-center max-w-3xl shadow-lg"
            onSubmit={(e) => e.preventDefault()}
          >
            <select className="flex-1 min-w-[110px] bg-transparent text-sm font-medium text-ink px-4 py-3 rounded-full focus:outline-none">
              <option>Buy/Rent</option>
              <option>Buy</option>
              <option>Rent</option>
            </select>
            <select className="flex-1 min-w-[100px] bg-transparent text-sm font-medium text-ink px-4 py-3 rounded-full focus:outline-none">
              <option>Price</option>
              <option>Under $500k</option>
              <option>$500k–$1M</option>
              <option>$1M+</option>
            </select>
            <select className="flex-1 min-w-[100px] bg-transparent text-sm font-medium text-ink px-4 py-3 rounded-full focus:outline-none">
              <option>Bed/Bath</option>
              <option>2+ bed</option>
              <option>3+ bed</option>
              <option>4+ bed</option>
            </select>
            <select className="flex-1 min-w-[110px] bg-transparent text-sm font-medium text-ink px-4 py-3 rounded-full focus:outline-none">
              <option>Home Type</option>
              <option>Single Family</option>
              <option>Condo</option>
              <option>Multi-Unit</option>
            </select>
            <Link
              to="/listings"
              className="bg-skyblue text-white text-sm font-semibold px-7 py-3 rounded-full hover:bg-municipal transition-colors whitespace-nowrap"
            >
              Search
            </Link>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/neighborhoods" className="bg-municipal text-porcelain px-6 py-3 rounded-full font-semibold hover:bg-skyblue transition-colors">
              Explore Neighborhoods
            </Link>
            <Link to="/stories" className="border border-porcelain/50 text-porcelain px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors">
              Read Chicago Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured neighborhoods */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-ink">Start in the City</h2>
          <Link to="/neighborhoods" className="text-sm font-semibold text-flagred hover:underline">View all neighborhoods →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {featured.map((n) => <NeighborhoodCard key={n.slug} item={n} base="neighborhoods" />)}
        </div>
      </section>

      {/* Chicago Stories editorial section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-municipal/10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono uppercase text-flagred mb-1">Chicago Stories</div>
            <h2 className="font-display font-bold text-3xl text-ink">Read Before You Tour</h2>
          </div>
          <Link to="/stories" className="text-sm font-semibold text-flagred hover:underline">All stories →</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featuredStories.map((s, i) => (
            <StoryCard key={s.slug} story={s} featured={i === 0} />
          ))}
        </div>
      </section>

      {/* Featured suburbs */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-municipal/10">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display font-bold text-3xl text-ink">Or Go Suburban</h2>
          <Link to="/suburbs" className="text-sm font-semibold text-flagred hover:underline">View all suburbs →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {featuredSuburbs.map((s) => <NeighborhoodCard key={s.slug} item={s} base="suburbs" />)}
        </div>
      </section>

      {/* Why this site */}
      <section className="bg-limestone/40 border-t border-municipal/10">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-mono text-flagred text-sm mb-2">01</div>
            <h3 className="font-display font-bold text-xl mb-2">Real MLS Listings</h3>
            <p className="text-sm text-slate leading-relaxed">Every home you see here is pulled from the same MLS feed RE/MAX Metropolitan IL agents use — no stale scraped data.</p>
          </div>
          <div>
            <div className="font-mono text-flagred text-sm mb-2">02</div>
            <h3 className="font-display font-bold text-xl mb-2">Neighborhood-Level Detail</h3>
            <p className="text-sm text-slate leading-relaxed">Transit lines, school districts, and the honest vibe of each area — written for people who have never set foot here.</p>
          </div>
          <div>
            <div className="font-mono text-flagred text-sm mb-2">03</div>
            <h3 className="font-display font-bold text-xl mb-2">A Local Agent, On Call</h3>
            <p className="text-sm text-slate leading-relaxed">Every page connects back to a real RE/MAX Metropolitan IL agent who can show you homes in person.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
