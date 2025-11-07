// src/app/admin/ingest/page.js
'use client'

export default function IngestPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#121212]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold tracking-tight">Ingest</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <p className="text-zinc-300">
          Ingest pipeline placeholder. Hook your sources here (Twitter/X, RSS, web, etc) and POST to <code className="px-1 rounded bg-white/10">/api/articles</code>.
        </p>
      </main>
    </div>
  )
}
