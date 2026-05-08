import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edamamogy — daily word origins game',
  description: 'Combine Latin and Greek root beans to build words. A daily etymology puzzle game.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0e1a] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
