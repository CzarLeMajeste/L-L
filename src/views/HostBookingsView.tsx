import { useEffect, useState } from 'react'
import { CalendarCheck, MapPin, Users } from 'lucide-react'
import { api } from '../lib/api'
import type { Booking, Listing } from '../lib/types'

interface BookingRow extends Booking {
  listing?: Listing
}

export function HostBookingsView() {
  const [rows, setRows] = useState<BookingRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setRows(null)
    api.getBookings().then(
      (d) => active && setRows(d as BookingRow[]),
      (e) => active && setError(e.message),
    )
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Reservations</h1>
        <p className="text-sm text-ink-500">All guest bookings across your listings.</p>
      </div>

      {error && <div className="card p-6 text-center text-sm text-red-600">{error}</div>}

      {!rows && !error && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {rows && rows.length === 0 && !error && (
        <div className="card p-10 text-center">
          <CalendarCheck className="mx-auto h-8 w-8 text-ink-300" />
          <p className="mt-3 text-sm font-semibold text-ink-600">No reservations yet.</p>
          <p className="mt-1 text-xs text-ink-400">When guests book your listings, they'll appear here.</p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((b, i) => (
            <div key={b.id} style={{ animationDelay: `${i * 50}ms` }} className="card animate-fade-up overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-20 w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                  {b.listing?.image_url ? (
                    <img src={b.listing.image_url} alt={b.listing.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-400 text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold text-ink-900">{b.listing?.title ?? 'Listing'}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        {b.listing && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.listing.location}</span>}
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.guests} {b.guests === 1 ? 'guest' : 'guests'}</span>
                        <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {b.check_in} → {b.check_out}</span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-ink-600">Guest: {b.guest_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-base font-extrabold text-ink-900">
                        ₱{Number(b.total_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                      <p className="mt-0.5">
                        <span className="chip bg-brand-50 text-brand-700">{b.status}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
