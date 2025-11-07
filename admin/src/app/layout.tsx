import './globals.css'
import Script from 'next/script'
import CookieConsent from '@/components/CookieConsent'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata = {
  title: 'Bathtub Greens - AI-Powered News Blog',
  description: 'Automated content generation with Claude & ChatGPT. Multi-source news scanning, monetization, and analytics.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className="dark">
      <head>
        {/* Google AdSense */}
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="antialiased">
        {children}

        {/* Cookie Consent */}
        <CookieConsent />

        {/* Google Analytics */}
        {gaId && <GoogleAnalytics measurementId={gaId} />}
      </body>
    </html>
  )
}
