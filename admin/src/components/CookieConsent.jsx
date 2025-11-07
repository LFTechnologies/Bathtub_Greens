'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString()
    }))
    setShow(false)

    // Trigger analytics and ads initialization
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cookie-consent-accepted'))
    }
  }

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString()
    }))
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">We value your privacy</h3>
            <p className="text-sm text-gray-300">
              We use cookies to enhance your browsing experience, serve personalized ads or content,
              and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
              {' '}
              <a href="/privacy" className="underline hover:text-white">
                Read our Privacy Policy
              </a>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Necessary Only
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to check consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState(null)

  useEffect(() => {
    const consentData = localStorage.getItem('cookie-consent')
    if (consentData) {
      try {
        setConsent(JSON.parse(consentData))
      } catch (e) {
        console.error('Failed to parse cookie consent:', e)
      }
    }

    // Listen for consent changes
    const handleConsent = () => {
      const newConsent = localStorage.getItem('cookie-consent')
      if (newConsent) {
        setConsent(JSON.parse(newConsent))
      }
    }

    window.addEventListener('cookie-consent-accepted', handleConsent)
    return () => window.removeEventListener('cookie-consent-accepted', handleConsent)
  }, [])

  return consent
}
