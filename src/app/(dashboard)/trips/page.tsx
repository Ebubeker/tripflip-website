import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Map, Calendar, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { DeleteTripButton } from '@/components/trips/delete-trip-button'

export const metadata: Metadata = {
  title: 'My Trips',
  description: 'View and manage all your travel trips',
}

interface Trip {
  id: string
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: string
  trip_destinations: {
    id: string
    city: string
    country: string
    order_index: number
  }[]
}

export default async function TripsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_destinations (
        id,
        city,
        country,
        order_index
      )
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching trips:', error)
  }

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate) return 'Dates not set'
    const start = parseISO(startDate)
    const end = endDate ? parseISO(endDate) : null
    if (end) {
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
    return format(start, 'MMM d, yyyy')
  }

  const getDestinationSummary = (destinations: Trip['trip_destinations']) => {
    if (!destinations || destinations.length === 0) return 'No destinations'
    const sorted = destinations.sort((a, b) => a.order_index - b.order_index)
    if (sorted.length === 1) {
      return `${sorted[0].city}, ${sorted[0].country}`
    }
    return `${sorted[0].city} → ${sorted[sorted.length - 1].city}`
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground">
            {trips?.length || 0} {trips?.length === 1 ? 'trip' : 'trips'}
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </div>

      {!trips || trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Start planning your first adventure. Just enter a destination and we'll do the rest.
          </p>
          <Button asChild>
            <Link href="/">
              <Plus className="mr-2 h-4 w-4" />
              Plan Your First Trip
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip: Trip) => (
            <Link key={trip.id} href={`/trip/${trip.id}`}>
              <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer border-2 border-transparent">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{trip.title}</h3>
                      {trip.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {trip.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{getDestinationSummary(trip.trip_destinations)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        trip.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        trip.status === 'planning' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        trip.status === 'completed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {trip.status === 'planning' ? 'Planning' :
                         trip.status === 'active' ? 'Active' :
                         trip.status === 'completed' ? 'Completed' : trip.status}
                      </div>
                      <DeleteTripButton tripId={trip.id} tripTitle={trip.title} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
