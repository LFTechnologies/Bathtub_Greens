// Example article page with full monetization features
// Copy this pattern to your actual article pages

'use client'

import { useState, useEffect } from 'react'
import { AdBanner, AdInArticle, AdSidebar, AdMultiplex } from '@/components/AdSense'
import { ArticleSEO, ArticleStructuredData } from '@/components/SEO'
import { trackEvent } from '@/components/GoogleAnalytics'

export default function ArticlePageWithMonetization({ params }) {
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    loadArticle()
    trackPageView()
  }, [params.id])

  const loadArticle = async () => {
    try {
      const res = await fetch(`/api/articles/${params.id}`)
      const data = await res.json()
      setArticle(data)

      // Track article view
      trackEvent('article_view', {
        article_id: data._id,
        article_title: data.title,
        is_sponsored: data.isSponsored
      })

      // Increment view count
      await fetch(`/api/articles/${params.id}/view`, { method: 'POST' })

      // Load related articles
      loadRelatedArticles(data.tags)
    } catch (error) {
      console.error('Failed to load article:', error)
    }
  }

  const loadRelatedArticles = async (tags) => {
    // Implementation here
  }

  const trackPageView = () => {
    trackEvent('page_view', {
      page_type: 'article',
      article_id: params.id
    })
  }

  const handleAffiliateClick = (linkCode, linkName) => {
    trackEvent('affiliate_click', {
      link_code: linkCode,
      link_name: linkName,
      article_id: article._id
    })
  }

  const handleShare = (platform) => {
    trackEvent('share', {
      platform,
      article_id: article._id,
      article_title: article.title
    })

    // Increment share count
    fetch(`/api/articles/${article._id}/share`, { method: 'POST' })
  }

  if (!article) return <div className="p-6">Loading...</div>

  return (
    <>
      {/* SEO Meta Tags */}
      <ArticleSEO article={article} />
      <ArticleStructuredData
        article={article}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 max-w-3xl">
            {/* Header Banner Ad */}
            {adClient && !article.isSponsored && (
              <div className="mb-6">
                <AdBanner adClient={adClient} adSlot="1234567890" />
              </div>
            )}

            {/* Sponsored Content Disclosure */}
            {article.isSponsored && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Sponsored Content</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {article.disclosureText || `This article is sponsored by ${article.sponsorName}. All opinions and analysis are our own.`}
                    </p>
                    {article.sponsorLogoUrl && (
                      <img
                        src={article.sponsorLogoUrl}
                        alt={article.sponsorName}
                        className="h-8 mt-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Article Header */}
            <header className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                {article.sourceAuthor && (
                  <span>By {article.sourceAuthor}</span>
                )}
                {article.publishedAt && (
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </time>
                )}
                <span>{article.views || 0} views</span>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Featured Image */}
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-auto rounded-lg mb-6"
              />
            )}

            {/* Summary */}
            {article.summary && (
              <div className="bg-gray-50 border-l-4 border-gray-300 p-4 mb-6">
                <p className="text-gray-700 font-medium">{article.summary}</p>
              </div>
            )}

            {/* Article Content - First Part */}
            <div className="prose prose-lg max-w-none mb-6">
              {article.cleanedContent?.split('\n\n')[0]}
              {article.cleanedContent?.split('\n\n')[1]}
            </div>

            {/* In-Article Ad (After 2 paragraphs) */}
            {adClient && !article.isSponsored && (
              <div className="my-8">
                <AdInArticle adClient={adClient} adSlot="0987654321" />
              </div>
            )}

            {/* Article Content - Rest */}
            <div className="prose prose-lg max-w-none">
              {article.cleanedContent?.split('\n\n').slice(2).join('\n\n')}
            </div>

            {/* Affiliate Links Section */}
            {article.affiliateLinks && article.affiliateLinks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
                <h3 className="font-semibold mb-3">Recommended Resources</h3>
                <p className="text-sm text-gray-600 mb-4">
                  We may earn a commission from these links at no cost to you.
                </p>
                <div className="space-y-3">
                  {article.affiliateLinks.map((link) => (
                    <a
                      key={link._id}
                      href={`/api/affiliate/redirect/${link.shortCode}`}
                      onClick={() => handleAffiliateClick(link.shortCode, link.name)}
                      className="block bg-white p-4 rounded border hover:border-blue-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{link.name}</div>
                          {link.description && (
                            <div className="text-sm text-gray-600">
                              {link.description}
                            </div>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-b py-6 my-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Share:</span>
                <button
                  onClick={() => handleShare('twitter')}
                  className="text-blue-400 hover:text-blue-600"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="text-blue-700 hover:text-blue-900"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Facebook
                </button>
              </div>
            </div>

            {/* Related Articles with Multiplex Ad */}
            {adClient && relatedArticles.length > 0 && (
              <div className="my-8">
                <h3 className="text-2xl font-bold mb-4">Related Articles</h3>
                <AdMultiplex adClient={adClient} adSlot="1122334455" />
              </div>
            )}

            {/* Bottom Ad */}
            {adClient && !article.isSponsored && (
              <div className="mt-8">
                <AdBanner adClient={adClient} adSlot="6677889900" />
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            {/* Sidebar Ad */}
            {adClient && (
              <div className="sticky top-4 mb-6">
                <AdSidebar adClient={adClient} adSlot="5544332211" />
              </div>
            )}

            {/* Newsletter Signup */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-2">Get Daily Updates</h3>
              <p className="text-sm mb-4 opacity-90">
                Join 10,000+ readers who get fresh content delivered daily.
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 rounded text-gray-900"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-white text-blue-600 font-medium py-2 rounded hover:bg-gray-100"
                >
                  Subscribe Free
                </button>
              </form>
              <p className="text-xs mt-3 opacity-75">
                No spam. Unsubscribe anytime.
              </p>
            </div>

            {/* Popular Articles */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-bold mb-4">Popular Articles</h3>
              {/* List popular articles */}
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
