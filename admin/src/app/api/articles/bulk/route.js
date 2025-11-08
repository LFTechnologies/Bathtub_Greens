// src/app/api/articles/bulk/route.js
// Proxy-only version - forwards all requests to backend API
import { NextResponse } from 'next/server'

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'

async function proxyRequest(method, req) {
  try {
    const token = req.headers.get('Authorization')
    const body = method !== 'GET' ? await req.text() : undefined

    const response = await fetch(`${API_BASE}/api/articles/bulk`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
      body,
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`${method} /api/articles/bulk error:`, error)
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}

export async function PATCH(req) {
  return proxyRequest('PATCH', req)
}

export async function DELETE(req) {
  return proxyRequest('DELETE', req)
}
