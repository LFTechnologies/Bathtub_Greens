'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  readTime: number
}

export default function PublicShowcasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/showcase/articles')
      const data = await response.json()

      if (data.success) {
        setArticles(data.articles)

        // Extract all unique tags
        const tags = new Set<string>()
        data.articles.forEach((article: Article) => {
          article.tags?.forEach((tag: string) => tags.add(tag))
        })
        setAllTags(Array.from(tags).sort())
      }
    } catch (err) {
      console.error('Failed to load articles:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = !selectedTag || article.tags?.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Hero Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold">
                ✨ AI-Powered Content Showcase
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bathtub Greens
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Explore AI-generated articles created with Claude & ChatGPT.
              See the future of content creation in action.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Admin Link */}
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                🔐 Admin Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Filter by category:
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedTag
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500'
                }`}
              >
                All Articles
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-500'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Total Articles:</span>
              <span className="font-bold text-gray-900 dark:text-white">{articles.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Showing:</span>
              <span className="font-bold text-blue-600">{filteredArticles.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">AI Powered:</span>
              <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                100%
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading articles...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery || selectedTag ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedTag
                ? 'Try adjusting your search or filter'
                : 'Check back soon for AI-generated content!'}
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTag(null)
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Articles Grid */}
        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article._id}
                href={`/showcase/${article._id}`}
                className="group"
              >
                <article className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  {/* Featured Image */}
                  {article.imageUrl && (
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* AI Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                          🤖 AI Generated
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                          {article.author?.displayName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <span>{article.author?.displayName || 'AI Author'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{article.readTime || Math.ceil((article.content?.length || 0) / 1000)} min</span>
                      </div>
                    </div>

                    {/* AI Provider Badge */}
                    {article.aiProvider && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Powered by:</span>
                          <span className={`font-semibold ${
                            article.aiProvider === 'openai'
                              ? 'text-blue-600'
                              : 'text-purple-600'
                          }`}>
                            {article.aiProvider === 'openai' ? '🤖 ChatGPT' : '🧠 Claude'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center p-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Want to create content like this?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our AI-powered platform can generate high-quality articles automatically.
            Perfect for blogs, news sites, and content creators.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors border-2 border-white/30"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Dual AI Power
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose between ChatGPT and Claude for content generation
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Instant Publishing
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate and publish articles in seconds, not hours
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              SEO Optimized
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built-in SEO optimization for better search rankings
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Bathtub Greens. Powered by AI.</p>
            <div className="flex justify-center gap-6 mt-4">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
