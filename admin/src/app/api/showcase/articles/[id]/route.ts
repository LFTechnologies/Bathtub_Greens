import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE}/api/showcase/articles/${params.id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
