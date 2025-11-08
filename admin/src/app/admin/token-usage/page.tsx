'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type TokenStats = {
  totalTokens: number
  totalCost: number
  thisMonth: {
    tokens: number
    cost: number
    requests: number
  }
  lastMonth: {
    tokens: number
    cost: number
    requests: number
  }
  byProvider: {
    openai: {
      tokens: number
      cost: number
      requests: number
    }
    anthropic: {
      tokens: number
      cost: number
      requests: number
    }
  }
  byUser: Array<{
    userId: string
    displayName: string
    email: string
    tokens: number
    cost: number
    requests: number
  }>
  recentRequests: Array<{
    _id: string
    timestamp: string
    provider: 'openai' | 'anthropic'
    model: string
    tokens: number
    cost: number
    user: {
      displayName: string
      email: string
    }
    operation: string
  }>
}

export default function TokenUsagePage() {
  const router = useRouter()
  const [stats, setStats] = useState<TokenStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('thisMonth')

  useEffect(() => {
    checkAdminAccess()
    loadStats()
  }, [dateRange])

  const checkAdminAccess = () => {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }

  const loadStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/token-usage?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      } else {
        throw new Error(data.error || 'Failed to load stats')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return num.toLocaleString()
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading token usage...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                📊 AI Token Usage
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor AI API costs and consumption
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="all">All Time</option>
              </select>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                👥 Users
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

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              {formatNumber(stats.totalTokens)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All time usage
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {formatCost(stats.totalCost)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              All time spend
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {formatNumber(stats.thisMonth.tokens)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCost(stats.thisMonth.cost)} • {stats.thisMonth.requests} requests
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Month</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {formatNumber(stats.lastMonth.tokens)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatCost(stats.lastMonth.cost)} • {stats.lastMonth.requests} requests
            </div>
          </div>
        </div>

        {/* Provider Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* OpenAI */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                🤖 OpenAI (ChatGPT)
              </h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Tokens Used</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(stats.byProvider.openai.tokens)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.byProvider.openai.tokens / stats.totalTokens) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCost(stats.byProvider.openai.cost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Requests</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.byProvider.openai.requests.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {((stats.byProvider.openai.tokens / stats.totalTokens) * 100).toFixed(1)}% of total usage
              </div>
            </div>
          </div>

          {/* Anthropic */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                🧠 Anthropic (Claude)
              </h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Tokens Used</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(stats.byProvider.anthropic.tokens)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${(stats.byProvider.anthropic.tokens / stats.totalTokens) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cost</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCost(stats.byProvider.anthropic.cost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Requests</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {stats.byProvider.anthropic.requests.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {((stats.byProvider.anthropic.tokens / stats.totalTokens) * 100).toFixed(1)}% of total usage
              </div>
            </div>
          </div>
        </div>

        {/* Usage by User */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              👥 Usage by User
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Token consumption per user
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.byUser.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {formatNumber(user.tokens)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCost(user.cost)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {user.requests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(user.tokens / stats.totalTokens) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {((user.tokens / stats.totalTokens) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🕐 Recent Requests
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest AI API calls
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.recentRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(req.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {req.user.displayName}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {req.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        req.provider === 'openai'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                      }`}>
                        {req.provider === 'openai' ? 'ChatGPT' : 'Claude'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {req.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {req.operation}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {req.tokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCost(req.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
