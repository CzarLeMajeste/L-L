import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, MapPin, Users, Calendar, Check, ShieldCheck, QrCode, Wallet } from 'lucide-react'
import { api, FILIPINO_ALTERNATIVES } from '../lib/api'
import type { Booking, InstapayPayment, Listing } from '../lib/types'
import { QRCode } from '../components/QRCode'

interface Props {
  id: string
  onBack: () => void
  onBooked: () => void
}

export function ListingDetailView({ id, onBack, onBooked }: Props) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState('guest-001')
  const [guestName, setGuestName] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [payment, setPayment] = useState<InstapayPayment | null>(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setListing(null)
    setError(null)
    api.getListing(id).then(
      (l) => active && setListing(l),
      (e) => active && setError(e.message),
    )
    return () => {
      active = false
    }
  }, [id])

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000)
  }, [checkIn, checkOut])

  const totalPrice = listing && nights > 0 ? Number(listing.nightly_rate) * nights : 0

  const submit = async () => {
    setFormError(null)
    if (!guestName.trim()) return setFormError('Please enter the guest name.')
    if (!checkIn || !checkOut) return setFormError('Please choose check-in and check-out dates.')
    if (nights < 1) return setFormError('Check-out must be after check-in.')
    if (listing && guests > listing.max_guests) return setFormError(`This stay allows up to ${listing.max_guests} guests.`)
    setSubmitting(true)
    try {
      const b = await api.createBooking({ listing_id: id, guest_name: guestName, check_in: checkIn, check_out: checkOut, guests })
      setBooking(b)
    } catch (e: any) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pay = async () => {
    if (!booking) return
    setPayError(null)
    setPaying(true)
    try {
      const { payment } = await api.generateInstapayQr(clientId, booking.id, '0011223344', 'LodgeLink PH')
      setPayment(payment)
    } catch (e: any) {
      setPayError(e.message)
    } finally {
      setPaying(false)
    }
  }

  if (error) {
    return (
      <div className="card animate-fade-up p-8 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button onClick={onBack} className="btn-secondary mt-4">Back to stays</button>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="animate-fade-up">
        <button onClick={onBack} className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back</button>
        <div className="card overflow-hidden">
          <div className="skeleton aspect-[16/9] w-full" />
          <div className="space-y-3 p-6">
            <div className="skeleton h-6 w-1/2 rounded" />
            <div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <button onClick={onBack} className="btn-ghost mb-4"><ArrowLeft className="h-4 w-4" /> Back to stays</button>

      <div className="card overflow-hidden">
        <div className="relative aspect-[16/9]">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-400">No image</div>
          )}
          <span className={`chip absolute left-4 top-4 backdrop-blur-md ${listing.property_type === 'LODGING_HOUSE' ? 'bg-brand-600/90 text-white' : 'bg-accent-500/90 text-white'}`}>
            {listing.property_type === 'LODGING_HOUSE' ? 'Lodging House' : 'Private Condo'}
          </span>
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-5 lg:p-8">
          <div className="lg:col-span-3">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">{listing.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {listing.location}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Up to {listing.max_guests} guests</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${listing.available ? 'bg-brand-500' : 'bg-ink-300'}`} />
                {listing.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            {listing.description && <p className="mt-4 text-sm leading-relaxed text-ink-600">{listing.description}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {['Free Wi-Fi', 'Self check-in', 'Kitchen', 'Hot shower', 'Parking', 'Pet-friendly'].map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-xs font-medium text-ink-600">
                  <Check className="h-3.5 w-3.5 text-brand-600" /> {a}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-5 ring-1 ring-ink-200">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-extrabold text-ink-900">
                  ₱{Number(listing.nightly_rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-ink-400">per night</span>
              </div>

              {!booking ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="label">Guest name</label>
                    <input className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Juan Dela Cruz" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Check-in</label>
                      <input type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                    </div>
                    <div>
                      <label className="label">Check-out</label>
                      <input type="date" className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().slice(0, 10)} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Guests</label>
                    <select className="input" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                      {Array.from({ length: listing.max_guests }).map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>

                  {nights > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3.5 py-2.5 text-sm">
                      <span className="text-ink-500">₱{Number(listing.nightly_rate).toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                      <span className="font-display font-bold text-ink-900">₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}

                  <button onClick={submit} disabled={submitting || !listing.available} className="btn-primary w-full">
                    <Calendar className="h-4 w-4" />
                    {listing.available ? (submitting ? 'Reserving…' : 'Reserve now') : 'Unavailable'}
                  </button>
                  <p className="flex items-center justify-center gap-1 text-[11px] text-ink-400">
                    <ShieldCheck className="h-3 w-3" /> You won’t be charged yet
                  </p>
                </div>
              ) : (
                <BookingConfirmation
                  booking={booking}
                  clientId={clientId}
                  setClientId={setClientId}
                  payment={payment}
                  paying={paying}
                  payError={payError}
                  onPay={pay}
                  onBooked={onBooked}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookingConfirmation({
  booking,
  clientId,
  setClientId,
  payment,
  paying,
  payError,
  onPay,
  onBooked,
}: {
  booking: Booking
  clientId: string
  setClientId: (s: string) => void
  payment: InstapayPayment | null
  paying: boolean
  payError: string | null
  onPay: () => void
  onBooked: () => void
}) {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm font-semibold text-brand-700">
        <Check className="h-4 w-4" /> Booking confirmed · ₱{Number(booking.total_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </div>

      {!payment ? (
        <>
          <div>
            <label className="label">Client ID (for verification)</label>
            <input className="input" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="guest-001" />
          </div>
          <p className="text-xs text-ink-500">
            To generate an InstaPay QR, your client ID must be verified by an admin first. Visit the Admin tab to verify a client.
          </p>
          {payError && <p className="text-xs font-medium text-red-600">{payError}</p>}
          <button onClick={onPay} disabled={paying} className="btn-primary w-full">
            <QrCode className="h-4 w-4" /> {paying ? 'Generating…' : 'Generate InstaPay QR'}
          </button>
          <button onClick={onBooked} className="btn-secondary w-full">View my bookings</button>
        </>
      ) : (
        <div className="animate-scale-in space-y-4">
          <div className="flex flex-col items-center rounded-2xl bg-ink-50 p-5 text-center">
            <QRCode value={payment.qr_payload} size={200} />
            <p className="mt-3 font-display text-sm font-bold text-ink-900">{payment.payment_reference}</p>
            <p className="text-xs text-ink-500">Scan to pay with InstaPay</p>
            <p className="mt-1 font-display text-lg font-extrabold text-ink-900">
              {payment.currency} {Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <Wallet className="h-3.5 w-3.5" /> Filipino payment alternatives
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FILIPINO_ALTERNATIVES.map((a) => (
                <div key={a.code} className="rounded-xl bg-white p-2.5 ring-1 ring-ink-100">
                  <p className="text-xs font-bold text-ink-900">{a.displayName}</p>
                  <p className="text-[11px] leading-tight text-ink-400">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onBooked} className="btn-primary w-full">Done — view bookings</button>
        </div>
      )}
    </div>
  )
}
