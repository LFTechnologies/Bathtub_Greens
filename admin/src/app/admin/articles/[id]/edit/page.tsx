'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Tab = 'content' | 'media' | 'social' | 'seo' | 'preview'

export default function ArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string

  const [activeTab, setActiveTab] = useState<Tab>('content')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Article data
  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    tags: [] as string[],
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  })

  // Social media posts
  const [socialPosts, setSocialPosts] = useState({
    twitter: '',
    tiktok: '',
  })

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadArticle()
  }, [articleId])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to load article')

      const data = await response.json()

      setArticle({
        title: data.title || '',
        content: data.content || data.cleanedContent || data.rawContent || '',
        excerpt: data.excerpt || data.summary || data.aiSummary || '',
        imageUrl: data.imageUrl || '',
        tags: data.tags || [],
        status: data.status || 'draft',
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.summary || '',
        seoKeywords: data.seoKeywords || (data.tags || []).join(', ') || '',
      })

      // Generate initial social posts
      generateSocialPosts(data)

      // Load associated images
      if (data.imageUrl) {
        setImages([data.imageUrl])
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateSocialPosts = (data: any) => {
    const title = data.title || ''
    const url = `${window.location.origin}/articles/${articleId}`

    // Twitter post (280 chars)
    const twitterPost = `${title}\n\n${data.summary?.substring(0, 150) || ''}...\n\nRead more: ${url}\n\n${(data.tags || []).slice(0, 3).map((t: string) => `#${t.replace(/\s+/g, '')}`).join(' ')}`

    // TikTok caption (150 chars optimal)
    const tiktokPost = `${title} 🎬\n\n${(data.tags || []).slice(0, 5).map((t: string) => `#${t.replace(/\s+/g, '')}`).join(' ')}\n\nLink in bio! 🔗`

    setSocialPosts({
      twitter: twitterPost.substring(0, 280),
      tiktok: tiktokPost.substring(0, 150),
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('image', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (data.success && data.url) {
        setImages(prev => [...prev, data.url])
        if (!article.imageUrl) {
          setArticle(prev => ({ ...prev, imageUrl: data.url }))
        }
        setSuccess('Image uploaded successfully!')
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const selectImage = (url: string) => {
    setArticle(prev => ({ ...prev, imageUrl: url }))
  }

  const handleSave = async (newStatus?: string) => {
    try {
      setSaving(true)
      setError(null)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...article,
          status: newStatus || article.status,
          cleanedContent: article.content,
          summary: article.excerpt,
        })
      })

      const data = await response.json()

      if (data.success || data.ok) {
        setSuccess(newStatus === 'published' ? 'Article published!' : 'Article saved!')
        if (newStatus === 'published') {
          setTimeout(() => router.push('/articles'), 1500)
        }
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !article.tags.includes(trimmed)) {
      setArticle(prev => ({ ...prev, tags: [...prev.tags, trimmed] }))
    }
  }

  const removeTag = (tag: string) => {
    setArticle(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const copySocialPost = (platform: 'twitter' | 'tiktok') => {
    navigator.clipboard.writeText(socialPosts[platform])
    setSuccess(`${platform === 'twitter' ? 'X/Twitter' : 'TikTok'} post copied to clipboard!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/drafts"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Article
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                article.status === 'published'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : article.status === 'draft'
                  ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
              }`}>
                {article.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {saving ? '💾 Saving...' : '💾 Save Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
              >
                {saving ? '🚀 Publishing...' : '🚀 Publish'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start justify-between">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-200">Success</h3>
                <p className="text-green-700 dark:text-green-300 mt-1">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')}>
            📝 Content
          </TabButton>
          <TabButton active={activeTab === 'media'} onClick={() => setActiveTab('media')}>
            🖼️ Media
          </TabButton>
          <TabButton active={activeTab === 'social'} onClick={() => setActiveTab('social')}>
            📱 Social Media
          </TabButton>
          <TabButton active={activeTab === 'seo'} onClick={() => setActiveTab('seo')}>
            🎯 SEO
          </TabButton>
          <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')}>
            👁️ Preview
          </TabButton>
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Article Content</h2>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={article.title}
                  onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt / Summary
                </label>
                <textarea
                  value={article.excerpt}
                  onChange={(e) => setArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the article..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={article.content}
                  onChange={(e) => setArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {article.content.length} characters • {Math.ceil(article.content.split(/\s+/).filter(Boolean).length / 200)} min read
                </p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      addTag(input.value)
                      input.value = ''
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Media Gallery</h2>

              {/* Featured Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Featured Image
                </label>
                {article.imageUrl ? (
                  <div className="relative group">
                    <img
                      src={article.imageUrl}
                      alt="Featured"
                      className="w-full h-64 object-cover rounded-lg border-2 border-blue-500"
                    />
                    <button
                      onClick={() => setArticle(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No featured image selected</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Upload or select an image below</p>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-semibold"
                >
                  {uploadingImage ? '📤 Uploading...' : '📤 Upload New Image'}
                </button>
              </div>

              {/* Image Gallery */}
              {images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Featured Image ({images.length} total)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => selectImage(url)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          article.imageUrl === url
                            ? 'border-blue-500 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Image ${i + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        {article.imageUrl === url && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            ✓ Featured
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image URL Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or paste image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={article.imageUrl}
                    onChange={(e) => setArticle(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* X/Twitter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">𝕏</span> X / Twitter Post
                </h2>
                <button
                  onClick={() => generateSocialPosts({ title: article.title, summary: article.excerpt, tags: article.tags })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🔄 Regenerate
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={socialPosts.twitter}
                  onChange={(e) => setSocialPosts(prev => ({ ...prev, twitter: e.target.value.substring(0, 280) }))}
                  rows={6}
                  maxLength={280}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {socialPosts.twitter.length} / 280 characters
                  </p>
                  <button
                    onClick={() => copySocialPost('twitter')}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preview:</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">Your Account</div>
                      <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{socialPosts.twitter}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TikTok */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">🎵</span> TikTok Caption
                </h2>
                <button
                  onClick={() => generateSocialPosts({ title: article.title, summary: article.excerpt, tags: article.tags })}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                >
                  🔄 Regenerate
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={socialPosts.tiktok}
                  onChange={(e) => setSocialPosts(prev => ({ ...prev, tiktok: e.target.value.substring(0, 150) }))}
                  rows={4}
                  maxLength={150}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {socialPosts.tiktok.length} / 150 characters (optimal)
                  </p>
                  <button
                    onClick={() => copySocialPost('tiktok')}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">💡 TikTok Tips:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Use 3-5 relevant hashtags</li>
                  <li>• Keep it short and catchy (under 150 chars)</li>
                  <li>• Add emojis for engagement 🎬✨</li>
                  <li>• Include call-to-action (Link in bio!)</li>
                  <li>• Post during peak hours (6-10 PM)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO Settings</h2>

              <div className="space-y-4">
                {/* SEO Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={article.seoTitle}
                    onChange={(e) => setArticle(prev => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Optimized title for search engines..."
                    maxLength={60}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {article.seoTitle.length} / 60 characters {article.seoTitle.length > 60 ? '⚠️ Too long' : '✓'}
                  </p>
                </div>

                {/* SEO Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={article.seoDescription}
                    onChange={(e) => setArticle(prev => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Brief description for search results..."
                    rows={3}
                    maxLength={160}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {article.seoDescription.length} / 160 characters {article.seoDescription.length > 160 ? '⚠️ Too long' : '✓'}
                  </p>
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={article.seoKeywords}
                    onChange={(e) => setArticle(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* SEO Preview */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Google Search Preview:</h3>
                  <div className="bg-white dark:bg-gray-800 rounded p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {window.location.origin}/articles/{articleId}
                    </div>
                    <div className="text-xl text-blue-600 dark:text-blue-400 mb-1">
                      {article.seoTitle || article.title || 'Untitled Article'}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {article.seoDescription || article.excerpt || 'No description available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Preview Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Article Preview</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">See how your article will look when published</p>
              </div>

              {/* Article Preview */}
              <article className="p-8">
                {/* Featured Image */}
                {article.imageUrl && (
                  <div className="mb-8 -mx-8">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {article.title || 'Untitled Article'}
                </h1>

                {/* Excerpt */}
                {article.excerpt && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 italic">
                    {article.excerpt}
                  </p>
                )}

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {article.content || 'No content yet. Start writing in the Content tab!'}
                  </div>
                </div>
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )
}
