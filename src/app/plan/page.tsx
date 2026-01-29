'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  MapPin,
  Loader2,
  Calendar,
  Users,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DestinationSearch, DestinationResult, QuickOptions, TripOptions } from '@/components/home'
import { Navbar } from '@/components/shared/navbar'
import { createClient } from '@/lib/supabase/client'
import { addWeeks, addDays, format, differenceInDays } from 'date-fns'
import { toast } from 'sonner'

interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  status: string
  travelers_count: number
  trip_destinations: {
    city: string
    country: string
  }[]
}

export default function PlanPage() {
  const router = useRouter()
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [options, setOptions] = useState<TripOptions>({
    startDate: addWeeks(new Date(), 2),
    endDate: addDays(addWeeks(new Date(), 2), 7),
    travelers: 1,
    budget: undefined,
    currency: 'USD',
    departureCity: undefined,
  })

  useEffect(() => {
    async function checkAuthAndFetchTrips() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        setLoadingTrips(false)
        return
      }

      setIsAuthenticated(true)

      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          title,
          start_date,
          end_date,
          status,
          travelers_count,
          trip_destinations (
            city,
            country
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching trips:', error)
      } else {
        setRecentTrips(data || [])
      }
      setLoadingTrips(false)
    }

    checkAuthAndFetchTrips()
  }, [])

  const handleDestinationSelect = (destination: DestinationResult) => {
    setSelectedDestination(destination)
  }

  const handleStartPlanning = async () => {
    if (!selectedDestination) {
      toast.error('Please select a destination first')
      return
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to create a trip')
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/trips/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            name: selectedDestination.fullName,
            coordinates: selectedDestination.coordinates,
          },
          departureCity: options.departureCity,
          startDate: options.startDate?.toISOString(),
          endDate: options.endDate?.toISOString(),
          travelers: options.travelers,
          budget: options.budget,
          currency: options.currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create trip')
      }

      router.push(`/planning/${data.tripId}`)
    } catch (error) {
      console.error('Error starting trip:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start planning')
    } finally {
      setIsLoading(false)
    }
  }

  const getTripDuration = (startDate: string, endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const getDestinationText = (destinations: { city: string; country: string }[]) => {
    if (!destinations || destinations.length === 0) return 'No destination'
    if (destinations.length === 1) return destinations[0].city
    return `${destinations[0].city} +${destinations.length - 1}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <Navbar />

      <div className="container py-8 md:py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to home
        </Link>

        {/* Trip Finder Section */}
        <section className="mx-auto max-w-2xl mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl text-gray-900">
              Where to next?
            </h1>
            <p className="mb-6 text-muted-foreground">
              Enter a destination and we'll plan everything for you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <DestinationSearch
              onSelect={handleDestinationSelect}
              placeholder="Search any destination..."
            />

            {selectedDestination && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 flex items-center justify-center gap-2 text-sm text-primary"
              >
                <MapPin className="h-4 w-4" />
                <span>{selectedDestination.fullName}</span>
              </motion.div>
            )}

            <div className="mt-4">
              <QuickOptions options={options} onChange={setOptions} />
            </div>

            <div className="mt-6 flex justify-center">
              <Button
                size="lg"
                onClick={handleStartPlanning}
                disabled={!selectedDestination || isLoading}
                className="h-12 px-8 rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Plan My Trip
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {!isAuthenticated && isAuthenticated !== null && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">Sign in</Link> to save your trips
              </p>
            )}
          </motion.div>
        </section>

        {/* Recent Trips Section - Only for authenticated users */}
        {isAuthenticated && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
              {recentTrips.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/trips" className="text-muted-foreground hover:text-foreground">
                    View all
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {loadingTrips ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-5">
                      <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                      <div className="h-4 w-1/2 bg-muted rounded mb-2" />
                      <div className="h-4 w-1/3 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentTrips.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven't created any trips yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use the search above to plan your first adventure!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/trip/${trip.id}`}>
                      <Card className="h-full hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group bg-white">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {trip.title}
                            </h3>
                            {trip.status === 'planning' && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Planning
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">
                                {getDestinationText(trip.trip_destinations)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span>
                                {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{trip.travelers_count} traveler{trip.travelers_count !== 1 ? 's' : ''}</span>
                              </div>
                              <span className="text-xs">
                                {getTripDuration(trip.start_date, trip.end_date)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
