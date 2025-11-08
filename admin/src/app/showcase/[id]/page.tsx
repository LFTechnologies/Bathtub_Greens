'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Article = {
  _id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  tags: string[]
  author: {
    displayName: string
  }
  createdAt: string
  publishedAt: string
  aiGenerated: boolean
  aiProvider: string
  seoTitle: string
  seoDescription: string
}

export default function ShowcaseArticlePage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (articleId) {
      loadArticle()
    }
  }, [articleId])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/showcase/articles/${articleId}`)
      const data = await response.json()

      if (data.success) {
        setArticle(data.article)

        // Update page title for SEO
        if (data.article.seoTitle) {
          document.title = data.article.seoTitle
        } else {
          document.title = `${data.article.title} | Bathtub Greens`
        }
      } else {
        setError(data.error || 'Article not found')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const readTime = article ? Math.ceil((article.content?.length || 0) / 1000) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The article you\'re looking for doesn\'t exist.'}
          </p>
          <Link
            href="/showcase"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            ← Back to Showcase
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/showcase"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Showcase
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              🔐 Admin
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* AI Badge */}
        {article.aiGenerated && (
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold shadow-lg">
              🤖 AI Generated Article
              {article.aiProvider && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {article.aiProvider === 'openai' ? 'ChatGPT' : 'Claude'}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
              {article.author?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {article.author?.displayName || 'AI Author'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{readTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag, i) => (
              <Link
                key={i}
                href={`/showcase?tag=${tag}`}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded-r-xl">
            <p className="text-lg text-gray-700 dark:text-gray-300 italic">
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {article.content}
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mb-12 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Share this article
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const url = window.location.href
                const text = `Check out this AI-generated article: ${article.title}`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              𝕏 Share on Twitter
            </button>
            <button
              onClick={() => {
                const url = window.location.href
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
              }}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              📘 Share on Facebook
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied to clipboard!')
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>

        {/* AI Transparency Notice */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-2">
            🤖 AI Transparency Notice
          </h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
            This article was generated using artificial intelligence ({article.aiProvider === 'openai' ? 'OpenAI ChatGPT' : 'Anthropic Claude'}).
            While we strive for accuracy, AI-generated content may contain errors or biases. Always verify important information from original sources.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Generated on {formatDate(article.createdAt)}</span>
          </div>
        </div>

        {/* Back to Showcase */}
        <div className="mt-12 text-center">
          <Link
            href="/showcase"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            ← Back to All Articles
          </Link>
        </div>
      </article>
    </div>
  )
}
