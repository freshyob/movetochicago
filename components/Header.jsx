import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import ChiStar from './ChiStar.jsx'

const links = [
  { to: '/neighborhoods', label: 'Neighborhoods' },
  { to: '/suburbs', label: 'Suburbs' },
  { to: '/stories', label: 'Stories' },
  { to: '/listings', label: 'Listings' },
  { to: '/chicago-daily', label: 'Chicago Daily' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-porcelain/95 backdrop-blur border-b border-municipal/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">
        <NavLink to="/" className="flex items-center gap-2 font-display font-black text-2xl tracking-tight text-municipal">
          <ChiStar className="w-5 h-5 text-skyblue" />
          MOVE TO CHICAGO
        </NavLink>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm font-medium">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `transition-colors hover:text-skyblue ${isActive ? 'text-skyblue' : 'text-ink'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://www.remaxmetropolitanil.com"
            target="_blank"
            rel="noreferrer"
            className="bg-municipal text-porcelain px-4 py-2 rounded-full hover:bg-skyblue transition-colors"
          >
            Talk to an Agent
          </a>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-municipal/10 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-ink font-medium">
              {l.label}
            </NavLink>
          ))}
          <a href="https://www.remaxmetropolitanil.com" className="text-skyblue font-semibold">
            Talk to an Agent →
          </a>
        </div>
      )}
    </header>
  )
}
