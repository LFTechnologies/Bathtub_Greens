import Head from 'next/head'

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags = [],
  noindex = false
}) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'News Blog'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'
  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@yourblog'

  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const defaultImage = `${siteUrl}/og-image.jpg`

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title || siteName} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Article-specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && tags.length > 0 && tags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title || siteName} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image || defaultImage} />
      <meta name="twitter:site" content={twitterHandle} />
      {author && <meta name="twitter:creator" content={author} />}

      {/* Additional */}
      <link rel="canonical" href={fullUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
    </Head>
  )
}

// Article-specific SEO component
export function ArticleSEO({ article }) {
  return (
    <SEO
      title={article.metaTitle || article.title}
      description={article.metaDescription || article.summary}
      image={article.imageUrl}
      url={`/articles/${article.slug || article._id}`}
      type="article"
      author={article.sourceAuthor}
      publishedTime={article.publishedAt}
      modifiedTime={article.updatedAt}
      tags={article.tags}
    />
  )
}

// JSON-LD structured data for articles
export function ArticleStructuredData({ article, siteUrl }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl ? [article.imageUrl] : [],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.sourceAuthor || 'Unknown'
    },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_SITE_NAME || 'News Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${article.slug || article._id}`
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
