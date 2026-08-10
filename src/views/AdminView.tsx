import { useEffect, useState } from 'react'
import { Shield, ShieldCheck, ScrollText, Check, X } from 'lucide-react'
import { api } from '../lib/api'
import type { AuditLog, ClientVerification } from '../lib/types'

type Tab = 'verify' | 'audit'

export function AdminView() {
  const [tab, setTab] = useState<Tab>('verify')
  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Admin console</h1>
          <p className="text-sm text-ink-500">Verify clients and review the audit trail.</p>
        </div>
      </div>

      <div className="mb-5 flex gap-2">
        <TabPill active={tab === 'verify'} onClick={() => setTab('verify')} label="Identity verification" icon={<ShieldCheck className="h-4 w-4" />} />
        <TabPill active={tab === 'audit'} onClick={() => setTab('audit')} label="Audit logs" icon={<ScrollText className="h-4 w-4" />} />
      </div>

      {tab === 'verify' && <VerifyPanel />}
      {tab === 'audit' && <AuditPanel />}
    </div>
  )
}

function VerifyPanel() {
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
      ['guest-001', 'guest-002', 'client-001'].map((c) => api.getVerification(c).then((v) => v).catch(() => null)),
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
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-ink-900">Verify a client</h2>
        <p className="mt-1 text-xs text-ink-500">Confirm identity and compliance. Verified clients can create listings, book stays, and generate InstaPay QR codes.</p>
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
  )
}

function AuditPanel() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLogs(null)
    api.getAuditLogs().then(
      (d) => active && setLogs(d),
      (e) => active && setError(e.message),
    )
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-ink-100 px-5 py-3">
        <h2 className="font-display text-sm font-bold text-ink-900">Recent activity</h2>
      </div>
      {error && <div className="p-5 text-sm text-red-600">{error}</div>}
      {!logs && !error && (
        <div className="space-y-2 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-xl" />
          ))}
        </div>
      )}
      {logs && logs.length === 0 && <div className="p-8 text-center text-sm text-ink-400">No audit entries yet.</div>}
      {logs && logs.length > 0 && (
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-ink-50">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-3 px-5 py-3">
              <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${l.outcome === 'SUCCESS' ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-red-600'}`}>
                {l.outcome === 'SUCCESS' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink-900">{l.action}</p>
                  <span className="shrink-0 text-[11px] text-ink-400">{new Date(l.timestamp).toLocaleString('en-PH')}</span>
                </div>
                <p className="text-xs text-ink-500">
                  <span className="font-medium text-ink-700">{l.actor_type}</span> · {l.actor_id}
                  {l.target_id && <span> → {l.target_id}</span>}
                </p>
                {l.detail && <p className="mt-0.5 text-xs text-ink-400">{l.detail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TabPill({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
        active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 ring-1 ring-ink-200 hover:bg-ink-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
