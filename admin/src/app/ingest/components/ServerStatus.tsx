'use client'
import { useState } from 'react'
import { apiGet } from '../../lib/api'

export default function ServerStatus() {
  const [status, setStatus] = useState<'idle'|'ok'|'fail'|'busy'>('idle')
  const [msg, setMsg] = useState<string>('')

  async function check() {
    setStatus('busy'); setMsg('')
    try {
      const out = await apiGet('/api/health')
      setStatus(out?.ok ? 'ok' : 'fail')
      setMsg(out?.ok ? 'Connected' : 'Unexpected response')
    } catch (e: any) {
      setStatus('fail')
      setMsg(e?.message || 'Request failed')
    }
  }

  const tone = status==='ok' ? 'text-green-400' : status==='fail' ? 'text-red-400' : 'text-ink-dim'

  return (
    <div className="card p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-ink-dim">API connection</div>
        <div className={`font-medium ${tone}`}>
          {status==='idle' && 'Not checked yet'}
          {status==='busy' && 'Checking…'}
          {status!=='idle' && status!=='busy' && msg}
        </div>
        <div className="mt-1 text-xs text-ink-faint">
          {process.env.NEXT_PUBLIC_API_BASE}
        </div>
      </div>
      <button onClick={check} className="btn btn-primary">{status==='busy' ? 'Checking…' : 'Check connection'}</button>
    </div>
  )
}
