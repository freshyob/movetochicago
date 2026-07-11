export default function Footer() {
  return (
    <footer className="bg-municipal text-porcelain mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="font-display font-black text-xl mb-3">MOVE TO CHICAGO</div>
          <p className="text-porcelain/70 text-sm leading-relaxed">
            A relocation guide to Chicago's neighborhoods and suburbs, brought to
            you by RE/MAX Metropolitan IL.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-porcelain/60">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><a href="/neighborhoods" className="hover:text-flagred">Chicago Neighborhoods</a></li>
            <li><a href="/suburbs" className="hover:text-flagred">Suburbs</a></li>
            <li><a href="/listings" className="hover:text-flagred">Current Listings</a></li>
            <li><a href="/chicago-daily" className="hover:text-flagred">Chicago Daily</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm uppercase tracking-wide text-porcelain/60">RE/MAX Metropolitan IL</div>
          <p className="text-sm text-porcelain/70 mb-2">
            Every listing on this site is powered by our MLS feed.
          </p>
          <a
            href="https://www.remaxmetropolitanil.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm font-semibold text-porcelain border border-porcelain/30 px-4 py-2 rounded-xl hover:bg-flagred hover:border-flagred transition-colors"
          >
            Visit remaxmetropolitanil.com →
          </a>
        </div>
      </div>
      <div className="border-t border-porcelain/10 py-6 text-center text-xs text-porcelain/50">
        © {new Date().getFullYear()} RE/MAX Metropolitan IL. Equal Housing Opportunity.
        Each RE/MAX office is independently owned and operated.
      </div>
    </footer>
  )
}
