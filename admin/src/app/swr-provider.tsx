'use client'
import { SWRConfig } from 'swr'

export default function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) => fetch(url, { credentials: 'include' }).then(r => {
          if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
          return r.json()
        }),
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
