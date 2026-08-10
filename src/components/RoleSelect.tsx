import { useState } from 'react'
import { Compass, KeyRound, Shield, Home, ArrowRight } from 'lucide-react'

export type Role = 'client' | 'host' | 'admin'

interface Props {
  onSelect: (role: Role) => void
}

const ROLES: { key: Role; label: string; tagline: string; icon: typeof Compass; accent: string }[] = [
  {
    key: 'client',
    label: 'Client',
    tagline: 'Browse stays, book trips, and pay with InstaPay QR.',
    icon: Compass,
    accent: 'from-brand-600 to-brand-800',
  },
  {
    key: 'host',
    label: 'Host',
    tagline: 'Publish lodging houses & condos for guests to book.',
    icon: KeyRound,
    accent: 'from-accent-500 to-accent-700',
  },
  {
    key: 'admin',
    label: 'Admin',
    tagline: 'Verify client identities and review the audit trail.',
    icon: Shield,
    accent: 'from-ink-800 to-ink-950',
  },
]

export function RoleSelect({ onSelect }: Props) {
  const [hovered, setHovered] = useState<Role | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-2.5 px-6 py-4 sm:px-10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
          <Home className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
          Lodge<span className="text-brand-600">Link</span>
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <div className="mb-10 text-center">
            <span className="chip bg-brand-50 text-brand-700">Love at the Lodge</span>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Who are you today?
            </h1>
            <p className="mt-2 text-sm text-ink-500">Choose your role to enter the right experience.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {ROLES.map(({ key, label, tagline, icon: Icon, accent }, i) => (
              <button
                key={key}
                onClick={() => onSelect(key)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${i * 80}ms` }}
                className="card animate-fade-up group relative overflow-hidden p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${accent}`} />
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-soft`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-xl font-extrabold text-ink-900">{label}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{tagline}</p>
                <div className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-all ${hovered === key ? 'text-brand-600' : 'text-ink-400'}`}>
                  Enter as {label}
                  <ArrowRight className={`h-4 w-4 transition-transform ${hovered === key ? 'translate-x-1' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
