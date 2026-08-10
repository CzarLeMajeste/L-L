import { Home, Compass, CalendarCheck, Shield, KeyRound } from 'lucide-react'
import type { Route } from '../App'

interface Props {
  route: Route
  onNavigate: (r: Route) => void
}

export function Navbar({ route, onNavigate }: Props) {
  const items = [
    { key: 'explore', label: 'Explore', icon: Compass, route: { name: 'explore' } as Route },
    { key: 'bookings', label: 'Bookings', icon: CalendarCheck, route: { name: 'bookings' } as Route },
    { key: 'host', label: 'Host', icon: KeyRound, route: { name: 'host' } as Route },
    { key: 'admin', label: 'Admin', icon: Shield, route: { name: 'admin' } as Route },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate({ name: 'explore' })} className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Home className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Lodge<span className="text-brand-600">Link</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 sm:flex">
          {items.map(({ key, label, icon: Icon, route: r }) => {
            const active = route.name === key
            return (
              <button
                key={key}
                onClick={() => onNavigate(r)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </nav>

        <nav className="flex items-center gap-1 sm:hidden">
          {items.map(({ key, icon: Icon, route: r }) => {
            const active = route.name === key
            return (
              <button
                key={key}
                onClick={() => onNavigate(r)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-400'
                }`}
                aria-label={key}
              >
                <Icon className="h-4.5 w-4.5" />
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
