'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, eachDayOfInterval } from 'date-fns'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Settings, Share2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { TripHeader, TripSummaryCards, DayCards, TripMapSection, TripEditModal } from '@/components/trip'
import { FlightsSection } from '@/components/trip/sections/flights-section'
import { HotelsSection } from '@/components/trip/sections/hotels-section'
import { BudgetSection } from '@/components/trip/sections/budget-section'
import { PlacesSection } from '@/components/trip/sections/places-section'
import { Navbar } from '@/components/shared/navbar'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { MapDestination } from '@/components/maps/trip-map'

interface Trip {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  currency: string
  total_budget: number | null
  travelers_count: number
}

interface Destination {
  id: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  arrival_date: string | null
  departure_date: string | null
  order_index: number
}

interface Flight {
  id: string
  airline: string | null
  flight_number: string | null
  flight_type: string
  departure_city: string
  departure_airport: string
  departure_country: string | null
  arrival_city: string
  arrival_airport: string
  arrival_country: string | null
  departure_datetime: string | null
  arrival_datetime: string | null
  duration_minutes: number | null
  stops: number
  cabin_class: string
  price: number | null
  currency: string
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  seat_number: string | null
  meal_included: boolean
  notes: string | null
  departure_latitude: number | null
  departure_longitude: number | null
  arrival_latitude: number | null
  arrival_longitude: number | null
}

interface Accommodation {
  id: string
  name: string
  type: string
  address: string | null
  city: string
  country: string | null
  latitude: number | null
  longitude: number | null
  check_in_date: string | null
  check_in_time: string | null
  check_out_date: string | null
  check_out_time: string | null
  nights_count: number | null
  room_type: string | null
  room_count: number
  guests_count: number
  price_per_night: number | null
  total_price: number | null
  currency: string
  rating: number | null
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  amenities: string[] | null
  breakfast_included: boolean
  cancellation_policy: string | null
  notes: string | null
}

interface SavedPlace {
  id: string
  name: string
  description: string | null
  category: string | null
  address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  price_level: string | null
  phone: string | null
  website: string | null
  is_visited: boolean
  personal_rating: number | null
  personal_notes: string | null
  provider: string | null
  tags: string[] | null
}

interface Expense {
  id: string
  category: string
  amount: number
  currency: string
}

interface ItineraryItem {
  id: string
  date: string
  title: string
  description: string | null
  time_slot: string
  start_time: string | null
  category: string
  location_name: string | null
  latitude: number | null
  longitude: number | null
  estimated_cost: number | null
  currency: string
}

// Map itinerary category to MapDestination type
function getMapTypeFromCategory(category: string): MapDestination['type'] {
  switch (category) {
    case 'meal':
      return 'restaurant'
    case 'activity':
      return 'activity'
    case 'transport':
    case 'flight':
      return 'stopover'
    case 'rest':
    case 'accommodation':
      return 'stopover'
    default:
      return 'attraction'
  }
}

// Map saved_places category to MapDestination type
function getMapTypeFromPlaceCategory(category: string): MapDestination['type'] {
  switch (category?.toLowerCase()) {
    case 'restaurant':
      return 'restaurant'
    case 'museum':
      return 'museum'
    case 'park':
      return 'park'
    case 'attraction':
    default:
      return 'attraction'
  }
}

