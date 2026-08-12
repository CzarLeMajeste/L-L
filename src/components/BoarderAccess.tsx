import { useState } from 'react'
import { ArrowLeft, BadgeCheck, LogIn, UserPlus } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export interface BoarderProfile {
  displayName: string
  studentId: string
  verified: boolean
}

interface Props {
  onDone: (profile: BoarderProfile) => void
  onBack: () => void
}

export function BoarderAccess({ onDone, onBack }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (mode === 'signup' && (!displayName.trim() || !studentId.trim())) {
      setError('Add your display name and student ID to join the boarder community.')
      return
    }
    setBusy(true)

    if (!isSupabaseConfigured) {
      const profile = { displayName: displayName.trim() || 'Anonymous boarder', studentId: studentId.trim() || 'pending', verified: mode === 'signup' }
      localStorage.setItem('boarder-profile', JSON.stringify(profile))
      setBusy(false)
      onDone(profile)
      return
    }

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName.trim(), student_id: studentId.trim(), account_type: 'boarder' } } })
      setBusy(false)
      if (signUpError) return setError(signUpError.message)
      setMessage('Account created. Student ID verification is pending review.')
      onDone({ displayName: displayName.trim(), studentId: studentId.trim(), verified: false })
      return
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (signInError) return setError(signInError.message)
    const metadata = data.user?.user_metadata ?? {}
    onDone({ displayName: metadata.display_name ?? email.split('@')[0], studentId: metadata.student_id ?? 'pending', verified: metadata.student_id !== undefined })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="btn-ghost mb-8 -ml-3"><ArrowLeft className="h-4 w-4" /> Back to community</button>
        <div className="card overflow-hidden">
          <div className="h-1.5 bg-brand-600" />
          <div className="p-7 sm:p-8">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white"><BadgeCheck className="h-6 w-6" /></span>
            <h1 className="font-display text-2xl font-extrabold text-ink-900">{mode === 'signup' ? 'Join the boarder community' : 'Boarder sign in'}</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">Use a student ID for a safer, more useful community around University of Antique boarding houses.</p>
            <form onSubmit={submit} className="mt-7 space-y-4">
              {mode === 'signup' && <>
                <label><span className="label">Display name</span><input className="input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Anonymous boarder" required /></label>
                <label><span className="label">Student ID</span><input className="input" value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="UA-2026-001" required /></label>
              </>}
              <label><span className="label">Email address</span><input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
              <label><span className="label">Password</span><input className="input" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
              {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>}
              {message && <p className="rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700">{message}</p>}
              <button className="btn-primary w-full" type="submit" disabled={busy}>{mode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}{busy ? 'Working…' : mode === 'signup' ? 'Create boarder account' : 'Sign in'}</button>
              <button type="button" className="btn-ghost w-full" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setMessage(null) }}>{mode === 'signup' ? 'Already a boarder? Sign in' : 'New boarder? Create an account'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
