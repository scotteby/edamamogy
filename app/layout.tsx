import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edamamogy — daily word origins game',
  description: 'Combine Latin and Greek root beans to build words. A daily etymology puzzle game.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
