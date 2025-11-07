// src/app/feed/page.tsx
import UserArticleFeed from '@/app/components/UserArticleFeed'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default function Page() {
  // Pass status=published to your API
  return <UserArticleFeed fetchUrl="/api/articles?status=published" pageSize={12} />
}
