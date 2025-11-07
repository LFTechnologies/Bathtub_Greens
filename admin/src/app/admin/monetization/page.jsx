'use client'

import { useState, useEffect } from 'react'

export default function MonetizationDashboard() {
  const [stats, setStats] = useState(null)
  const [affiliateStats, setAffiliateStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load article stats
      const articlesRes = await fetch('/api/articles?status=published')
      const articlesData = await articlesRes.json()

      // Load affiliate stats
      const affiliateRes = await fetch('/api/affiliate/stats')
      const affiliateData = await affiliateRes.json()

      // Calculate totals
      const totalViews = articlesData.articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0
      const totalAdRevenue = articlesData.articles?.reduce((sum, a) => sum + (a.adRevenue || 0), 0) || 0
      const totalSponsored = articlesData.articles?.filter(a => a.isSponsored).length || 0
      const totalSponsoredRevenue = articlesData.articles
        ?.filter(a => a.isSponsored)
        .reduce((sum, a) => sum + (a.sponsoredAmount || 0), 0) || 0

      setStats({
        totalArticles: articlesData.articles?.length || 0,
        totalViews,
        totalAdRevenue,
        totalSponsored,
        totalSponsoredRevenue
      })

      if (affiliateData.success) {
        setAffiliateStats(affiliateData.stats)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to load monetization data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  const totalRevenue = (stats?.totalAdRevenue || 0) +
                       (stats?.totalSponsoredRevenue || 0) +
                       (affiliateStats?.totalRevenue || 0)

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Monetization Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">All sources combined</div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Ad Revenue</div>
          <div className="text-3xl font-bold text-blue-600">
            ${(stats?.totalAdRevenue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">Google AdSense</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Sponsored Content</div>
          <div className="text-3xl font-bold text-purple-600">
            ${(stats?.totalSponsoredRevenue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">{stats?.totalSponsored || 0} articles</div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Affiliate Revenue</div>
          <div className="text-3xl font-bold text-orange-600">
            ${(affiliateStats?.totalRevenue || 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {affiliateStats?.totalClicks || 0} clicks
          </div>
        </div>
      </div>

      {/* Traffic Stats */}
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Traffic Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600">Total Articles</div>
            <div className="text-2xl font-bold">{stats?.totalArticles || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Page Views</div>
            <div className="text-2xl font-bold">{(stats?.totalViews || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Views per Article</div>
            <div className="text-2xl font-bold">
              {stats?.totalArticles > 0
                ? Math.round(stats.totalViews / stats.totalArticles)
                : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Links Performance */}
      {affiliateStats && (
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Affiliate Links</h2>
          {affiliateStats.topLinks && affiliateStats.topLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Short Code</th>
                    <th className="text-right py-2">Clicks</th>
                    <th className="text-right py-2">Conversions</th>
                    <th className="text-right py-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateStats.topLinks.map((link, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2">{link.name}</td>
                      <td className="py-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {link.shortCode}
                        </code>
                      </td>
                      <td className="py-2 text-right">{link.clicks}</td>
                      <td className="py-2 text-right">{link.conversions}</td>
                      <td className="py-2 text-right">${link.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No affiliate links yet. Create some to start tracking!
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/articles/create"
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 text-center"
        >
          <div className="font-semibold">Create Sponsored Post</div>
          <div className="text-sm opacity-90 mt-1">Write a new sponsored article</div>
        </a>

        <a
          href="/admin/affiliate/create"
          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 text-center"
        >
          <div className="font-semibold">Add Affiliate Link</div>
          <div className="text-sm opacity-90 mt-1">Create new affiliate link</div>
        </a>

        <button
          onClick={loadData}
          className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 text-center"
        >
          <div className="font-semibold">Refresh Data</div>
          <div className="text-sm opacity-90 mt-1">Update all statistics</div>
        </button>
      </div>

      {/* Monetization Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold mb-2">Monetization Tips</h3>
        <ul className="space-y-1 text-sm">
          <li>• Place ads strategically: after first paragraph, mid-content, and at the end</li>
          <li>• Use affiliate links naturally within content (don't overdo it)</li>
          <li>• Mark sponsored content clearly to maintain trust</li>
          <li>• Focus on quality content to increase traffic and revenue</li>
          <li>• Experiment with ad placements to find what works best</li>
          <li>• Consider premium/paid content for highly valuable articles</li>
        </ul>
      </div>
    </div>
  )
}
