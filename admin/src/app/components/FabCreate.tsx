'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Floating "Create" action button
 * - Visible on /admin/* except /admin/articles/create
 * - Keyboard shortcut: "c"
 */
export default function FabCreate() {
  const pathname = usePathname()
  const router = useRouter()

  // Only show on admin routes, except the create page itself
  const isAdmin = pathname?.startsWith('/admin')
  const isCreate = pathname === '/admin/articles/create'

  // Keyboard shortcut: "c" to open create page
  // Must be called before early return to comply with Rules of Hooks
  useEffect(() => {
    // Only set up event listener if we're showing the FAB
    if (!isAdmin || isCreate) return

    const onKey = (e: KeyboardEvent) => {
      // ignore when user is typing in an input/textarea/select/contenteditable
      const t = e.target as HTMLElement | null
      const isTyping =
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          (t as any).isContentEditable ||
          t.tagName === 'SELECT')
      if (isTyping) return
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        router.push('/admin/articles/create')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router, isAdmin, isCreate])

  if (!isAdmin || isCreate) return null

  return (
    <Link
      href="/admin/articles/create"
      aria-label="Create new article (C)"
      title="Create new article (C)"
      className={[
        'fixed z-40',
        // bottom-right, with safe-area support
        'right-4 bottom-4 md:right-6 md:bottom-6',
        'mr-[env(safe-area-inset-right)] mb-[env(safe-area-inset-bottom)]',
        // button style
        'inline-flex h-12 w-12 items-center justify-center rounded-full',
        'bg-white text-black shadow-lg shadow-black/40',
        'transition hover:scale-[1.03] active:scale-[0.98] focus:outline-none',
        'ring-1 ring-black/10',
      ].join(' ')}
    >
      {/* Plus icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M11 5a1 1 0 112 0v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5z" />
      </svg>
    </Link>
  )
}
