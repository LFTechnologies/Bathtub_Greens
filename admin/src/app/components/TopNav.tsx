'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

type Item = { href: string; label: string }

const ITEMS: Item[] = [
  { href: '/',          label: 'Dashboard' },
  { href: '/ingest',    label: 'Ingest' },
  { href: '/articles',  label: 'Articles' },
  { href: '/users',     label: 'Users' },
  { href: '/feed',      label: 'Feed' },
  { href: '/admin/articles/create', label: 'Create' }, // new
]

export default function TopNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))
  const items = useMemo(() => ITEMS, [])

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-bg-soft/80 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight hover:opacity-90">
            Node News · Admin
          </Link>
          <nav className="flex gap-1 text-sm">
            {items.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'px-3 py-2 rounded-lg transition',
                  isActive(href)
                    ? 'bg-white/10 text-white'
                    : 'hover:bg-white/5 text-white/80'
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
