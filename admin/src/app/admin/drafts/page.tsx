'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PublishChannel = 'blog' | 'api' | 'email' | 'sms' | 'download'

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrafts, setSelectedDrafts] = useState<Set<string>>(new Set())
  const [publishModal, setPublishModal] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<Set<PublishChannel>>(new Set(['blog']))
  const [publishConfig, setPublishConfig] = useState({
    email: '',
    phoneNumber: '',
    scheduleDate: '',
    apiKeyRequired: false
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadDrafts()
  }, [])

  const loadDrafts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/articles?status=draft&sort=-createdAt', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setDrafts(data.articles)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleDraft = (id: string) => {
    const newSelected = new Set(selectedDrafts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedDrafts(newSelected)
  }

  const toggleChannel = (channel: PublishChannel) => {
    const newChannels = new Set(selectedChannels)
    if (newChannels.has(channel)) {
      newChannels.delete(channel)
    } else {
      newChannels.add(channel)
    }
    setSelectedChannels(newChannels)
  }

  const handlePublish = async () => {
    if (selectedDrafts.size === 0) {
      setError('Please select at least one draft to publish')
      return
    }
    if (selectedChannels.size === 0) {
      setError('Please select at least one publishing channel')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const response = await fetch('/api/publish/multi-channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          articleIds: Array.from(selectedDrafts),
          channels: Array.from(selectedChannels),
          config: publishConfig
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Successfully published to ${selectedChannels.size} channel(s)!`)
        setPublishModal(false)
        setSelectedDrafts(new Set())
        loadDrafts()
      } else {
        setError(data.error || 'Failed to publish')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (articleId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/articles/${articleId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `article-${articleId}.md`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const deleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Draft deleted successfully')
        loadDrafts()
      } else {
        setError(data.error || 'Failed to delete draft')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading drafts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📝 My Drafts
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your generated content and publish across multiple channels
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/content-gen"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✨ Generate More
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                🏠 Dashboard
              </Link>
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

        {/* Bulk Actions */}
        {selectedDrafts.size > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">📋</span>
                <span className="font-semibold text-blue-900 dark:text-blue-200">
                  {selectedDrafts.size} draft(s) selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPublishModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🚀 Publish Selected
                </button>
                <button
                  onClick={() => setSelectedDrafts(new Set())}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Drafts</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {drafts.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">AI Generated</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              {drafts.filter(d => d.aiGenerated).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Ready to Publish</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {drafts.filter(d => d.content && d.title).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Selected</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {selectedDrafts.size}
            </div>
          </div>
        </div>

        {/* Drafts List */}
        {drafts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No drafts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate AI content to see your drafts here
            </p>
            <Link
              href="/admin/content-gen"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✨ Generate Content
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft._id}
                className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all ${
                  selectedDrafts.has(draft._id)
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedDrafts.has(draft._id)}
                      onChange={() => toggleDraft(draft._id)}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {draft.title || 'Untitled Draft'}
                          </h3>

                          {draft.aiGenerated && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full mb-3">
                              🤖 AI Generated
                              {draft.aiProvider && ` • ${draft.aiProvider === 'openai' ? 'ChatGPT' : 'Claude'}`}
                            </div>
                          )}

                          <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                            {draft.excerpt || draft.content?.substring(0, 200) || 'No content'}
                          </p>

                          {draft.tags && draft.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {draft.tags.slice(0, 5).map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>📅 {new Date(draft.createdAt).toLocaleDateString()}</span>
                            {draft.wordCount && <span>📝 {draft.wordCount} words</span>}
                            {draft.source && <span>📰 {draft.source}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/articles/${draft._id}/edit`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => handleDownload(draft._id)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                          >
                            📥 Download
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDrafts(new Set([draft._id]))
                              setPublishModal(true)
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            🚀 Publish
                          </button>
                          <button
                            onClick={() => deleteDraft(draft._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {publishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🚀 Publish Content
                </h2>
                <button
                  onClick={() => setPublishModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Publishing {selectedDrafts.size} article(s) • Select channels below
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Publishing Channels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select Publishing Channels
                </h3>

                <div className="space-y-3">
                  {/* Blog */}
                  <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedChannels.has('blog')}
                      onChange={() => toggleChannel('blog')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <span className="text-xl">📰</span>
                        <span>Blog / Website</span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                          Free
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Publish directly to your blog. Articles will be visible at /articles
                      </p>
                    </div>
                  </label>

                  {/* API */}
                  <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedChannels.has('api')}
                      onChange={() => toggleChannel('api')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <span className="text-xl">🔌</span>
                        <span>API Access</span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                          Requires API Key
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Make content available via REST API. Generate an API key in settings.
                      </p>
                      <Link
                        href="/admin/api-keys"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        → Manage API Keys
                      </Link>
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedChannels.has('email')}
                      onChange={() => toggleChannel('email')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <span className="text-xl">📧</span>
                        <span>Email</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Send article via email
                      </p>
                      {selectedChannels.has('email') && (
                        <input
                          type="email"
                          value={publishConfig.email}
                          onChange={(e) => setPublishConfig({ ...publishConfig, email: e.target.value })}
                          placeholder="recipient@example.com"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                  </label>

                  {/* SMS */}
                  <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedChannels.has('sms')}
                      onChange={() => toggleChannel('sms')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <span className="text-xl">💬</span>
                        <span>SMS / Text</span>
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">
                          Premium
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Send article summary via SMS (link included)
                      </p>
                      {selectedChannels.has('sms') && (
                        <input
                          type="tel"
                          value={publishConfig.phoneNumber}
                          onChange={(e) => setPublishConfig({ ...publishConfig, phoneNumber: e.target.value })}
                          placeholder="+1234567890"
                          className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      )}
                    </div>
                  </label>

                  {/* Download */}
                  <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedChannels.has('download')}
                      onChange={() => toggleChannel('download')}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                        <span className="text-xl">📥</span>
                        <span>Download</span>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                          Free
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Download as Markdown (.md) or HTML files
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Schedule (Optional) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Schedule Publishing (Optional)
                </h3>
                <input
                  type="datetime-local"
                  value={publishConfig.scheduleDate}
                  onChange={(e) => setPublishConfig({ ...publishConfig, scheduleDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Leave empty to publish immediately
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handlePublish}
                  disabled={loading || selectedChannels.size === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  {loading ? '🔄 Publishing...' : '🚀 Publish Now'}
                </button>
                <button
                  onClick={() => setPublishModal(false)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
