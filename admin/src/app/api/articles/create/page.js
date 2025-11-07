'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

async function apiPost(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {}),
  })
  const text = await r.text().catch(()=>'')
  if (!r.ok) throw new Error(text || `HTTP ${r.status}`)
  try { return JSON.parse(text) } catch { return {} }
}

const STATUS_OPTIONS = [
  { value: 'draft',            label: 'Draft' },
  { value: 'pending_review',   label: 'Pending review' },
  { value: 'published',        label: 'Published' },
]

export default function CreateArticlePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    summary: '',
    rawContent: '',
    tags: '',
    source: 'manual',
    sourceUrl: '',
    sourceAuthor: '',
    sourceHandle: '',
    status: 'draft',
    imageUrl: '',      // ✅ used below
    publishNow: false, // ✅ convenience switch
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const onChange = (e) => {
    const { name, value, type, checked } = e.target 
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setOk('')
    try {
      const payload = {
        ...form,
        status: form.publishNow ? 'published' : form.status,  // ✅ publish shortcut
        tags: form.tags.split(/[,\s]+/).map(t => t.trim()).filter(Boolean),
      }
      delete (payload).publishNow
      const res = await apiPost('/api/articles', payload)
      setOk('Article created')
      router.push('/admin/articles')  // or `/admin/articles/${res.id}`
    } catch (e) {
      setErr(e?.message || 'Failed to create article')
    } finally {
      setBusy(false)
    }
  }

  // Basic URL sanity (optional)
  const validImg = !form.imageUrl || /^https?:\/\//i.test(form.imageUrl)

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#121212]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Create Article</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {err && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-4 rounded-xl border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            {ok}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              placeholder="Headline"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Summary</label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={onChange}
              rows={3}
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              placeholder="Short deck / subheadline"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Content</label>
            <textarea
              name="rawContent"
              value={form.rawContent}
              onChange={onChange}
              rows={8}
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              placeholder="Body (markdown/plain text)"
            />
          </div>

          {/* ✅ Image URL + preview */}
          <div>
            <label className="block text-sm text-zinc-300 mb-1">Image URL (thumbnail)</label>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            />
            {!validImg && (
              <div className="mt-1 text-xs text-red-300">Enter a valid http(s) URL.</div>
            )}
            {form.imageUrl && validImg && (
              <div className="mt-3">
                <div className="text-xs text-zinc-400 mb-1">Preview</div>
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  className="max-h-48 w-full rounded-xl border border-white/10 object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Tags (comma or space separated)</label>
              <input
                name="tags"
                value={form.tags}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="tech markets AI"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2"
                disabled={form.publishNow} // publishNow overrides this
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <label className="mt-2 flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name="publishNow"
                  checked={form.publishNow}
                  onChange={onChange}
                />
                Publish now
              </label>
            </div>
          </div>

          {/* Optional source fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Source</label>
              <input
                name="source"
                value={form.source}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="manual / twitter / rss"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Source URL</label>
              <input
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Source Author</label>
              <input
                name="sourceAuthor"
                value={form.sourceAuthor}
                onChange={onChange}
                className="w-full rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                placeholder="Author"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="rounded-xl border border-zinc-700/60 bg-transparent px-4 py-2 text-sm hover:border-zinc-600 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
