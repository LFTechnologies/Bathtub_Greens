'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IngestRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/ingest')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Redirecting to admin ingest...</p>
      </div>
    </div>
  )
}
