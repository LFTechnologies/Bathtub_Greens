'use client';

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

function timeAgo(d: any) {
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d
  const diff = Math.max(0, Date.now() - date.getTime())
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hr  = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  if (sec < 45) return `${sec}s ago`
  if (min < 60) return `${min}m ago`
  if (hr  < 24) return `${hr}h ago`
  if (day < 7)  return `${day}d ago`
  return date.toLocaleDateString()
}
// keep this somewhere above the usage in the same file (or import it)
function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
      <div className="h-48 w-full bg-zinc-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 bg-zinc-800" />
        <div className="h-3 w-1/2 bg-zinc-800" />
        <div className="h-3 w-full bg-zinc-800" />
      </div>
    </div>
  )
}

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200/20 bg-zinc-900/50 px-2 py-0.5 text-xs text-zinc-200">
      {children}
    </span>
  )
}

function isInternal(href: string) {
  return href.startsWith('/') || href.startsWith('#')
}

function ArticleCard({ a }: { a: any }) {
  const href = a.href || `/article/${a.id || a._id}`

  const ImageWrap = ({ children }: { children: React.ReactNode }) =>
    isInternal(href) ? (
      <Link href={href} className="block">
        {children}
      </Link>
    ) : (
      <a href={href} className="block" rel="noopener noreferrer">
        {children}
      </a>
    )

  const TitleWrap = ({ children }: { children: React.ReactNode }) =>
    isInternal(href) ? (
      <Link href={href} className="block">{children}</Link>
    ) : (
      <a href={href} className="block" rel="noopener noreferrer">{children}</a>
    )

  const ReadBtn = () =>
    isInternal(href) ? (
      <Link
        href={href}
        className="inline-flex items-center rounded-xl border border-zinc-700/60 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
      >
        Read
      </Link>
    ) : (
      <a
        href={href}
        rel="noopener noreferrer"
        className="inline-flex items-center rounded-xl border border-zinc-700/60 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
      >
        Read
      </a>
    )

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d0d0d] shadow-sm transition hover:shadow-md">
      {a.imageUrl ? (
        <ImageWrap>
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
            <img
              src={a.imageUrl}
              alt={a.title || 'Article image'}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </ImageWrap>
      ) : null}

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            {a.author ? <span className="truncate">{a.author}</span> : <span>—</span>}
            <span className="text-zinc-700">•</span>
            {a.publishedAt ? (
              <time dateTime={new Date(a.publishedAt).toISOString()}>{timeAgo(a.publishedAt)}</time>
            ) : (
              <span>Just now</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {(a.tags || []).slice(0, 3).map((t: string) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>

        <TitleWrap>
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-zinc-100">
            {a.title}
          </h3>
          {a.summary ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-300/90">
              {a.summary}
            </p>
          ) : null}
        </TitleWrap>

        <div className="mt-4 flex items-center justify-between">
          <ReadBtn />
          <div className="flex items-center gap-3 text-zinc-400">
            <button className="rounded-full p-1.5 hover:bg-zinc-800" title="Like" aria-label="Like">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.177 25.18 25.18 0 01-4.244-2.54C4.688 16.227 2.25 13.806 2.25 10.5A5.25 5.25 0 017.5 5.25a5.5 5.5 0 014.5 2.4 5.5 5.5 0 014.5-2.4 5.25 5.25 0 015.25 5.25c0 3.306-2.438 5.727-4.739 7.68a25.18 25.18 0 01-4.244 2.54 15.247 15.247 0 01-.383.177l-.022.01-.007.003a.75.75 0 01-.606 0z" />
              </svg>
            </button>
            <button className="rounded-full p-1.5 hover:bg-zinc-800" title="Share" aria-label="Share">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M15 8a3 3 0 100-6 3 3 0 000 6zm-6 11a3 3 0 100-6 3 3 0 000 6zm12 3a3 3 0 100-6 3 3 0 000 6z" />
                <path d="M8.59 13.51l6.82-3.02M8.59 14.49l6.82 3.02" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function UserArticleFeed({ fetchUrl = '/api/articles', pageSize = 12 }: { fetchUrl?: string; pageSize?: number }) {
  const [articles, setArticles] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')

  const url = useMemo(() => {
    try {
      return `${fetchUrl}?page=${page}&limit=${pageSize}`
    } catch {
      return fetchUrl
    }
  }, [fetchUrl, page, pageSize])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(url, { credentials: 'include', cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.items || data.articles || []
        const more  = Array.isArray(data) ? items.length === pageSize : Boolean(data.hasMore ?? items.length === pageSize)
        if (!cancelled) {
          setArticles(prev => (page === 1 ? items : [...prev, ...items]))
          setHasMore(more)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load articles')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [url, page, pageSize])

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#121212]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Latest</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              className="rounded-xl border border-zinc-700/60 px-3 py-1.5 text-sm hover:border-zinc-600 hover:bg-zinc-800"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id || a._id} a={a} />
          ))}

          {loading && articles.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => <div key={i}><CardSkeleton /></div>)
          }
        </div>

        <div className="mt-8 flex justify-center">
          {hasMore ? (
            <button
              disabled={loading}
              onClick={() => setPage((p) => p + 1)}
              className={cx(
                'inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm',
                'border border-zinc-700/60 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800',
                loading && 'opacity-60'
              )}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                  Loading…
                </span>
              ) : (
                'Load more'
              )}
            </button>
          ) : (
            !loading && articles.length > 0 && (
              <div className="text-sm text-zinc-400">You&apos;re all caught up.</div>
            )
          )}
        </div>
      </main>
    </div>
  )
}
