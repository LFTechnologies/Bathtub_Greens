'use client'

import { useEffect, useState } from 'react'

type UserRow = {
  _id: string
  email?: string
  alias?: string
  role?: 'admin' | 'moderator' | 'user'
  createdAt?: string
}

const BASE = process.env.NEXT_PUBLIC_API_BASE as string | undefined

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErr('')
      try {
        // Prefer your existing auth gate if needed; this assumes /api/users requires cookie auth
        const res = await fetch('/api/users', { credentials: 'include', cache: 'no-store' })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        const data = await res.json()
        setRows(Array.isArray(data) ? data : data?.users || [])
      } catch (e: any) {
        setErr(e?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        {/* Placeholder for future actions (invite, filters, etc.) */}
      </header>

      {err && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Alias</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-white/70" colSpan={5}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={5}>No users yet.</td>
              </tr>
            ) : (
              rows.map(u => (
                <tr key={u._id} className="border-t border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">{u.alias || '—'}</td>
                  <td className="px-4 py-3">{u.email || '—'}</td>
                  <td className="px-4 py-3">{u.role || 'user'}</td>
                  <td className="px-4 py-3">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15">
                        View
                      </button>
                      <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
