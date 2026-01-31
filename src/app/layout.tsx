import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers'
import { PWAInstallPrompt } from '@/components/pwa'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripflip.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'TripFlip - AI Trip Planner | Plan Your Dream Trip in Seconds',
    template: '%s | TripFlip',
  },
  description:
    'AI-powered travel planning that finds the best flights, hotels, and experiences. Plan your perfect trip in seconds with TripFlip. No more hours of research - just enter your destination and go.',
  keywords: [
    'AI trip planner',
    'travel planning app',
    'trip planner',
    'itinerary planner',
    'flight search',
    'hotel booking',
    'budget travel',
    'AI travel assistant',
    'vacation planner',
    'travel itinerary',
    'smart travel',
    'trip planning tool',
  ],
  authors: [{ name: 'TripFlip', url: baseUrl }],
  creator: 'TripFlip',
  publisher: 'TripFlip',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripFlip',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'TripFlip',
    title: 'TripFlip - AI Trip Planner | Plan Your Dream Trip in Seconds',
    description:
      'AI-powered travel planning that finds the best flights, hotels, and experiences. Plan your perfect trip in seconds with TripFlip.',
    images: [
      {
        url: '/landing.png',
        width: 1200,
        height: 630,
        alt: 'TripFlip - AI Trip Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripFlip - AI Trip Planner | Plan Your Dream Trip in Seconds',
    description:
      'AI-powered travel planning that finds the best flights, hotels, and experiences. Plan your perfect trip in seconds.',
    images: ['/landing.png'],
    creator: '@tripflipapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00bcd4' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/redketchup/favicon.ico" sizes="any" />
        <link rel="icon" href="/redketchup/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/redketchup/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/redketchup/apple-touch-icon.png" />
        <link rel="manifest" href="/redketchup/site.webmanifest" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  )
}
