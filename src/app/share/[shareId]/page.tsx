import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Plane,
  Building2,
  Clock,
  ArrowLeft,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Shared Trip',
  description: 'View shared trip details',
}

// Mock shared trip data - in a real app, this would be fetched from the database
const mockSharedTrip = {
  id: 'trip-123',
  name: 'European Adventure 2024',
  description: 'A two-week journey through the most beautiful cities in Europe',
  start_date: '2024-06-15',
  end_date: '2024-06-29',
  status: 'planned',
  budget: 5000,
  currency: 'USD',
  cover_image_url: null,
  destinations: [
    {
      id: '1',
      name: 'Paris',
      country: 'France',
      arrival_date: '2024-06-15',
      departure_date: '2024-06-19',
      order_index: 1,
    },
    {
      id: '2',
      name: 'Barcelona',
      country: 'Spain',
      arrival_date: '2024-06-19',
      departure_date: '2024-06-23',
      order_index: 2,
    },
    {
      id: '3',
      name: 'Rome',
      country: 'Italy',
      arrival_date: '2024-06-23',
      departure_date: '2024-06-29',
      order_index: 3,
    },
  ],
  flights: [
    {
      id: '1',
      airline: 'Air France',
      flight_number: 'AF1234',
      departure_airport: 'JFK',
      arrival_airport: 'CDG',
      departure_time: '2024-06-15T18:00:00',
      arrival_time: '2024-06-16T07:30:00',
    },
    {
      id: '2',
      airline: 'Vueling',
      flight_number: 'VY8012',
      departure_airport: 'CDG',
      arrival_airport: 'BCN',
      departure_time: '2024-06-19T10:00:00',
      arrival_time: '2024-06-19T12:00:00',
    },
  ],
  accommodations: [
    {
      id: '1',
      name: 'Hotel Le Marais',
      address: '123 Rue de Rivoli, Paris',
      check_in_date: '2024-06-16',
      check_out_date: '2024-06-19',
    },
    {
      id: '2',
      name: 'Barcelona Beach Hotel',
      address: 'Passeig de Colom, Barcelona',
      check_in_date: '2024-06-19',
      check_out_date: '2024-06-23',
    },
  ],
  owner: {
    display_name: 'John Traveler',
  },
}

interface SharedTripPageProps {
  params: Promise<{
    shareId: string
  }>
}

export default async function SharedTripPage({ params }: SharedTripPageProps) {
  const { shareId } = await params

  // In a real app, we would fetch the shared trip from the database
  // const trip = await getSharedTrip(shareId)
  const trip = mockSharedTrip

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Trip Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This trip may have been deleted or the link is invalid.
            </p>
            <Link href="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to TripFlip</span>
          </Link>
          <Badge variant="secondary">Shared Trip</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Suspense fallback={<TripSkeleton />}>
          {/* Trip Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
            {trip.description && (
              <p className="text-lg text-muted-foreground mb-4">
                {trip.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.start_date), 'MMM d')} -{' '}
                {format(new Date(trip.end_date), 'MMM d, yyyy')}
              </span>
              {trip.budget && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {trip.currency} {trip.budget.toLocaleString()} budget
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Shared by {trip.owner.display_name}
              </span>
            </div>
          </div>

          {/* Destinations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {trip.destinations.map((dest, index) => (
                  <div key={dest.id} className="flex gap-4 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      {index < trip.destinations.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="font-medium">
                        {dest.name}, {dest.country}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(dest.arrival_date), 'MMM d')} -{' '}
                        {format(new Date(dest.departure_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Flights */}
          {trip.flights.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Flights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trip.flights.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-shrink-0 text-center">
                        <p className="text-2xl font-bold">
                          {flight.departure_airport}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(flight.departure_time), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="h-px w-8 bg-border" />
                          <Plane className="h-4 w-4 text-muted-foreground" />
                          <div className="h-px w-8 bg-border" />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        <p className="text-2xl font-bold">
                          {flight.arrival_airport}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(flight.arrival_time), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-medium">{flight.airline}</p>
                        <p className="text-sm text-muted-foreground">
                          {flight.flight_number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accommodations */}
          {trip.accommodations.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Accommodations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trip.accommodations.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{acc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {acc.address}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(acc.check_in_date), 'MMM d')} -{' '}
                          {format(new Date(acc.check_out_date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-2">
                Planning your own trip?
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your own travel plans with TripFlip
              </p>
              <Link href="/register">
                <Button size="lg">Get Started Free</Button>
              </Link>
            </CardContent>
          </Card>
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 text-center text-sm text-muted-foreground">
        <p>
          Powered by{' '}
          <Link href="/" className="font-medium text-primary hover:underline">
            TripFlip
          </Link>
        </p>
      </footer>
    </div>
  )
}

function TripSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-6 w-full max-w-lg mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
