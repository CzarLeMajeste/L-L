import { MapPin, Users, Star } from 'lucide-react'
import { hasRentalSpace, type Listing } from '../lib/types'
import { BadgeCheck, ShieldAlert } from 'lucide-react'

interface Props {
  listing: Listing
  onOpen: (id: string) => void
  index?: number
}

export function ListingCard({ listing, onOpen, index = 0 }: Props) {
  const typeLabel = listing.property_type === 'LODGING_HOUSE' ? 'Boarding House' : 'Private Room'
  const unavailable = !hasRentalSpace(listing)
  return (
    <button
      onClick={() => onOpen(listing.id)}
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      className="group card animate-fade-up overflow-hidden text-left transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-lift active:scale-[.98]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-400">No image</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          <span
            className={`chip backdrop-blur-md ${
              listing.property_type === 'LODGING_HOUSE'
                ? 'bg-brand-600/90 text-white'
                : 'bg-accent-500/90 text-white'
            }`}
          >
            {typeLabel}
          </span>
          <span className={`chip px-2 py-0.5 text-[10px] ${listing.partner_status === 'VERIFIED_PARTNER' ? 'bg-white text-brand-700' : 'bg-ink-900/75 text-white'}`}>
            {listing.partner_status === 'VERIFIED_PARTNER' ? <><BadgeCheck className="h-3 w-3" /> Verified partner</> : <><ShieldAlert className="h-3 w-3" /> Student community</>}
          </span>
          {listing.moderator_enabled && <span className="chip bg-accent-500 text-white px-2 py-0.5 text-[10px]">Events enabled</span>}
        </div>
        {unavailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-900/40">
            <span className="chip bg-white text-ink-800">Unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight text-ink-900">{listing.title}</h3>
          <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-600">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            4.9
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-500">
          <MapPin className="h-3.5 w-3.5" />
          {listing.location}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {listing.rooms_available ?? 1} rooms available</span>
          <span>{listing.room_capacity ?? listing.max_guests} boarders / room</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="chip bg-accent-50 px-2 py-0.5 text-[10px] text-accent-700">{listing.rental_mode === 'TRANSIENT' ? 'Transient' : listing.rental_mode === 'BOTH' ? 'Monthly + transient' : 'Monthly'}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(listing.included_amenities ?? ['Wi-Fi', 'Water'])?.slice(0, 2).map((amenity) => <span key={amenity} className="chip bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">{amenity}</span>)}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-display text-lg font-extrabold text-ink-900">
              ₱{Number(listing.monthly_rate ?? listing.nightly_rate).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-ink-400"> / month</span>
          </div>
          <span className="text-xs font-semibold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
            View house →
          </span>
        </div>
      </div>
    </button>
  )
}
