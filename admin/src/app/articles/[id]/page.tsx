import Link from 'next/link'

export const revalidate = 0
export const dynamic = 'force-dynamic'

async function getArticle(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ''}/api/articles/${id}`, { cache: 'no-store', credentials: 'include' as any })
  if (!res.ok) throw new Error('Not found')
  return res.json()
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/feed" className="text-sm text-zinc-400 hover:text-zinc-200">&larr; Back</Link>
      <h1 className="mt-4 text-2xl font-semibold">{article.title}</h1>
      {article.imageUrl && (
        <img src={article.imageUrl} alt={article.title} className="mt-4 w-full rounded-xl border border-white/10" />
      )}
      {article.summary && (
        <p className="mt-6 text-zinc-300 leading-7">{article.summary}</p>
      )}
      {/* Render full content here if available */}
    </main>
  )
}
