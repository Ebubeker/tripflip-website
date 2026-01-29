'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plane, Plus, List, Search as SearchIcon, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlightSearchForm, FlightResults } from '@/components/flights'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { FlightOffer } from '@/lib/amadeus'
import type { Flight } from '@/types/database'

export default function FlightsPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<FlightOffer[]>([])
  const [dictionaries, setDictionaries] = useState<{
    carriers?: Record<string, string>
    aircraft?: Record<string, string>
  }>()
  const [hasSearched, setHasSearched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState<string>()
  const [savedFlights, setSavedFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch saved flights
  useEffect(() => {
    async function fetchFlights() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('flights')
          .select('*')
          .eq('trip_id', tripId)
          .neq('booking_status', 'suggested')
          .order('departure_datetime', { ascending: true })

        if (error) throw error
        setSavedFlights(data || [])
      } catch (error) {
        console.error('Error fetching flights:', error)
        toast.error('Failed to load flights')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlights()
  }, [tripId, supabase])

  const handleSearch = async (data: {
    origin: string
    destination: string
    departureDate: Date
    returnDate?: Date
    adults: number
    travelClass: string
    nonStop: boolean
  }) => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const searchParams = new URLSearchParams({
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate.toISOString().split('T')[0],
        adults: data.adults.toString(),
        travelClass: data.travelClass,
        nonStop: data.nonStop.toString(),
      })

      if (data.returnDate) {
        searchParams.set('returnDate', data.returnDate.toISOString().split('T')[0])
      }

      const response = await fetch(`/api/flights/search?${searchParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Search failed')
      }

      setSearchResults(result.data || [])
      setDictionaries(result.dictionaries)

      if (result.data?.length === 0) {
        toast.info('No flights found matching your criteria')
      } else {
        toast.success(`Found ${result.data?.length || 0} flights`)
      }
    } catch (error) {
      console.error('Flight search error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to search flights')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectFlight = async (flight: FlightOffer) => {
    setIsSaving(true)
    setSelectedFlightId(flight.id)

    try {
      // Extract flight details from the offer
      const firstSegment = flight.itineraries[0]?.segments[0]
      const lastSegment = flight.itineraries[0]?.segments[flight.itineraries[0].segments.length - 1]

      const flightData: {
        trip_id: string
        flight_type: string
        airline: string | null
        flight_number: string | null
        departure_airport: string
        departure_city: string
        arrival_airport: string
        arrival_city: string
        departure_datetime: string | null
        arrival_datetime: string | null
        duration_minutes: number | null
        stops: number
        cabin_class: string
        price: number
        currency: string
        booking_status: string
        provider: string
        external_id: string
      } = {
        trip_id: tripId,
        flight_type: flight.itineraries.length > 1 ? 'round_trip' : 'one_way',
        airline: firstSegment?.carrierCode || null,
        flight_number: firstSegment?.number || null,
        departure_airport: firstSegment?.departure.iataCode || '',
        departure_city: firstSegment?.departure.iataCode || '',
        arrival_airport: lastSegment?.arrival.iataCode || '',
        arrival_city: lastSegment?.arrival.iataCode || '',
        departure_datetime: firstSegment?.departure.at || null,
        arrival_datetime: lastSegment?.arrival.at || null,
        duration_minutes: parseDuration(flight.itineraries[0]?.duration),
        stops: flight.itineraries[0]?.segments.length - 1 || 0,
        cabin_class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
        price: parseFloat(flight.price.total),
        currency: flight.price.currency,
        booking_status: 'pending',
        provider: 'amadeus',
        external_id: flight.id,
      }

      const untypedSupabase = createUntypedClient()
      const { data, error } = await untypedSupabase
        .from('flights')
        .insert(flightData)
        .select()
        .single()

      if (error) throw error

      setSavedFlights([...savedFlights, data as Flight])
      toast.success('Flight saved to trip!')
    } catch (error) {
      console.error('Save flight error:', error)
      toast.error('Failed to save flight')
    } finally {
      setIsSaving(false)
      setSelectedFlightId(undefined)
    }
  }

  const handleDeleteFlight = async (flightId: string) => {
    try {
      const { error } = await supabase
        .from('flights')
        .delete()
        .eq('id', flightId)

      if (error) throw error

      setSavedFlights(savedFlights.filter((f) => f.id !== flightId))
      toast.success('Flight removed')
    } catch (error) {
      console.error('Delete flight error:', error)
      toast.error('Failed to remove flight')
    }
  }

  // Helper to parse ISO 8601 duration (e.g., "PT2H30M")
  function parseDuration(duration?: string): number | null {
    if (!duration) return null
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (!match) return null
    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    return hours * 60 + minutes
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Flights</h2>
          <p className="text-sm text-muted-foreground">
            Search and manage your flight bookings
          </p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Manual Flight
        </Button>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search Flights
          </TabsTrigger>
          <TabsTrigger value="booked">
            <List className="mr-2 h-4 w-4" />
            My Flights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Flights</CardTitle>
              <CardDescription>
                Search for available flights powered by Amadeus API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlightSearchForm
                onSearch={handleSearch}
                isLoading={isSearching}
              />
            </CardContent>
          </Card>

          {hasSearched && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Search Results</h3>
              <FlightResults
                flights={searchResults}
                dictionaries={dictionaries}
                onSelectFlight={handleSelectFlight}
                isSelecting={isSaving}
                selectedFlightId={selectedFlightId}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="booked">
          <Card>
            <CardHeader>
              <CardTitle>Booked Flights</CardTitle>
              <CardDescription>
                {savedFlights.length} flight{savedFlights.length !== 1 ? 's' : ''} saved for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedFlights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Plane className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Flights Added Yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-4">
                    Search for flights and add them to your trip, or manually add existing bookings.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const searchTab = document.querySelector('[data-state="inactive"][value="search"]')
                      if (searchTab) {
                        (searchTab as HTMLButtonElement).click()
                      }
                    }}
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Search Flights
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedFlights.map((flight) => (
                    <div
                      key={flight.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Plane className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {flight.departure_airport} → {flight.arrival_airport}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {flight.airline} {flight.flight_number}
                            {flight.departure_datetime && (
                              <> • {format(new Date(flight.departure_datetime), 'MMM d, yyyy HH:mm')}</>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            {flight.duration_minutes && (
                              <> • {Math.floor(flight.duration_minutes / 60)}h {flight.duration_minutes % 60}m</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {flight.currency} {flight.price?.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {flight.booking_status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFlight(flight.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
