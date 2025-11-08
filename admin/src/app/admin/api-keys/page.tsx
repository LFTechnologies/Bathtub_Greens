'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ApiKey = {
  _id: string
  name: string
  key: string
  keyPreview: string
  permissions: string[]
  rateLimit: number
  usageCount: number
  lastUsed: string | null
  expiresAt: string | null
  createdAt: string
  isActive: boolean
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: ['read'] as string[],
    rateLimit: 1000,
    expiresInDays: 365
  })
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setApiKeys(data.keys)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permission: string) => {
    const newPermissions = newKeyData.permissions.includes(permission)
      ? newKeyData.permissions.filter(p => p !== permission)
      : [...newKeyData.permissions, permission]
    setNewKeyData({ ...newKeyData, permissions: newPermissions })
  }

  const createApiKey = async () => {
    if (!newKeyData.name.trim()) {
      setError('Please enter a name for the API key')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newKeyData)
      })

      const data = await response.json()
      if (data.success) {
        setCreatedKey(data.key.key) // Full key only shown once
        loadApiKeys()
        setShowCreateModal(false)
        setNewKeyData({
          name: '',
          permissions: ['read'],
          rateLimit: 1000,
          expiresInDays: 365
        })
      } else {
        setError(data.error || 'Failed to create API key')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        loadApiKeys()
      } else {
        setError(data.error || 'Failed to delete API key')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleKeyStatus = async (keyId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/api-keys/${keyId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        loadApiKeys()
      } else {
        setError(data.error || 'Failed to update API key')
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('✅ Copied to clipboard!')
  }

  if (loading && apiKeys.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading API keys...</p>
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
                🔑 API Keys
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage programmatic access to your content
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Create API Key
              </button>
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
        {/* New Key Alert */}
        {createdKey && (
          <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-200">
                  ✅ API Key Created Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  Make sure to copy your API key now. You won't be able to see it again!
                </p>
              </div>
              <button
                onClick={() => setCreatedKey(null)}
                className="text-green-600 hover:text-green-800 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-300 dark:border-green-700">
              <code className="flex-1 font-mono text-sm break-all text-gray-900 dark:text-white">
                {createdKey}
              </code>
              <button
                onClick={() => copyToClipboard(createdKey)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Keys</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {apiKeys.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Keys</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {apiKeys.filter(k => k.isActive).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {apiKeys.reduce((sum, k) => sum + k.usageCount, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Expired Keys</div>
            <div className="text-3xl font-bold text-red-600 mt-2">
              {apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length}
            </div>
          </div>
        </div>

        {/* API Keys List */}
        {apiKeys.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🔑</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No API keys yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create an API key to access your content programmatically
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Create Your First API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => {
              const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date()

              return (
                <div
                  key={key._id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {key.name}
                        </h3>
                        {key.isActive && !isExpired ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                            Active
                          </span>
                        ) : isExpired ? (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-semibold rounded">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded">
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <code className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded font-mono text-sm">
                          {key.keyPreview}
                        </code>
                        <button
                          onClick={() => copyToClipboard(key.keyPreview)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          📋 Copy
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {key.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Requests</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {key.usageCount.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Rate Limit</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {key.rateLimit}/hour
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Last Used</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">Expires</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => toggleKeyStatus(key._id)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          key.isActive
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {key.isActive ? '⏸️ Disable' : '▶️ Enable'}
                      </button>
                      <button
                        onClick={() => deleteApiKey(key._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Documentation */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3">
            📚 API Documentation
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <strong>Base URL:</strong> <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">https://yourdomain.com/api</code>
            </div>
            <div>
              <strong>Authentication:</strong> Include your API key in the <code>Authorization</code> header:
              <pre className="mt-2 p-3 bg-white dark:bg-gray-800 rounded overflow-x-auto">
Authorization: Bearer your_api_key_here
              </pre>
            </div>
            <div>
              <strong>Example Request:</strong>
              <pre className="mt-2 p-3 bg-white dark:bg-gray-800 rounded overflow-x-auto text-xs">
{`curl -H "Authorization: Bearer your_api_key_here" \\
  https://yourdomain.com/api/articles`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  🔑 Create API Key
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  placeholder="My App API Key"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  A descriptive name to help you identify this key
                </p>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {['read', 'write', 'delete', 'admin'].map((perm) => (
                    <label key={perm} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-white capitalize font-medium">
                          {perm}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {perm === 'read' && 'View articles and content'}
                          {perm === 'write' && 'Create and update articles'}
                          {perm === 'delete' && 'Delete articles'}
                          {perm === 'admin' && 'Full access to all resources'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rate Limit */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Rate Limit (requests/hour)
                </label>
                <input
                  type="number"
                  value={newKeyData.rateLimit}
                  onChange={(e) => setNewKeyData({ ...newKeyData, rateLimit: parseInt(e.target.value) || 1000 })}
                  min="100"
                  max="10000"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Expires In (days)
                </label>
                <select
                  value={newKeyData.expiresInDays}
                  onChange={(e) => setNewKeyData({ ...newKeyData, expiresInDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="0">Never</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={createApiKey}
                  disabled={loading || !newKeyData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all"
                >
                  {loading ? '🔄 Creating...' : '🔑 Create API Key'}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
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
