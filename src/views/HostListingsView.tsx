import { useEffect, useState } from 'react'
import { Building2, MapPin, Users, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { hasRentalSpace } from '../lib/types'
import type { Listing } from '../lib/types'

export function HostListingsView() {
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    setListings(null)
    setError(null)
    api.getListings().then(
      (d) => setListings(d),
      (e) => setError(e.message),
    )
  }

  useEffect(() => {
    refresh()
  }, [])

  const remove = async (l: Listing) => {
    await api.deleteListing(l.id)
    refresh()
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">My listings</h1>
        <p className="text-sm text-ink-500">Manage your lodging houses and private condos.</p>
      </div>

      {error && <div className="card p-6 text-center text-sm text-red-600">{error}</div>}

      {!listings && !error && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {listings && listings.length === 0 && !error && (
        <div className="card p-10 text-center">
          <Building2 className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-3 text-sm font-semibold text-ink-600">No listings yet.</p>
          <p className="mt-1 text-xs text-ink-400">Create your first listing to start hosting.</p>
        </div>
      )}

      {listings && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((l, i) => (
            <div key={l.id} style={{ animationDelay: `${i * 50}ms` }} className="card animate-fade-up overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                  {l.image_url ? (
                    <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-400 text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-900">{l.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {l.location}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {l.max_guests} guests</span>
                        <span className={`chip ${l.property_type === 'LODGING_HOUSE' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>
                          {l.property_type === 'LODGING_HOUSE' ? 'Lodging House' : 'Private Condo'}
                        </span>
                      </div>
                    </div>
                    <span className="font-display text-base font-extrabold text-ink-900">
                      ₱{Number(l.nightly_rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-ink-400"> /night</span>
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`chip ${hasRentalSpace(l) ? 'bg-brand-50 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>
                    {hasRentalSpace(l) ? 'Space available' : 'Unavailable'}
                  </span>
                  <button onClick={() => remove(l)} className="btn-secondary px-3 py-2 text-xs text-red-600 hover:bg-red-50" title="Delete listing">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
