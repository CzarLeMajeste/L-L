import { useEffect, useState } from 'react'
import { RoleSelect } from './components/RoleSelect'
import type { Role } from './components/RoleSelect'
import { Navbar } from './components/Navbar'
import { ExploreView } from './views/ExploreView'
import { ListingDetailView } from './views/ListingDetailView'
import { BookingsView } from './views/BookingsView'
import { HostView } from './views/HostView'
import { HostListingsView } from './views/HostListingsView'
import { HostBookingsView } from './views/HostBookingsView'
import { AdminVerifyView } from './views/AdminVerifyView'
import { AdminAuditView } from './views/AdminAuditView'
import type { PropertyType } from './lib/types'

export type Route =
  | { name: 'explore' }
  | { name: 'listing'; id: string }
  | { name: 'bookings' }
  | { name: 'hostListings' }
  | { name: 'hostNew' }
  | { name: 'hostBookings' }
  | { name: 'adminVerify' }
  | { name: 'adminAudit' }

export default function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [route, setRoute] = useState<Route>({ name: 'explore' })
  const [filter, setFilter] = useState<PropertyType | undefined>(undefined)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [route])

  const selectRole = (r: Role) => {
    setRole(r)
    if (r === 'client') setRoute({ name: 'explore' })
    else if (r === 'host') setRoute({ name: 'hostListings' })
    else setRoute({ name: 'adminVerify' })
  }

  const exit = () => {
    setRole(null)
    setRoute({ name: 'explore' })
  }

  if (!role) {
    return <RoleSelect onSelect={selectRole} />
  }

  return (
    <div className="min-h-full">
      <Navbar route={route} role={role} onNavigate={setRoute} onExit={exit} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {role === 'client' && (
          <>
            {route.name === 'explore' && (
              <ExploreView filter={filter} onFilter={setFilter} onOpenListing={(id) => setRoute({ name: 'listing', id })} />
            )}
            {route.name === 'listing' && (
              <ListingDetailView id={route.id} onBack={() => setRoute({ name: 'explore' })} onBooked={() => setRoute({ name: 'bookings' })} />
            )}
            {route.name === 'bookings' && <BookingsView onExplore={() => setRoute({ name: 'explore' })} />}
          </>
        )}

        {role === 'host' && (
          <>
            {route.name === 'hostListings' && <HostListingsView />}
            {route.name === 'hostNew' && <HostView onDone={() => setRoute({ name: 'hostListings' })} />}
            {route.name === 'hostBookings' && <HostBookingsView />}
          </>
        )}

        {role === 'admin' && (
          <>
            {route.name === 'adminVerify' && <AdminVerifyView />}
            {route.name === 'adminAudit' && <AdminAuditView />}
          </>
        )}
      </main>
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-ink-400 sm:px-6 lg:px-8">
          LodgeLink — Love at the Lodge · Lodging houses & private condos across the Philippines
        </div>
      </footer>
    </div>
  )
}
