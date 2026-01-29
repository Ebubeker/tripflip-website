'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mx-auto mb-6">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            It looks like you&apos;ve lost your internet connection. Some features may
            be unavailable until you reconnect.
          </p>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium mb-2 text-sm">While you&apos;re offline:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>View previously loaded trip details</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Access downloaded maps and itineraries</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Browse your saved places</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <p className="mt-8 text-sm text-muted-foreground">
        TripFlip - Your travel companion, online or offline
      </p>
    </div>
  )
}
