import './globals.css'
import TopNav from '@/app/components/TopNav'
import FabCreate from '../app/components/FabCreate'

export const metadata = { title: 'Admin · Node News' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">
        <TopNav />
        <main className="mx-auto max-w-7xl p-6">
          {children}
        </main>

        {/* Floating + button */}
        <FabCreate />
      </body>
    </html>
  )
}
