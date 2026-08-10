import { useState } from 'react'
import { ArrowLeft, KeyRound, Shield, LogIn } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Role } from './RoleSelect'

interface Props {
  role: Extract<Role, 'host' | 'admin'>
  onSignedIn: () => void
  onBack: () => void
}

export function PortalSignIn({ role, onSignedIn, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const isAdmin = role === 'admin'
  const Icon = isAdmin ? Shield : KeyRound
  const title = isAdmin ? 'Admin sign in' : 'Host sign in'
  const description = isAdmin
    ? 'Sign in with your approved administrator account to manage verification and audit records.'
    : 'Sign in with your host account to manage listings and reservations.'

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    if (data.user?.app_metadata.role !== role) {
      await supabase.auth.signOut()
      setError(`This account is not approved for the ${isAdmin ? 'admin' : 'host'} portal.`)
      return
    }

    onSignedIn()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="btn-ghost mb-8 -ml-3">
          <ArrowLeft className="h-4 w-4" />
          Back to stays
        </button>
        <div className="card overflow-hidden">
          <div className={`h-1.5 ${isAdmin ? 'bg-ink-900' : 'bg-accent-500'}`} />
          <div className="p-7 sm:p-8">
            <span className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white ${isAdmin ? 'bg-ink-900' : 'bg-accent-500'}`}>
              <Icon className="h-6 w-6" />
            </span>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <label>
                <span className="label">Email address</span>
                <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              <label>
                <span className="label">Password</span>
                <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              </label>
              {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
              <button className="btn-primary w-full" type="submit" disabled={submitting}>
                <LogIn className="h-4 w-4" />
                {submitting ? 'Signing in…' : `Sign in as ${isAdmin ? 'Admin' : 'Host'}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
