import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function GET(request: Request) {
  try {
    // Fetch published articles that are marked for public showcase
    const response = await fetch(`${API_BASE}/api/showcase/articles`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
