"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet as _apiGet, apiPatch as _apiPatch, apiDelete as _apiDelete } from "../lib/api"; // assumes you have these; fallback shims below





const PAGE_SIZE = 20

export default function AdminArticlesPage() {
  const [pending, setPending] = useState([])
  const [published, setPublished] = useState([])
  const [tab, setTab] = useState('pending')
  const [busy, setBusy] = useState(true)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('updatedAt:desc')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(new Set())

  const apiGet = _apiGet || (async (path) => {
    const r = await fetch(path, { credentials: 'include', cache: 'no-store' })
    const text = await r.text().catch(()=>'')
    if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
    try { return JSON.parse(text) } catch { return {} }
  })
  const apiPatch = _apiPatch || (async (path, body) => {
    const r = await fetch(path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body || {}),
    })
    const text = await r.text().catch(()=>'')
    if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
    try { return JSON.parse(text) } catch { return {} }
  })
  const apiDelete = _apiDelete || (async (path, body) => {
    const r = await fetch(path, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body || {}),
    })
    const text = await r.text().catch(()=>'')
    if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
    try { return JSON.parse(text) } catch { return {} }
  })

  const load = async () => {
    try {
      setBusy(true)
      setErr('')
      const query = new URLSearchParams({ q, sort, page: String(page), limit: String(PAGE_SIZE) }).toString()
      const [p1, p2] = await Promise.all([
        apiGet(`/api/articles?status=pending_review&${query}`),
        apiGet(`/api/articles?status=published&${query}`),
      ])
      setPending(Array.isArray(p1?.items) ? p1.items : p1)
      setPublished(Array.isArray(p2?.items) ? p2.items : p2)
      setSelected(new Set())
    } catch (e) {
      setErr(e?.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => { load() }, [q, sort, page]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRows = tab === 'pending' ? pending : published

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const allChecked = activeRows.length > 0 && activeRows.every(r => selected.has(r._id))
  const anyChecked = selected.size > 0

  const toggleSelectAll = () => {
    if (allChecked) setSelected(new Set())
    else setSelected(new Set(activeRows.map(r => r._id)))
  }

  const optimistic = async (updater, action) => {
    const snapshot = { pending: [...pending], published: [...published] }
    try {
      updater()
      await action()
    } catch (e) {
      setPending(snapshot.pending)
      setPublished(snapshot.published)
      setErr(e?.message || String(e))
    }
  }

  const doPublish = async (ids) => {
    if (!ids?.length) return
    await optimistic(
      () => {
        const setA = new Set(ids)
        const moved = pending.filter(r => setA.has(r._id)).map(r => ({ ...r, status: 'published' }))
        setPending(rows => rows.filter(r => !setA.has(r._id)))
        setPublished(rows => [...moved, ...rows])
      },
      async () => { await apiPatch('/api/articles/bulk', { ids, op: 'publish' }) }
    )
    setSelected(new Set())
  }

  const doUnpublish = async (ids) => {
    if (!ids?.length) return
    await optimistic(
      () => {
        const setA = new Set(ids)
        const moved = published.filter(r => setA.has(r._id)).map(r => ({ ...r, status: 'pending_review' }))
        setPublished(rows => rows.filter(r => !setA.has(r._id)))
        setPending(rows => [...moved, ...rows])
      },
      async () => { await apiPatch('/api/articles/bulk', { ids, op: 'unpublish' }) }
    )
    setSelected(new Set())
  }

  const doDelete = async (ids) => {
    if (!ids?.length) return
    const ok = confirm(`Delete ${ids.length} article(s)? This cannot be undone.`)
    if (!ok) return
    await optimistic(
      () => {
        const setA = new Set(ids)
        setPending(rows => rows.filter(r => !setA.has(r._id)))
        setPublished(rows => rows.filter(r => !setA.has(r._id)))
      },
      async () => { await apiDelete('/api/articles/bulk', { ids }) }
    )
    setSelected(new Set())
  }

  const bulkPublish = () => doPublish([...selected])
  const bulkUnpublish = () => doUnpublish([...selected])
  const bulkDelete = () => doDelete([...selected])

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#121212]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Articles</h1>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => { setPage(1); setQ(e.target.value) }}
              placeholder="Search title or source…"
              className="w-56 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            />
            <select
              value={sort} onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm"
            >
              <option value="updatedAt:desc">Updated ↓</option>
              <option value="updatedAt:asc">Updated ↑</option>
              <option value="title:asc">Title A→Z</option>
              <option value="title:desc">Title Z→A</option>
            </select>
            <button onClick={load} className="rounded-xl border border-zinc-700/60 px-3 py-1.5 text-sm hover:border-zinc-600 hover:bg-zinc-800">
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {err ? <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{err}</div> : null}

        {/* Tabs */}
        <div className="mb-4 flex gap-2">
          <TabButton active={tab === 'pending'}  onClick={() => setTab('pending')}>Pending review ({pending.length})</TabButton>
          <TabButton active={tab === 'published'} onClick={() => setTab('published')}>Published ({published.length})</TabButton>
        </div>

        {/* Bulk actions */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-zinc-400">{busy ? 'Loading…' : `${activeRows.length} items`}</div>
          <div className="flex items-center gap-2">
            <button disabled={!anyChecked} onClick={bulkPublish}   className={btn(anyChecked)}>Publish</button>
            <button disabled={!anyChecked} onClick={bulkUnpublish} className={btn(anyChecked)}>Unpublish</button>
            <button disabled={!anyChecked} onClick={bulkDelete}    className={btnDestructive(anyChecked)}>Delete</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="sticky top-[57px] bg-[#121212]">
                <Th className="w-10">
                  <input type="checkbox" checked={allChecked} onChange={toggleSelectAll} />
                </Th>
                {/* 👇 NEW thumbnail column */}
                <Th className="w-12">Img</Th>
                <Th>Title</Th>
                <Th className="w-56">Source</Th>
                <Th className="w-48">Updated</Th>
                <Th className="w-40">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {activeRows?.length ? (
                activeRows.map((r) => (
                  <tr key={r._id} className="group">
                    <Td className="w-10 align-top">
                      <input type="checkbox" checked={selected.has(r._id)} onChange={() => toggleSelect(r._id)} />
                    </Td>
                    <Td className="w-12 align-top">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover border border-white/10" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-white/5 border border-white/10" />
                      )}
                    </Td>
                    <Td className="max-w-[560px] align-top">
                      <div className="truncate font-medium text-zinc-100" title={r.title}>{r.title}</div>
                      <div className="mt-1 line-clamp-2 text-zinc-400">{r.summary || '—'}</div>
                    </Td>
                    <Td className="align-top text-zinc-400">{r.source || '—'}</Td>
                    <Td className="align-top text-zinc-400">{fmtDate(r.updatedAt)}</Td>
                    <Td className="align-top">
                      <RowActions
                        r={r}
                        onPublish={() => doPublish([r._id])}
                        onUnpublish={() => doUnpublish([r._id])}
                        onDelete={() => doDelete([r._id])}
                      />
                    </Td>
                  </tr>
                ))
              ) : (
                <tr>
                  <Td colSpan={6} className="text-center text-zinc-400">No items.</Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (simple) */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className={btn(page !== 1)}>Prev</button>
          <span className="text-sm text-zinc-400">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} className={btn(true)}>Next</button>
        </div>
      </main>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-3 py-1.5 text-sm ${
        active
          ? 'border-zinc-500 bg-zinc-800 text-zinc-100'
          : 'border-zinc-700/60 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`sticky top-[57px] z-[1] border-b border-zinc-800 px-3 py-2 text-left font-medium text-zinc-300 ${className}`}>{children}</th>
  )
}
function Td({ children, className = '', colSpan }) {
  return (
    <td colSpan={colSpan} className={`border-b border-zinc-900 px-3 py-3 ${className}`}>{children}</td>
  )
}

function RowActions({ r, onPublish, onUnpublish, onDelete }) {
  const isPending = r.status === 'pending_review'
  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <button onClick={onPublish} className={btn(true)}>Publish</button>
      ) : (
        <button onClick={onUnpublish} className={btn(true)}>Unpublish</button>
      )}
      <a href={`/admin/articles/${r._id}`} className={linkBtn()}>Edit</a>
      <button onClick={onDelete} className={btnDestructive(true)}>Delete</button>
    </div>
  )
}

function btn(enabled) {
  return `rounded-xl border px-3 py-1.5 text-sm ${
    enabled
      ? 'border-zinc-700/60 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800'
      : 'pointer-events-none opacity-50 border-zinc-800 bg-zinc-900'
  }`
}
function btnDestructive(enabled) {
  return `rounded-xl border px-3 py-1.5 text-sm ${
    enabled
      ? 'border-red-900 bg-red-950/40 text-red-200 hover:bg-red-900/30'
      : 'pointer-events-none opacity-50 border-red-900 bg-red-950/20 text-red-300'
  }`
}
function linkBtn() {
  return 'rounded-xl border border-zinc-700/60 bg-transparent px-3 py-1.5 text-sm hover:border-zinc-600 hover:bg-zinc-800'
}
function fmtDate(d) {
  try { return new Date(d).toLocaleString() } catch { return '—' }
}
