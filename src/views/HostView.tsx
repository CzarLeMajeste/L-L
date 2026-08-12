import { useState } from 'react'
import { Home, Building2, Check } from 'lucide-react'
import { api } from '../lib/api'
import type { Listing, PropertyType } from '../lib/types'

interface Props {
  onDone: () => void
}

export function HostView({ onDone }: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<PropertyType>('LODGING_HOUSE')
  const [location, setLocation] = useState('')
  const [rate, setRate] = useState('')
  const [maxGuests, setMaxGuests] = useState(2)
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<Listing | null>(null)

  const submit = async () => {
    setError(null)
    if (!title.trim() || !location.trim() || !rate.trim()) {
      return setError('Please fill in title, location, and nightly rate.')
    }
    const r = Number(rate)
    if (!Number.isFinite(r) || r <= 0) return setError('Nightly rate must be a positive number.')
    setSubmitting(true)
    try {
      const l = await api.createListing({
        title,
        property_type: type,
        location,
        nightly_rate: r,
        max_guests: maxGuests,
        available: true,
        image_url: imageUrl.trim() || undefined,
        description: description.trim() || undefined,
      })
      setCreated(l)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="card animate-scale-in mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Check className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold text-ink-900">Listing published!</h2>
        <p className="mt-1 text-sm text-ink-500">“{created.title}” in {created.location} is now live.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { setCreated(null); setTitle(''); setLocation(''); setRate(''); setImageUrl(''); setDescription('') }} className="btn-secondary">Add another</button>
          <button onClick={onDone} className="btn-primary">View in explore</button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">List your property</h1>
        <p className="text-sm text-ink-500">Publish a lodging house or private condo for guests to book.</p>
      </div>

      <div className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cozy Baguio Lodge" />
          </div>
          <div>
            <label className="label">Property type</label>
            <div className="grid grid-cols-2 gap-2">
              <TypePill active={type === 'LODGING_HOUSE'} onClick={() => setType('LODGING_HOUSE')} label="Lodging House" icon={<Home className="h-4 w-4" />} />
              <TypePill active={type === 'PRIVATE_CONDO'} onClick={() => setType('PRIVATE_CONDO')} label="Private Condo" icon={<Building2 className="h-4 w-4" />} />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Baguio City" />
          </div>
          <div>
            <label className="label">Nightly rate (₱)</label>
            <input className="input" type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="140.00" />
          </div>
          <div>
            <label className="label">Max guests</label>
            <input className="input" type="number" min="1" value={maxGuests} onChange={(e) => setMaxGuests(Number(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image URL (optional)</label>
            <input className="input" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description (optional)</label>
            <textarea className="input min-h-[88px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell guests what makes this place special…" />
          </div>
        </div>

        {error && <p className="mt-4 text-xs font-medium text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button onClick={submit} disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Publishing…' : 'Publish listing'}
          </button>
          <button onClick={onDone} className="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function TypePill({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
        active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
