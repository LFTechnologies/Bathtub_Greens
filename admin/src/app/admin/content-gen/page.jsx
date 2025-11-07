'use client'

import { useState, useEffect } from 'react'

export default function ContentGenerationPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState(null)
  const [sources, setSources] = useState([])
  const [error, setError] = useState(null)

  const [config, setConfig] = useState({
    sourcesLimit: 50,
    articlesLimit: 5,
    aiProvider: 'both',
    autoPublish: false,
    fetchFullContent: true,
    minContentLength: 200,
    maxAgeHours: 24,
    categories: '',
    requireKeywords: '',
    excludeKeywords: ''
  })

  useEffect(() => {
    loadStats()
    loadSources()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/content-gen/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const loadSources = async () => {
    try {
      const res = await fetch('/api/content-gen/sources')
      const data = await res.json()
      if (data.success) {
        setSources(data.sources)
      }
    } catch (err) {
      console.error('Failed to load sources:', err)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        ...config,
        articlesLimit: parseInt(config.articlesLimit),
        sourcesLimit: parseInt(config.sourcesLimit),
        minContentLength: parseInt(config.minContentLength),
        maxAgeHours: parseInt(config.maxAgeHours),
        categories: config.categories ? config.categories.split(',').map(s => s.trim()) : null,
        requireKeywords: config.requireKeywords ? config.requireKeywords.split(',').map(s => s.trim()) : [],
        excludeKeywords: config.excludeKeywords ? config.excludeKeywords.split(',').map(s => s.trim()) : []
      }

      const res = await fetch('/api/content-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
        loadStats() // Refresh stats
      } else {
        setError(data.error || 'Generation failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleScan = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/content-gen/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: parseInt(config.sourcesLimit),
          fetchFullContent: false
        })
      })

      const data = await res.json()

      if (data.success) {
        alert(`Scan complete!\nFound ${data.totalArticles} articles from ${data.sourcesScanned} sources`)
      } else {
        setError(data.error || 'Scan failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Content Generation</h1>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Scans</div>
            <div className="text-2xl font-bold">{stats.totalScans || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Generated</div>
            <div className="text-2xl font-bold">{stats.totalGenerated || 0}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Last Scan</div>
            <div className="text-sm font-medium">
              {stats.lastScanAt ? new Date(stats.lastScanAt).toLocaleString() : 'Never'}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Recent Errors</div>
            <div className="text-2xl font-bold">{stats.recentErrors?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Generation Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Articles to Generate</label>
            <input
              type="number"
              value={config.articlesLimit}
              onChange={(e) => setConfig({ ...config, articlesLimit: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">News Sources Limit</label>
            <input
              type="number"
              value={config.sourcesLimit}
              onChange={(e) => setConfig({ ...config, sourcesLimit: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">AI Provider</label>
            <select
              value={config.aiProvider}
              onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="both">Both (Claude + OpenAI fallback)</option>
              <option value="claude">Claude (Anthropic) only</option>
              <option value="openai">ChatGPT (OpenAI) only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Article Age (hours)</label>
            <input
              type="number"
              value={config.maxAgeHours}
              onChange={(e) => setConfig({ ...config, maxAgeHours: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="1"
              max="168"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Min Content Length</label>
            <input
              type="number"
              value={config.minContentLength}
              onChange={(e) => setConfig({ ...config, minContentLength: e.target.value })}
              className="w-full border rounded px-3 py-2"
              min="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categories (comma-separated)</label>
            <input
              type="text"
              value={config.categories}
              onChange={(e) => setConfig({ ...config, categories: e.target.value })}
              placeholder="technology, general, world"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Required Keywords (OR)</label>
            <input
              type="text"
              value={config.requireKeywords}
              onChange={(e) => setConfig({ ...config, requireKeywords: e.target.value })}
              placeholder="AI, technology, innovation"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Exclude Keywords</label>
            <input
              type="text"
              value={config.excludeKeywords}
              onChange={(e) => setConfig({ ...config, excludeKeywords: e.target.value })}
              placeholder="sports, celebrity, gossip"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.fetchFullContent}
              onChange={(e) => setConfig({ ...config, fetchFullContent: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Fetch Full Article Content</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.autoPublish}
              onChange={(e) => setConfig({ ...config, autoPublish: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Auto-Publish (skip review)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>

          <button
            onClick={handleScan}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            {loading ? 'Scanning...' : 'Scan Only (No Generation)'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-4">Generation Complete!</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">Generated</div>
              <div className="text-2xl font-bold text-green-700">{result.generated}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Scanned</div>
              <div className="text-2xl font-bold">{result.scanned}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Filtered</div>
              <div className="text-2xl font-bold">{result.filtered}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Errors</div>
              <div className="text-2xl font-bold text-red-600">{result.errors}</div>
            </div>
          </div>

          {result.articles && result.articles.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Generated Articles:</h3>
              <ul className="space-y-2">
                {result.articles.map((article, i) => (
                  <li key={i} className="border-l-4 border-green-500 pl-3">
                    <div className="font-medium">{article.title}</div>
                    <div className="text-sm text-gray-600">
                      Status: {article.status} | Source: {article.source}
                    </div>
                    <a
                      href={`/articles/${article.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Article →
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* News Sources */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Configured News Sources ({sources.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map((source, i) => (
            <div key={i} className="border rounded p-3">
              <div className="font-medium">{source.name}</div>
              <div className="text-sm text-gray-600">{source.category}</div>
              <div className="text-xs text-gray-400 truncate">{source.url}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
