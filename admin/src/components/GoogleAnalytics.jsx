'use client'

import Script from 'next/script'
import { useCookieConsent } from './CookieConsent'

export default function GoogleAnalytics({ measurementId }) {
  const consent = useCookieConsent()

  // Only load if consent is given
  if (!consent?.analytics || !measurementId) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

// Event tracking helper
export function trackEvent(eventName, eventParams = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams)
  }
}

// Page view tracking
export function trackPageView(url) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}
