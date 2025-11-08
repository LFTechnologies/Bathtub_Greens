// Proxy-only version - forwards all requests to backend API
import { NextResponse } from 'next/server'

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')

    const response = await fetch(`${API_BASE}/api/articles/stats`, {
      headers: {
        'Authorization': token || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('GET /api/articles/stats error:', error)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}
