import { useEffect, useState } from 'react'
import { ShieldCheck, Check } from 'lucide-react'
import { api } from '../lib/api'
import type { ClientVerification } from '../lib/types'

export function AdminVerifyView() {
  const [adminId] = useState('admin-ops')
  const [clientId, setClientId] = useState('guest-001')
  const [docType, setDocType] = useState('PASSPORT')
  const [docId, setDocId] = useState('')
  const [compliance, setCompliance] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ClientVerification | null>(null)
  const [verified, setVerified] = useState<ClientVerification[]>([])

  const refresh = async () => {
    const rows = await Promise.all(
      ['guest-001', 'guest-002', 'client-001'].map((c) => api.getVerification(c).catch(() => null)),
    )
    setVerified(rows.filter(Boolean) as ClientVerification[])
  }
  useEffect(() => {
    refresh()
  }, [])

  const submit = async () => {
    setError(null)
    if (!clientId.trim()) return setError('Enter a client ID.')
    if (!docId.trim() || docId.trim().length < 6) return setError('Document ID must be at least 6 characters.')
    if (!compliance) return setError('Compliance must be accepted to verify.')
    setSubmitting(true)
    try {
      const v = await api.verifyClient(adminId, clientId.trim(), docType, docId.trim(), compliance)
      setResult(v)
      refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Identity verification</h1>
          <p className="text-sm text-ink-500">Confirm client identity and compliance.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Verify a client</h2>
          <p className="mt-1 text-xs text-ink-500">Verified clients can book stays and generate InstaPay QR codes.</p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label">Client ID</label>
              <input className="input" value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="guest-001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Document type</label>
                <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option>PASSPORT</option>
                  <option>DRIVERS_LICENSE</option>
                  <option>PHILSYS_ID</option>
                  <option>UMID</option>
                </select>
              </div>
              <div>
                <label className="label">Document ID</label>
                <input className="input" value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="A1234567" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input type="checkbox" checked={compliance} onChange={(e) => setCompliance(e.target.checked)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              Compliance accepted
            </label>
            {error && <p className="text-xs font-medium text-red-600">{error}</p>}
            <button onClick={submit} disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Verifying…' : 'Verify client'}
            </button>
            {result && (
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm font-semibold text-brand-700">
                <Check className="h-4 w-4" /> {result.client_id} verified & compliant
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Verified clients</h2>
          <p className="mt-1 text-xs text-ink-500">Clients who have passed identity verification.</p>
          <div className="mt-4 space-y-2">
            {verified.length === 0 && <p className="text-sm text-ink-400">No verified clients yet.</p>}
            {verified.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl bg-ink-50 px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{v.client_id}</p>
                  <p className="text-xs text-ink-500">{v.document_type} · {v.document_id}</p>
                </div>
                <span className="chip bg-brand-100 text-brand-700">
                  <Check className="h-3 w-3" /> Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
