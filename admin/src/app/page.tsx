'use client'
import useSWR from 'swr'
import { apiGet } from './lib/api'

export default function Page() {
  const { data: published } = useSWR(['/api/articles?status=published'], ([u]) => apiGet(u), { revalidateOnFocus: false })
  const { data: pending }   = useSWR(['/api/articles?status=pending_review'], ([u]) => apiGet(u), { revalidateOnFocus: false })

  return (
    <div className="container-page space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Published" value={published?.length ?? '–'} />
        <StatCard label="Pending Review" value={pending?.length ?? '–'} />
        <StatCard label="Ingestion Source" value="Twitter (Highlights)" />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="card p-4">
      <div className="text-ink-dim text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
