import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Favicon } from '@/components/favicon'
import { ErrorBoundary } from '@/components/error-boundary'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant'
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Niffer Cosmetics | Luxury Beauty in Dar es Salaam',
  description: 'Discover premium skincare, fragrances, and makeup at Niffer Cosmetics. Luxury beauty products delivered to your door in Dar es Salaam, Tanzania.',
  keywords: ['cosmetics', 'skincare', 'fragrance', 'makeup', 'Dar es Salaam', 'Tanzania', 'beauty', 'luxury'],
  generator: 'v0.app',
  icons: {
    icon: '/Niffer logo.jpeg',
    shortcut: '/Niffer logo.jpeg',
    apple: '/Niffer logo.jpeg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/Niffer logo.jpeg',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#d4a5a5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <Favicon />
      </head>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ErrorBoundary>
      </body>
    </html>
  )
}
