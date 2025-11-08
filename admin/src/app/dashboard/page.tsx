'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    published: 0,
    pending: 0,
    totalGenerated: 0,
    revenue: 0,
    views: 0
  })

  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check user role
    const role = localStorage.getItem('userRole')
    setUserRole(role)
    setIsAdmin(role === 'ADMIN')

    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load stats from API
      const [published, pending, contentGenStats] = await Promise.all([
        fetch('/api/articles?status=published').then(r => r.json()),
        fetch('/api/articles?status=pending_review').then(r => r.json()),
        fetch('/api/content-gen/stats').then(r => r.json())
      ])

      setStats({
        published: published.length || 0,
        pending: pending.length || 0,
        totalGenerated: contentGenStats.totalGenerated || 0,
        revenue: 0, // Will be calculated from monetization
        views: 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">Bathtub Greens</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-blue-600 font-medium">Dashboard</Link>
              <Link href="/articles" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Articles</Link>
              <Link href="/admin/drafts" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Drafts</Link>
              <Link href="/admin/content-gen" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">AI Content</Link>
              <Link href="/admin/api-keys" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">API Keys</Link>
              <Link href="/admin/monetization" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Revenue</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your AI-powered blog
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Published Articles"
            value={stats.published}
            change="+12%"
            icon="📄"
            positive={true}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            change="+3"
            icon="⏳"
            positive={false}
          />
          <StatCard
            title="Total Generated"
            value={stats.totalGenerated}
            change="+8%"
            icon="🤖"
            positive={true}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.revenue}`}
            change="+23%"
            icon="💰"
            positive={true}
          />
        </div>

        {/* AI Features Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Content Generation Card */}
          <Link href="/admin/content-gen" className="block">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">🤖</div>
                <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm">
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Content Generation</h3>
              <p className="text-white/80 mb-4">
                Automatically generate blog posts from news sources using Claude & ChatGPT
              </p>
              <div className="flex items-center text-sm">
                <span className="font-medium">Generate Now →</span>
              </div>
            </div>
          </Link>

          {/* Monetization Card */}
          <Link href="/admin/monetization" className="block">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">💰</div>
                <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm">
                  Earning
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Monetization</h3>
              <p className="text-white/80 mb-4">
                AdSense, affiliates, and sponsored content tracking
              </p>
              <div className="flex items-center text-sm">
                <span className="font-medium">View Revenue →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              icon="📝"
              title="My Drafts"
              description="View saved content"
              href="/admin/drafts"
            />
            <ActionButton
              icon="🔄"
              title="Generate Content"
              description="Let AI do the work"
              href="/admin/content-gen"
            />
            <ActionButton
              icon="🔑"
              title="API Keys"
              description="Manage access"
              href="/admin/api-keys"
            />
            <ActionButton
              icon="📊"
              title="View Analytics"
              description="Track performance"
              href="/admin/monetization"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="📰"
            title="News Scanning"
            description="Scans 10+ sources including BBC, NYT, Reuters"
            status="Active"
            statusColor="green"
          />
          <FeatureCard
            icon="⚡"
            title="Auto-Publishing"
            description="New content every 4 hours automatically"
            status="Running"
            statusColor="blue"
          />
          <FeatureCard
            icon="🎨"
            title="SEO Optimization"
            description="Built-in meta tags and structured data"
            status="Enabled"
            statusColor="green"
          />
          <FeatureCard
            icon="🔗"
            title="Affiliate Links"
            description="Track clicks and conversions"
            status="Active"
            statusColor="green"
          />
          <FeatureCard
            icon="📈"
            title="Analytics"
            description="Real-time traffic and revenue tracking"
            status="Active"
            statusColor="green"
          />
          <FeatureCard
            icon="🔒"
            title="GDPR Compliant"
            description="Cookie consent and privacy controls"
            status="Enabled"
            statusColor="green"
          />
        </div>

        {/* Admin Only Section */}
        {isAdmin && (
          <>
            <div className="mt-12 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    🛡️ Admin Controls
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    System administration and monitoring
                  </p>
                </div>
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                  Admin Only
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* User Management Card */}
              <Link href="/admin/users" className="block">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 text-white card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">👥</div>
                    <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm">
                      Admin
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">User Management</h3>
                  <p className="text-white/80 mb-4">
                    Manage user accounts, roles, and permissions
                  </p>
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Manage Users →</span>
                  </div>
                </div>
              </Link>

              {/* Token Usage Card */}
              <Link href="/admin/token-usage" className="block">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📊</div>
                    <span className="bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full text-sm">
                      Monitoring
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">AI Token Usage</h3>
                  <p className="text-white/80 mb-4">
                    Monitor API costs and consumption per user
                  </p>
                  <div className="flex items-center text-sm">
                    <span className="font-medium">View Usage →</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 p-6">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-3">
                🔐 Administrator Privileges
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">👥 User Control</div>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>✓ Create/edit/delete users</li>
                    <li>✓ Assign roles & permissions</li>
                    <li>✓ Activate/deactivate accounts</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">📊 Monitoring</div>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>✓ View all token usage</li>
                    <li>✓ Track costs per user</li>
                    <li>✓ Monitor API consumption</li>
                  </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ System Access</div>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>✓ Full content access</li>
                    <li>✓ API key management</li>
                    <li>✓ System configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, change, icon, positive }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-gray-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}

function ActionButton({ icon, title, description, href }: any) {
  return (
    <Link href={href} className="block">
      <div className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all card-hover">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-semibold mb-1">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </Link>
  )
}

function FeatureCard({ icon, title, description, status, statusColor }: any) {
  const colorClasses: any = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]}`}>
          {status}
        </span>
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
