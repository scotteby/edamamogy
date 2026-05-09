import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Edamamogy — daily word origins game',
  description: 'Combine Latin and Greek root beans to build words. A daily etymology puzzle game.',
  openGraph: {
    title: 'Edamamogy — daily word origins game',
    description: 'Combine Latin and Greek root beans to build words. A daily etymology puzzle game.',
    url: 'https://edamamogy.vercel.app',
    siteName: 'Edamamogy',
    images: [{ url: 'https://edamamogy.vercel.app/opengraph-image.png', width: 1200, height: 630 }],
    type: 'website',
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