// Get day number from date relative to trip start
function getDayNumber(tripStartDate: string, itemDate: string): number {
  const start = parseISO(tripStartDate)
  const item = parseISO(itemDate)
  return Math.floor((item.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function TripViewPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [flights, setFlights] = useState<Flight[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    async function fetchTripData() {
      setIsLoading(true)
      try {
        // Fetch trip
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single()

        if (tripError) throw tripError
        setTrip(tripData)

        // Fetch destinations
        const { data: destData } = await supabase
          .from('trip_destinations')
          .select('*')
          .eq('trip_id', tripId)
          .order('order_index')

        setDestinations(destData || [])

        // Fetch flights (all statuses so users can see AI suggestions)
        const { data: flightData } = await supabase
          .from('flights')
          .select('*')
          .eq('trip_id', tripId)
          .order('departure_datetime')

        setFlights(flightData || [])

        // Fetch accommodations (all statuses so users can see AI suggestions)
        const { data: accomData } = await supabase
          .from('accommodations')
          .select('*')
          .eq('trip_id', tripId)
          .order('check_in_date')

        setAccommodations(accomData || [])

        // Fetch itinerary items (exclude suggested)
        const { data: itineraryData } = await supabase
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', tripId)
          .neq('status', 'suggested')
          .order('date')
          .order('order_index')

        setItineraryItems(itineraryData || [])

        // Fetch saved places (all fields)
        const { data: placesData } = await supabase
          .from('saved_places')
          .select('*')
          .eq('trip_id', tripId)

        setSavedPlaces(placesData || [])

        // Fetch expenses
        const { data: expensesData } = await supabase
          .from('expenses')
          .select('id, category, amount, currency')
          .eq('trip_id', tripId)

        setExpenses(expensesData || [])

      } catch (error) {
        console.error('Error fetching trip:', error)
        toast.error('Failed to load trip')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTripData()
  }, [tripId, supabase])

  // Refresh all data
  const refreshData = async () => {
    try {
      // Refresh flights (all statuses)
      const { data: flightData } = await supabase
        .from('flights')
        .select('*')
        .eq('trip_id', tripId)
        .order('departure_datetime')
      setFlights(flightData || [])

      // Refresh accommodations (all statuses)
      const { data: accomData } = await supabase
        .from('accommodations')
        .select('*')
        .eq('trip_id', tripId)
        .order('check_in_date')
      setAccommodations(accomData || [])

      // Refresh itinerary (exclude suggested for now)
      const { data: itineraryData } = await supabase
        .from('itinerary_items')
        .select('*')
        .eq('trip_id', tripId)
        .neq('status', 'suggested')
        .order('date')
        .order('order_index')
      setItineraryItems(itineraryData || [])

      // Refresh saved places
      const { data: placesData } = await supabase
        .from('saved_places')
        .select('*')
        .eq('trip_id', tripId)
      setSavedPlaces(placesData || [])

      // Refresh expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('id, category, amount, currency')
        .eq('trip_id', tripId)
      setExpenses(expensesData || [])
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    }
  }

  const handleUpdateTrip = async (title: string, description: string) => {
    try {
      const untypedSupabase = createUntypedClient()
      const { error } = await untypedSupabase
        .from('trips')
        .update({ title, description })
        .eq('id', tripId)

      if (error) throw error

      setTrip(prev => prev ? { ...prev, title, description } : null)
      toast.success('Trip updated')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update trip')
      throw error
    }
  }

  // Group itinerary items by date
  const groupedItinerary = itineraryItems.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = []
    }
    acc[item.date].push(item)
    return acc
  }, {})

  // Create day data for DayCards
  const dayData = trip?.start_date && trip?.end_date
    ? eachDayOfInterval({
        start: parseISO(trip.start_date),
        end: parseISO(trip.end_date),
      }).map(date => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return {
          date: dateStr,
          items: groupedItinerary[dateStr] || [],
        }
      })
    : []

  // Convert destinations to map format
  const destinationMarkers: MapDestination[] = destinations
    .filter(d => d.latitude && d.longitude)
    .map((dest, index) => ({
      id: dest.id,
      name: `${dest.city}, ${dest.country}`,
      coordinates: [dest.longitude!, dest.latitude!] as [number, number],
      type: index === 0 ? 'origin' : index === destinations.length - 1 ? 'destination' : 'stopover',
      arrivalDate: dest.arrival_date || undefined,
      departureDate: dest.departure_date || undefined,
      order: dest.order_index,
    }))

  // Convert itinerary items with coordinates to map format
  const itineraryMarkers: MapDestination[] = itineraryItems
    .filter(item => item.latitude && item.longitude)
    .map((item, index) => ({
      id: item.id,
      name: item.title || item.location_name || 'Activity',
      coordinates: [item.longitude!, item.latitude!] as [number, number],
      type: getMapTypeFromCategory(item.category),
      category: item.category,
      dayNumber: trip ? getDayNumber(trip.start_date, item.date) : undefined,
      order: 100 + index,
    }))

  // Convert saved places to map format
  const placeMarkers: MapDestination[] = savedPlaces
    .filter(place => place.latitude && place.longitude)
    .map((place, index) => ({
      id: place.id,
      name: place.name,
      coordinates: [place.longitude!, place.latitude!] as [number, number],
      type: getMapTypeFromPlaceCategory(place.category || 'other'),
      category: place.category ?? undefined,
      order: 200 + index,
    }))

  // Convert accommodations to hotel markers
  const hotelMarkers: MapDestination[] = accommodations
    .filter(hotel => hotel.latitude && hotel.longitude)
    .map((hotel, index) => ({
      id: hotel.id,
      name: hotel.name,
      coordinates: [hotel.longitude!, hotel.latitude!] as [number, number],
      type: 'hotel' as const,
      order: 300 + index,
    }))

  // Convert flights to airport markers
  const airportMarkers: MapDestination[] = []
  flights.forEach((flight, index) => {
    if (flight.departure_latitude && flight.departure_longitude) {
      airportMarkers.push({
        id: `dep-${flight.id}`,
        name: `${flight.departure_airport || 'Departure'} - ${flight.departure_city}`,
        coordinates: [flight.departure_longitude, flight.departure_latitude] as [number, number],
        type: 'airport' as const,
        order: 400 + index * 2,
      })
    }
    if (flight.arrival_latitude && flight.arrival_longitude) {
      airportMarkers.push({
        id: `arr-${flight.id}`,
        name: `${flight.arrival_airport || 'Arrival'} - ${flight.arrival_city}`,
        coordinates: [flight.arrival_longitude, flight.arrival_latitude] as [number, number],
        type: 'airport' as const,
        order: 401 + index * 2,
      })
    }
  })

  // Combine all markers for the map
  const mapDestinations: MapDestination[] = [
    ...destinationMarkers,
    ...airportMarkers,
    ...hotelMarkers,
    ...placeMarkers,
    ...itineraryMarkers,
  ]

  // Calculate estimated budget
  const flightCosts = flights.reduce((sum, f) => sum + (f.price || 0), 0)
  const hotelCosts = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)
  const activityCosts = itineraryItems.reduce((sum, i) => sum + (i.estimated_cost || 0), 0)
  const estimatedBudget = flightCosts + hotelCosts + activityCosts

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground mb-4">Trip not found</p>
        <Button asChild>
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    )
  }

  const primaryDestination = destinations[0]
    ? `${destinations[0].city}, ${destinations[0].country}`
    : 'Unknown'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-5xl py-6 px-4">
        {/* Back button and actions */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trips">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trips
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Trip Header */}
          <TripHeader
            title={trip.title}
            description={trip.description || undefined}
            startDate={trip.start_date}
            endDate={trip.end_date}
            destination={primaryDestination}
            travelers={trip.travelers_count}
            onUpdate={handleUpdateTrip}
          />

          {/* Summary Cards */}
          <TripSummaryCards
            flight={flights[0] || null}
            accommodation={accommodations[0] || null}
            estimatedBudget={estimatedBudget || trip.total_budget || undefined}
            currency={trip.currency}
          />

          {/* Flights Section */}
          <FlightsSection
            flights={flights}
            tripId={tripId}
            currency={trip.currency}
            onUpdate={refreshData}
          />

          {/* Hotels Section */}
          <HotelsSection
            accommodations={accommodations}
            tripId={tripId}
            currency={trip.currency}
            onUpdate={refreshData}
          />

          {/* Budget Section */}
          <BudgetSection
            flights={flights}
            accommodations={accommodations}
            itineraryItems={itineraryItems}
            expenses={expenses}
            totalBudget={trip.total_budget}
            currency={trip.currency}
          />

          {/* Places Section */}
          <PlacesSection
            places={savedPlaces}
            tripId={tripId}
            onUpdate={refreshData}
          />

          {/* Day-by-Day Itinerary */}
          <DayCards
            days={dayData}
            currency={trip.currency}
          />

          {/* Map Section */}
          <TripMapSection
            destinations={mapDestinations}
            defaultExpanded={false}
          />
        </motion.div>
      </main>

      {/* Edit Modal */}
      <TripEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        trip={{
          id: trip.id,
          title: trip.title,
          description: trip.description,
          start_date: trip.start_date,
          end_date: trip.end_date,
          travelers_count: trip.travelers_count,
          total_budget: trip.total_budget,
          currency: trip.currency,
        }}
        onSave={async () => {
          // Refresh trip data after save
          const { data: updatedTrip } = await supabase
            .from('trips')
            .select('*')
            .eq('id', tripId)
            .single()
          if (updatedTrip) {
            setTrip(updatedTrip)
          }
        }}
      />
    </div>
  )
}
