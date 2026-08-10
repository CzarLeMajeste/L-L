import { Home, Compass, CalendarCheck, Shield, KeyRound, LogOut, Plus, Building2 } from 'lucide-react'
import type { Route } from '../App'
import type { Role } from './RoleSelect'

interface Props {
  route: Route
  role: Role
  onNavigate: (r: Route) => void
  onExit: () => void
  onOpenPortal: (role: Extract<Role, 'host' | 'admin'>) => void
}

export function Navbar({ route, role, onNavigate, onExit, onOpenPortal }: Props) {
  const items: { key: string; label: string; icon: typeof Home; route: Route }[] = []

  if (role === 'client') {
    items.push({ key: 'explore', label: 'Explore', icon: Compass, route: { name: 'explore' } })
    items.push({ key: 'bookings', label: 'My Bookings', icon: CalendarCheck, route: { name: 'bookings' } })
  } else if (role === 'host') {
    items.push({ key: 'hostListings', label: 'My Listings', icon: Building2, route: { name: 'hostListings' } })
    items.push({ key: 'hostNew', label: 'Add Listing', icon: Plus, route: { name: 'hostNew' } })
    items.push({ key: 'hostBookings', label: 'Reservations', icon: CalendarCheck, route: { name: 'hostBookings' } })
  } else if (role === 'admin') {
    items.push({ key: 'adminVerify', label: 'Verification', icon: Shield, route: { name: 'adminVerify' } })
    items.push({ key: 'adminAudit', label: 'Audit Logs', icon: KeyRound, route: { name: 'adminAudit' } })
  }

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)
  const roleColor = role === 'client' ? 'bg-brand-600' : role === 'host' ? 'bg-accent-500' : 'bg-ink-900'

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate(items[0].route)} className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <Home className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
              Lodge<span className="text-brand-600">Link</span>
            </span>
          </button>
          <span className={`hidden rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white sm:inline ${roleColor}`}>
            {roleLabel}
          </span>
        </div>

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
          {role === 'client' ? (
            <>
              <button onClick={() => onOpenPortal('host')} className="ml-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-500 transition-all hover:bg-ink-100 hover:text-ink-800">
                Host sign in
              </button>
              <button onClick={() => onOpenPortal('admin')} className="rounded-xl bg-ink-900 px-3.5 py-2 text-sm font-semibold text-white transition-all hover:bg-ink-800">
                Admin sign in
              </button>
            </>
          ) : (
            <button onClick={onExit} className="ml-2 flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-400 transition-all hover:bg-red-50 hover:text-red-600">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
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
          {role === 'client' ? (
            <button onClick={() => onOpenPortal('host')} className="flex h-9 items-center justify-center rounded-xl px-2 text-xs font-semibold text-ink-600 hover:bg-ink-100" aria-label="Host sign in">
              Host
            </button>
          ) : (
            <button onClick={onExit} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label="Sign out">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
