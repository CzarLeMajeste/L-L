import { useEffect, useState } from 'react'
import { Home, Search, SlidersHorizontal, Plus, ShieldAlert } from 'lucide-react'
import { api } from '../lib/api'
import type { Listing, PropertyType } from '../lib/types'
import { ListingCard } from '../components/ListingCard'

interface Props {
  filter: PropertyType | undefined
  onFilter: (f: PropertyType | undefined) => void
  onOpenListing: (id: string) => void
}

export function ExploreView({ filter, onFilter, onOpenListing }: Props) {
  const [listings, setListings] = useState<Listing[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true
    setListings(null)
    setError(null)
    api.getListings(filter).then(
      (d) => active && setListings(d),
      (e) => active && setError(e.message),
    )
    return () => {
      active = false
    }
  }, [filter, refreshToken])

  const filtered = (listings ?? []).filter((l) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
  })

  return (
    <div>
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 px-6 py-12 text-white shadow-lift sm:px-10 sm:py-16">
        <img src="https://images.pexels.com/photos/17546969/pexels-photo-17546969.jpeg" alt="Cozy Philippine mountain lodge surrounded by greenery" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-800/90 via-brand-700/70 to-brand-700/20" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent-400/20 blur-2xl" />
        <div className="relative">
          <span className="chip bg-white/15 text-white backdrop-blur-sm">Anonymous boarder community</span>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Find a boarding house near the University of Antique
          </h1>
          <p className="mt-3 max-w-xl text-sm text-brand-50/90 sm:text-base">
            Compare boarder-friendly homes around Sibalom, share what you know, and reserve a room without creating an account.
          </p>
          <div className="mt-6 flex max-w-md items-center gap-2 rounded-2xl bg-white/95 p-1.5 shadow-lift">
            <Search className="ml-2 h-4.5 w-4.5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a boarding house or landmark..."
              className="w-full bg-transparent px-1 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-400" />
          <div className="flex gap-2">
            <FilterPill active={!filter} onClick={() => onFilter(undefined)} label="All boarding houses" />
            <FilterPill
              active={filter === 'LODGING_HOUSE'}
              onClick={() => onFilter('LODGING_HOUSE')}
              label="Boarding houses"
              icon={<Home className="h-3.5 w-3.5" />}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-400">{listings ? `${filtered.length} ${filtered.length === 1 ? 'house' : 'houses'}` : 'Loading…'}</span>
          <button onClick={() => setShowCreate((open) => !open)} className="btn-secondary px-3 py-2 text-xs"><Plus className="h-3.5 w-3.5" /> Add a house</button>
        </div>
      </div>

      {showCreate && <CreateCommunityPanel onCreated={() => { setShowCreate(false); setRefreshToken((value) => value + 1) }} />}

      {error && (
        <div className="card animate-fade-up p-6 text-center text-sm text-red-600">
          Couldn’t load listings: {error}
        </div>
      )}

      {!listings && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="skeleton aspect-[4/3] w-full" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-5 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {listings && filtered.length === 0 && !error && (
        <div className="card animate-fade-up p-10 text-center">
          <p className="text-sm font-semibold text-ink-600">No boarding houses match your search.</p>
          <p className="mt-1 text-xs text-ink-400">Try another landmark near the University of Antique.</p>
        </div>
      )}

      {listings && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} onOpen={onOpenListing} />
          ))}
        </div>
      )}
    </div>
  )
}

function CreateCommunityPanel({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [description, setDescription] = useState('')
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await api.createStudentCommunity({ title, location, monthly_rate: Number(monthlyRate), max_guests: 4, description, image_url: null })
    onCreated()
  }
  return <form onSubmit={submit} className="card mb-5 grid gap-3 p-5 sm:grid-cols-2"><div className="sm:col-span-2"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-accent-600" /><p className="text-sm font-semibold text-ink-900">Suggest a boarding house community</p></div><p className="mt-1 text-xs text-ink-500">Student-created communities are marked unverified until a partner confirms the house.</p></div><input className="input" placeholder="Boarding house name" value={title} onChange={(event) => setTitle(event.target.value)} required /><input className="input" placeholder="Location near University of Antique" value={location} onChange={(event) => setLocation(event.target.value)} required /><input className="input" type="number" min="0" placeholder="Monthly rate" value={monthlyRate} onChange={(event) => setMonthlyRate(event.target.value)} required /><input className="input" placeholder="What attracts students?" value={description} onChange={(event) => setDescription(event.target.value)} required /><button className="btn-primary sm:col-span-2" type="submit">Create unverified community</button></form>
}

function FilterPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`chip transition-all ${
        active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
