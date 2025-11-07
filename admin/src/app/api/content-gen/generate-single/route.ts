import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = request.headers.get('Authorization')

    // Call backend to generate single article
    const response = await fetch(`${API_BASE}/api/content-gen/generate-single`, {
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
    console.error('Single article generation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
