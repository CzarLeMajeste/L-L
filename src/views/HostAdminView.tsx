import { useEffect, useMemo, useState } from 'react'
import { ClipboardCheck, UserPlus, Users, MapPin } from 'lucide-react'
import { api } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Booking, Listing } from '../lib/types'

interface BookingRow extends Booking {
  listing?: Listing
}

export function HostAdminView() {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [accountMessage, setAccountMessage] = useState<string | null>(null)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.getBookings().then((rows) => setBookings(rows as BookingRow[])).finally(() => setLoading(false))
  }, [])

  const clients = useMemo(() => {
    const unique = new Map<string, BookingRow[]>()
    bookings.forEach((booking) => unique.set(booking.guest_name, [...(unique.get(booking.guest_name) ?? []), booking]))
    return Array.from(unique.entries())
  }, [bookings])

  const createTestHost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)
    setAccountMessage(null)
    setAccountError(null)

    if (!isSupabaseConfigured) {
      setAccountError('Configure Supabase before creating test accounts.')
      setCreating(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: accountEmail,
      password: accountPassword,
      options: { data: { account_type: 'test_host' } },
    })
    setCreating(false)
    if (error) {
      setAccountError(error.message)
      return
    }

    setAccountEmail('')
    setAccountPassword('')
    setAccountMessage('Test host account created. Assign the host role in Supabase app metadata before signing in.')
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
          <ClipboardCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Admin panel</h1>
          <p className="text-sm text-ink-500">Review clients who booked one of your posted locations and manage test access.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <h2 className="font-display text-sm font-bold text-ink-900">Clients by reservation</h2>
              <p className="mt-0.5 text-xs text-ink-400">Only clients connected to your bookings are shown.</p>
            </div>
            <span className="chip bg-brand-50 text-brand-700"><Users className="h-3.5 w-3.5" /> {clients.length}</span>
          </div>
          {loading && <div className="space-y-2 p-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>}
          {!loading && clients.length === 0 && <div className="p-8 text-center text-sm text-ink-400">No clients have booked your locations yet.</div>}
          {!loading && clients.length > 0 && (
            <div className="divide-y divide-ink-50">
              {clients.map(([name, clientBookings]) => (
                <div key={name} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{name}</p>
                    <span className="text-xs text-ink-400">{clientBookings.length} {clientBookings.length === 1 ? 'booking' : 'bookings'}</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-ink-500">
                    {clientBookings.map((booking) => (
                      <p key={booking.id} className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-600" />{booking.listing?.title ?? 'Listing'} · {booking.check_in} → {booking.check_out}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent-600" />
            <h2 className="font-display text-sm font-bold text-ink-900">Create test host account</h2>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">Create a separate account for testing the host workflow. It will not replace your current session.</p>
          <form onSubmit={createTestHost} className="mt-5 space-y-3">
            <input className="input" type="email" placeholder="test-host@example.com" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} required />
            <input className="input" type="password" placeholder="Temporary password" minLength={6} value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} required />
            {accountError && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{accountError}</p>}
            {accountMessage && <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs text-brand-700">{accountMessage}</p>}
            <button className="btn-primary w-full" type="submit" disabled={creating}>{creating ? 'Creating account…' : 'Create test host'}</button>
          </form>
        </section>
      </div>
    </div>
  )
}
