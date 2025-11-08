'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Step = 'configure' | 'scanning' | 'review' | 'generating' | 'complete'

export default function ContentGenerationPage() {
  const [currentStep, setCurrentStep] = useState<Step>('configure')
  const [loading, setLoading] = useState(false)
  const [scannedArticles, setScannedArticles] = useState<any[]>([])
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(new Set())
  const [topicClusters, setTopicClusters] = useState<any>(null)
  const [generatedArticles, setGeneratedArticles] = useState<any[]>([])
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' })
  const [error, setError] = useState<string | null>(null)

  const [config, setConfig] = useState({
    sourcesLimit: 50,
    aiProvider: 'openai',
    categories: '',
    requireKeywords: '',
    excludeKeywords: 'sports, celebrity',
    minContentLength: 200,
    maxAgeHours: 24,
  })

  // Step 1: Scan News Sources
  const handleScan = async () => {
    setLoading(true)
    setError(null)
    setCurrentStep('scanning')
    setProgress({ current: 0, total: 100, status: 'Scanning news sources...' })

    try {
      const payload = {
        limit: config.sourcesLimit,
        categories: config.categories ? config.categories.split(',').map(s => s.trim()) : null,
        fetchFullContent: false
      }

      const token = localStorage.getItem('token')
      const res = await fetch('/api/content-gen/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        setProgress({ current: 100, total: 100, status: 'Scan complete!' })

        // Filter articles based on keywords
        let articles = data.articles || []

        // Apply keyword filtering
        if (config.requireKeywords) {
          const keywords = config.requireKeywords.split(',').map(k => k.trim().toLowerCase())
          articles = articles.filter((article: any) => {
            const text = `${article.title} ${article.summary || ''} ${article.content || ''}`.toLowerCase()
            return keywords.some(keyword => text.includes(keyword))
          })
        }

        if (config.excludeKeywords) {
          const excludeWords = config.excludeKeywords.split(',').map(k => k.trim().toLowerCase())
          articles = articles.filter((article: any) => {
            const text = `${article.title} ${article.summary || ''} ${article.content || ''}`.toLowerCase()
            return !excludeWords.some(word => text.includes(word))
          })
        }

        setScannedArticles(articles)

        // Analyze topics
        const topics = analyzeTopic(articles, config.requireKeywords)
        setTopicClusters(topics)

        setCurrentStep('review')
      } else {
        setError(data.error || 'Scan failed')
        setCurrentStep('configure')
      }
    } catch (err: any) {
      setError(err.message)
      setCurrentStep('configure')
    } finally {
      setLoading(false)
    }
  }

  // Analyze topics and keywords
  const analyzeTopic = (articles: any[], userKeywords: string) => {
    const wordFrequency: Record<string, number> = {}
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being'])

    articles.forEach(article => {
      const text = `${article.title} ${article.summary || ''}`.toLowerCase()
      const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      })
    })

    // Get top keywords
    const topKeywords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count, articles: articles.filter(a =>
        `${a.title} ${a.summary || ''}`.toLowerCase().includes(word)
      ).length }))

    // User's keywords
    const userKeys = userKeywords ? userKeywords.split(',').map(k => k.trim().toLowerCase()) : []
    const userKeywordMatches = userKeys.map(keyword => ({
      word: keyword,
      count: articles.filter(a =>
        `${a.title} ${a.summary || ''}`.toLowerCase().includes(keyword)
      ).length,
      articles: articles.filter(a =>
        `${a.title} ${a.summary || ''}`.toLowerCase().includes(keyword)
      ).length
    })).filter(k => k.count > 0)

    return { topKeywords, userKeywordMatches }
  }

  // Step 2: Generate Content
  const handleGenerate = async () => {
    if (selectedArticles.size === 0) {
      setError('Please select at least one article to generate content from')
      return
    }

    setLoading(true)
    setError(null)
    setCurrentStep('generating')
    setGeneratedArticles([])

    const articlesToGenerate = Array.from(selectedArticles).map(idx => scannedArticles[idx])
    setProgress({ current: 0, total: articlesToGenerate.length, status: 'Starting generation...' })

    const results = []

    for (let i = 0; i < articlesToGenerate.length; i++) {
      const article = articlesToGenerate[i]

      try {
        setProgress({
          current: i,
          total: articlesToGenerate.length,
          status: `Generating article ${i + 1} of ${articlesToGenerate.length}: "${article.title.substring(0, 50)}..."`
        })

        const token = localStorage.getItem('token')
        const res = await fetch('/api/content-gen/generate-single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            article,
            aiProvider: config.aiProvider
          })
        })

        const data = await res.json()

        if (data.success) {
          results.push({
            original: article,
            generated: data.article,
            status: 'success'
          })
        } else {
          results.push({
            original: article,
            generated: null,
            status: 'failed',
            error: data.error
          })
        }

        setGeneratedArticles([...results])

      } catch (err: any) {
        results.push({
          original: article,
          generated: null,
          status: 'failed',
          error: err.message
        })
        setGeneratedArticles([...results])
      }
    }

    setProgress({
      current: articlesToGenerate.length,
      total: articlesToGenerate.length,
      status: 'Generation complete!'
    })
    setCurrentStep('complete')
    setLoading(false)
  }

  const toggleArticleSelection = (index: number) => {
    const newSelected = new Set(selectedArticles)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedArticles(newSelected)
  }

  const selectByKeyword = (keyword: string) => {
    const newSelected = new Set<number>()
    scannedArticles.forEach((article, idx) => {
      const text = `${article.title} ${article.summary || ''}`.toLowerCase()
      if (text.includes(keyword.toLowerCase())) {
        newSelected.add(idx)
      }
    })
    setSelectedArticles(newSelected)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">AI Content Generation</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { key: 'configure', label: 'Configure', icon: '⚙️' },
              { key: 'scanning', label: 'Scan', icon: '🔍' },
              { key: 'review', label: 'Review & Select', icon: '✅' },
              { key: 'generating', label: 'Generate', icon: '🤖' },
              { key: 'complete', label: 'Review Content', icon: '📝' }
            ].map((step, idx) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className={`flex items-center ${
                  currentStep === step.key ? 'text-blue-600' :
                  ['scanning', 'review', 'generating', 'complete'].indexOf(currentStep) >
                  ['scanning', 'review', 'generating', 'complete'].indexOf(step.key) ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.key ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' :
                    ['scanning', 'review', 'generating', 'complete'].indexOf(currentStep) >
                    ['scanning', 'review', 'generating', 'complete'].indexOf(step.key) ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-300'
                  }`}>
                    <span className="text-xl">{step.icon}</span>
                  </div>
                  <span className="ml-2 font-medium text-sm">{step.label}</span>
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    ['scanning', 'review', 'generating', 'complete'].indexOf(currentStep) > idx ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'configure' && (
          <ConfigureStep
            config={config}
            setConfig={setConfig}
            onScan={handleScan}
            loading={loading}
          />
        )}

        {currentStep === 'scanning' && (
          <ScanningStep progress={progress} />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            articles={scannedArticles}
            selectedArticles={selectedArticles}
            topicClusters={topicClusters}
            onToggle={toggleArticleSelection}
            onSelectByKeyword={selectByKeyword}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}

        {currentStep === 'generating' && (
          <GeneratingStep
            progress={progress}
            generatedArticles={generatedArticles}
          />
        )}

        {currentStep === 'complete' && (
          <CompleteStep
            generatedArticles={generatedArticles}
          />
        )}
      </div>
    </div>
  )
}

