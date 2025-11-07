// src/app/components/Collapsible.js
'use client'
import { useState, useId } from 'react'

export default function Collapsible({
  title,
  count,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2 text-left">
          <Chevron open={open} />
          <span className="font-medium">{title}</span>
          {typeof count === 'number' && (
            <span className="ml-2 rounded-full bg-gray-100 dark:bg-gray-900 px-2 py-0.5 text-xs">
              {count}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        className={`transition-[grid-template-rows] duration-200 ease-out grid ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
        </div>
      </div>
    </section>
  )
}

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}
