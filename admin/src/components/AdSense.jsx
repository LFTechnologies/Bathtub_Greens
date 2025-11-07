'use client'

import { useEffect } from 'react'

/**
 * Google AdSense Component
 *
 * Usage:
 * <AdSense
 *   adClient="ca-pub-XXXXXXXXXXXXXXXX"
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   fullWidthResponsive={true}
 * />
 */
export default function AdSense({
  adClient,
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}) {
  useEffect(() => {
    try {
      // Push ad to AdSense
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (err) {
      console.error('AdSense error:', err)
    }
  }, [])

  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ADS_DEV) {
    return (
      <div className={`border-2 border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 ${className}`}>
        Ad Placeholder (Development Mode)
        <br />
        <span className="text-xs">Slot: {adSlot}</span>
      </div>
    )
  }

  if (!adClient || !adSlot) {
    console.warn('AdSense: Missing adClient or adSlot')
    return null
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  )
}

/**
 * Predefined Ad Formats
 */

// Banner Ad (Top of page, sidebar)
export function AdBanner(props) {
  return (
    <AdSense
      {...props}
      adFormat="horizontal"
      style={{ display: 'block', textAlign: 'center' }}
    />
  )
}

// Article Ad (In-content)
export function AdInArticle(props) {
  return (
    <AdSense
      {...props}
      adFormat="fluid"
      style={{ display: 'block', textAlign: 'center' }}
      className="my-8"
    />
  )
}

// Sidebar Ad
export function AdSidebar(props) {
  return (
    <AdSense
      {...props}
      adFormat="vertical"
      style={{ display: 'block' }}
    />
  )
}

// Responsive Display Ad
export function AdDisplay(props) {
  return (
    <AdSense
      {...props}
      adFormat="auto"
      fullWidthResponsive={true}
      style={{ display: 'block' }}
    />
  )
}

// Multiplex Ad (Related Content)
export function AdMultiplex(props) {
  return (
    <AdSense
      {...props}
      adFormat="autorelaxed"
      style={{ display: 'block' }}
    />
  )
}
