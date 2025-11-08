import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')

    const response = await fetch(`${API_BASE}/api/articles/${params.id}/download`, {
      headers: {
        'Authorization': token || '',
      },
    })

    const blob = await response.blob()

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="article-${params.id}.md"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
