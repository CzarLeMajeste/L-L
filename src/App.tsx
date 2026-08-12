import { useEffect, useState } from 'react'
import type { Role } from './components/RoleSelect'
import { Navbar } from './components/Navbar'
import { BoarderAccess } from './components/BoarderAccess'
import type { BoarderProfile } from './components/BoarderAccess'
import { PortalSignIn } from './components/PortalSignIn'
import { ExploreView } from './views/ExploreView'
import { ListingDetailView } from './views/ListingDetailView'
import { CommunityView } from './views/CommunityView'
import { HostView } from './views/HostView'
import { HostListingsView } from './views/HostListingsView'
import { HostBookingsView } from './views/HostBookingsView'
import { HostAdminView } from './views/HostAdminView'
import { AdminVerifyView } from './views/AdminVerifyView'
import { AdminAuditView } from './views/AdminAuditView'
import { supabase } from './lib/supabase'
import type { PropertyType } from './lib/types'

export type Route =
  | { name: 'explore' }
  | { name: 'listing'; id: string }
  | { name: 'community'; id: string }
  | { name: 'hostListings' }
  | { name: 'hostNew' }
  | { name: 'hostBookings' }
  | { name: 'hostAdmin' }
  | { name: 'adminVerify' }
  | { name: 'adminAudit' }

type Portal = Extract<Role, 'host' | 'admin'>

export default function App() {
  const [role, setRole] = useState<Role>('client')
  const [portal, setPortal] = useState<Portal | null>(() => (window.location.pathname === '/admin' ? 'host' : null))
  const [boarderAccess, setBoarderAccess] = useState(false)
  const [boarderProfile, setBoarderProfile] = useState<BoarderProfile | null>(() => JSON.parse(localStorage.getItem('boarder-profile') ?? 'null'))
  const [route, setRoute] = useState<Route>({ name: 'explore' })
  const [filter, setFilter] = useState<PropertyType | undefined>(undefined)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [route, portal, boarderAccess])

  const openPortal = (nextPortal: Portal) => {
    setPortal(nextPortal)
  }

  const enterPortal = () => {
    if (!portal) return
    setRole(portal)
    setRoute(portal === 'host' ? (window.location.pathname === '/admin' ? { name: 'hostAdmin' } : { name: 'hostListings' }) : { name: 'adminVerify' })
    setPortal(null)
  }

  const exitPortal = async () => {
    await supabase.auth.signOut()
    setRole('client')
    setRoute({ name: 'explore' })
  }

  if (portal) {
    return <PortalSignIn role={portal} onSignedIn={enterPortal} onBack={() => setPortal(null)} />
  }

  if (boarderAccess) {
    return <BoarderAccess onDone={(profile) => { setBoarderProfile(profile); setBoarderAccess(false) }} onBack={() => setBoarderAccess(false)} />
  }

  return (
    <div className="min-h-full">
      <Navbar route={route} role={role} onNavigate={setRoute} onExit={exitPortal} onOpenPortal={openPortal} onBoarderAccess={() => setBoarderAccess(true)} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {role === 'client' && (
          <>
            {route.name === 'explore' && <ExploreView filter={filter} onFilter={setFilter} onOpenListing={(id) => setRoute({ name: 'listing', id })} />}
            {route.name === 'listing' && <ListingDetailView id={route.id} onBack={() => setRoute({ name: 'explore' })} onCommunity={() => setRoute({ name: 'community', id: route.id })} />}
            {route.name === 'community' && <CommunityView key={route.id} listing={{ id: route.id, title: 'Boarding house community', property_type: 'LODGING_HOUSE', location: 'University of Antique area', nightly_rate: 0, max_guests: 1, available: true, image_url: null, description: null, created_at: new Date().toISOString() }} profile={boarderProfile} onBack={() => setRoute({ name: 'explore' })} onSignIn={() => setBoarderAccess(true)} onOpenCommunity={(id) => setRoute({ name: 'community', id })} />}
          </>
        )}
        {role === 'host' && (
          <>
            {route.name === 'hostListings' && <HostListingsView />}
            {route.name === 'hostNew' && <HostView onDone={() => setRoute({ name: 'hostListings' })} />}
            {route.name === 'hostBookings' && <HostBookingsView />}
            {route.name === 'hostAdmin' && <HostAdminView />}
          </>
        )}
        {role === 'admin' && (
          <>
            {route.name === 'adminVerify' && <AdminVerifyView />}
            {route.name === 'adminAudit' && <AdminAuditView />}
          </>
        )}
      </main>
    </div>
  )
}
