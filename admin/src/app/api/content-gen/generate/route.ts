import { NextResponse } from 'next/server'

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = request.headers.get('Authorization')

    const response = await fetch(`${API_BASE}/api/content-gen/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Content generation failed' },
      { status: 500 }
    )
  }
}