// Configure Step Component
function ConfigureStep({ config, setConfig, onScan, loading }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
      <h2 className="text-2xl font-bold mb-6">Configure Content Generation</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">News Sources Limit</label>
          <input
            type="number"
            value={config.sourcesLimit}
            onChange={(e) => setConfig({ ...config, sourcesLimit: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            min="10"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">AI Provider</label>
          <select
            value={config.aiProvider}
            onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="both">Both (Claude + OpenAI fallback)</option>
            <option value="claude">Claude (Anthropic) only</option>
            <option value="openai">ChatGPT (OpenAI) only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Source Categories (leave empty for all sources)
            <span className="block text-xs font-normal text-gray-500 mt-1">
              Filter news sources: general, technology, world
            </span>
          </label>
          <input
            type="text"
            value={config.categories}
            onChange={(e) => setConfig({ ...config, categories: e.target.value })}
            placeholder="Leave empty to scan all sources"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Topic Keywords (filters articles by content)
            <span className="block text-xs font-normal text-gray-500 mt-1">
              Enter topics to find: AI, trump, climate, etc.
            </span>
          </label>
          <input
            type="text"
            value={config.requireKeywords}
            onChange={(e) => setConfig({ ...config, requireKeywords: e.target.value })}
            placeholder="AI, technology, innovation"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Exclude Keywords</label>
          <input
            type="text"
            value={config.excludeKeywords}
            onChange={(e) => setConfig({ ...config, excludeKeywords: e.target.value })}
            placeholder="sports, celebrity, gossip"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      <button
        onClick={onScan}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Scanning...' : '🔍 Start Scanning News Sources'}
      </button>
    </div>
  )
}

// Scanning Step Component
function ScanningStep({ progress }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
      <div className="text-6xl mb-4 animate-pulse">🔍</div>
      <h2 className="text-2xl font-bold mb-4">{progress.status}</h2>
      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
            style={{ width: `${progress.current}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{progress.current}%</p>
      </div>
    </div>
  )
}

// Review Step Component
function ReviewStep({ articles, selectedArticles, topicClusters, onToggle, onSelectByKeyword, onGenerate, loading }: any) {
  return (
    <div className="space-y-6">
      {/* Topic Analysis */}
      {topicClusters.userKeywordMatches?.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="font-bold text-lg mb-4">📊 Your Keywords Found</h3>
          <div className="flex flex-wrap gap-2">
            {topicClusters.userKeywordMatches.map((topic: any) => (
              <button
                key={topic.word}
                onClick={() => onSelectByKeyword(topic.word)}
                className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
              >
                {topic.word} ({topic.articles} articles)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Top Topics */}
      {topicClusters.topKeywords?.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-6">
          <h3 className="font-bold text-lg mb-4">🔥 Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topicClusters.topKeywords.slice(0, 8).map((topic: any) => (
              <button
                key={topic.word}
                onClick={() => onSelectByKeyword(topic.word)}
                className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-4 py-2 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition"
              >
                {topic.word} ({topic.articles})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Found {articles.length} Articles - Select what to generate
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedArticles.size} selected
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {articles.map((article: any, idx: number) => (
            <div
              key={idx}
              onClick={() => onToggle(idx)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedArticles.has(idx)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedArticles.has(idx)}
                  onChange={() => onToggle(idx)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{article.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {article.summary || article.content?.substring(0, 150)}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onGenerate}
          disabled={loading || selectedArticles.size === 0}
          className="w-full mt-6 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? 'Generating...' : `🤖 Generate ${selectedArticles.size} Articles with AI`}
        </button>
      </div>
    </div>
  )
}

// Generating Step Component
function GeneratingStep({ progress, generatedArticles }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
        <div className="text-6xl mb-4 animate-pulse">🤖</div>
        <h2 className="text-2xl font-bold mb-4">{progress.status}</h2>
        <div className="max-w-md mx-auto">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-600 to-teal-600 h-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress.current} of {progress.total} completed
          </p>
        </div>
      </div>

      {/* Real-time results */}
      {generatedArticles.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-bold text-lg mb-4">✨ Generated Content (Live)</h3>
          <div className="space-y-4">
            {generatedArticles.map((item: any, idx: number) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                item.status === 'success'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {item.status === 'success' ? '✅' : '❌'}
                      </span>
                      <h4 className="font-semibold">
                        {item.generated?.title || item.original.title}
                      </h4>
                    </div>
                    {item.status === 'success' && item.generated && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {item.generated.summary}
                      </p>
                    )}
                    {item.status === 'failed' && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Error: {item.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Complete Step Component
function CompleteStep({ generatedArticles }: any) {
  const successCount = generatedArticles.filter((a: any) => a.status === 'success').length
  const failedCount = generatedArticles.filter((a: any) => a.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold mb-2">Content Generation Complete!</h2>
        <p className="text-lg opacity-90">
          {successCount} articles generated successfully • {failedCount} failed
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl">📝 Review Generated Content</h3>
          <Link
            href="/articles"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View All Articles →
          </Link>
        </div>

        <div className="space-y-4">
          {generatedArticles.filter((a: any) => a.status === 'success').map((item: any, idx: number) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold mb-2">{item.generated.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{item.generated.summary}</p>

                  {item.generated.tags && item.generated.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.generated.tags.map((tag: string) => (
                        <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="text-sm font-medium mb-2">AI Commentary:</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.generated.cleanedContent?.substring(0, 300)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Source: {item.original.source}</span>
                    <span>•</span>
                    <span>Status: Draft (Ready for Review)</span>
                    <span>•</span>
                    <span>Provider: {item.generated.provider || 'AI'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/articles/${item.generated._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Edit & Publish
                </Link>
                <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {failedCount > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              ⚠️ {failedCount} articles failed to generate
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              These may be due to API rate limits or content issues. You can try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
