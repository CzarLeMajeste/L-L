import { useEffect, useState } from 'react'
import { ExploreView } from './views/ExploreView'
import { ListingDetailView } from './views/ListingDetailView'
import { BookingsView } from './views/BookingsView'
import { AdminView } from './views/AdminView'
import { HostView } from './views/HostView'
import { Navbar } from './components/Navbar'
import type { PropertyType } from './lib/types'

export type Route =
  | { name: 'explore' }
  | { name: 'listing'; id: string }
  | { name: 'bookings' }
  | { name: 'host' }
  | { name: 'admin' }

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'explore' })
  const [filter, setFilter] = useState<PropertyType | undefined>(undefined)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [route])

  return (
    <div className="min-h-full">
      <Navbar route={route} onNavigate={setRoute} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {route.name === 'explore' && (
          <ExploreView filter={filter} onFilter={setFilter} onOpenListing={(id) => setRoute({ name: 'listing', id })} />
        )}
        {route.name === 'listing' && (
          <ListingDetailView id={route.id} onBack={() => setRoute({ name: 'explore' })} onBooked={() => setRoute({ name: 'bookings' })} />
        )}
        {route.name === 'bookings' && <BookingsView onExplore={() => setRoute({ name: 'explore' })} />}
        {route.name === 'host' && <HostView onDone={() => setRoute({ name: 'explore' })} />}
        {route.name === 'admin' && <AdminView />}
      </main>
      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-ink-400 sm:px-6 lg:px-8">
          LodgeLink — Love at the Lodge · Lodging houses & private condos across the Philippines
        </div>
      </footer>
    </div>
  )
}
