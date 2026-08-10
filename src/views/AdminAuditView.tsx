import { useEffect, useState } from 'react'
import { ScrollText, Check, X } from 'lucide-react'
import { api } from '../lib/api'
import type { AuditLog } from '../lib/types'

export function AdminAuditView() {
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
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
          <ScrollText className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">Audit logs</h1>
          <p className="text-sm text-ink-500">Every action taken across the platform.</p>
        </div>
      </div>

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
          <div className="max-h-[65vh] overflow-y-auto divide-y divide-ink-50">
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
    </div>
  )
}
