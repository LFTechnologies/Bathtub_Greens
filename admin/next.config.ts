/** @type {import('next').NextConfig} */
const API_URL = process.env.API_URL || 'http://localhost:4000'

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'abs.twimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'twitter.com',  pathname: '/**' },
      { protocol: 'https', hostname: 'x.com',        pathname: '/**' },
      // (optional) if you ever host your own images:
      // { protocol: 'http', hostname: '192.168.12.45', pathname: '/**' },
      // { protocol: 'http', hostname: 'localhost',      pathname: '/**' },
    ],
  },

  // NOTE: This is a custom field, not used by Next internals (kept if you read it elsewhere).
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.12.45'],

// async rewrites() {
 //   return [
 //     {
  //      source: '/api/:path*',
  //      destination: `${API_URL}/api/:path*`,
  //    },
  //  ]
 // },
}

module.exports = nextConfig
