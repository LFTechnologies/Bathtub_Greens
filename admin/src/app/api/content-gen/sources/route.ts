import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')

    const response = await fetch(`${API_BASE}/api/content-gen/sources`, {
      headers: {
        'Authorization': token || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
