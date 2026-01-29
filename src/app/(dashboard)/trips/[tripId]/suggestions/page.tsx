'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Plane,
  Hotel,
  Calendar,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Clock,
  MapPin,
  Star,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { Flight, Accommodation, ItineraryItem } from '@/types/database'

interface SuggestionCounts {
  flights: number
  hotels: number
  itinerary: number
}

export default function SuggestionsPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [flights, setFlights] = useState<Flight[]>([])
  const [hotels, setHotels] = useState<Accommodation[]>([])
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([])
  const [selectedFlights, setSelectedFlights] = useState<Set<string>>(new Set())
  const [selectedHotels, setSelectedHotels] = useState<Set<string>>(new Set())
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  // Fetch suggestions
  useEffect(() => {
    async function fetchSuggestions() {
      setIsLoading(true)
      try {
        // Fetch suggested flights
        const { data: flightsData } = (await supabase
          .from('flights')
          .select('*')
          .eq('trip_id', tripId)
          .eq('booking_status', 'suggested')
          .order('departure_datetime', { ascending: true })) as {
          data: Flight[] | null
        }

        // Fetch suggested hotels
        const { data: hotelsData } = (await supabase
          .from('accommodations')
          .select('*')
          .eq('trip_id', tripId)
          .eq('booking_status', 'suggested')
          .order('check_in_date', { ascending: true })) as {
          data: Accommodation[] | null
        }

        // Fetch suggested itinerary items
        const { data: itemsData } = (await supabase
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', tripId)
          .eq('status', 'suggested')
          .order('date', { ascending: true })
          .order('order_index', { ascending: true })) as {
          data: ItineraryItem[] | null
        }

        setFlights(flightsData || [])
        setHotels(hotelsData || [])
        setItineraryItems(itemsData || [])
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        toast.error('Failed to load suggestions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [tripId, supabase])

  const counts: SuggestionCounts = {
    flights: flights.length,
    hotels: hotels.length,
    itinerary: itineraryItems.length,
  }

  const toggleFlight = (id: string) => {
    const newSelected = new Set(selectedFlights)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedFlights(newSelected)
  }

  const toggleHotel = (id: string) => {
    const newSelected = new Set(selectedHotels)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedHotels(newSelected)
  }

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAllFlights = () => {
    setSelectedFlights(new Set(flights.map((f) => f.id)))
  }

  const selectAllHotels = () => {
    setSelectedHotels(new Set(hotels.map((h) => h.id)))
  }

  const selectAllItems = () => {
    setSelectedItems(new Set(itineraryItems.map((i) => i.id)))
  }

  const handleConfirmSelections = async () => {
    setIsSaving(true)
    const untypedSupabase = createUntypedClient()

    try {
      // Update selected flights to confirmed
      if (selectedFlights.size > 0) {
        const { error } = await untypedSupabase
          .from('flights')
          .update({ booking_status: 'pending' })
          .in('id', Array.from(selectedFlights))

        if (error) throw error
      }

      // Delete unselected flights
      const unselectedFlightIds = flights
        .filter((f) => !selectedFlights.has(f.id))
        .map((f) => f.id)

      if (unselectedFlightIds.length > 0) {
        await untypedSupabase
          .from('flights')
          .delete()
          .in('id', unselectedFlightIds)
      }

      // Update selected hotels to confirmed
      if (selectedHotels.size > 0) {
        const { error } = await untypedSupabase
          .from('accommodations')
          .update({ booking_status: 'pending' })
          .in('id', Array.from(selectedHotels))

        if (error) throw error
      }

      // Delete unselected hotels
      const unselectedHotelIds = hotels
        .filter((h) => !selectedHotels.has(h.id))
        .map((h) => h.id)

      if (unselectedHotelIds.length > 0) {
        await untypedSupabase
          .from('accommodations')
          .delete()
          .in('id', unselectedHotelIds)
      }

      // Update selected itinerary items to planned
      if (selectedItems.size > 0) {
        const { error } = await untypedSupabase
          .from('itinerary_items')
          .update({ status: 'planned' })
          .in('id', Array.from(selectedItems))

        if (error) throw error
      }

      // Delete unselected itinerary items
      const unselectedItemIds = itineraryItems
        .filter((i) => !selectedItems.has(i.id))
        .map((i) => i.id)

      if (unselectedItemIds.length > 0) {
        await untypedSupabase
          .from('itinerary_items')
          .delete()
          .in('id', unselectedItemIds)
      }

      toast.success('Trip finalized!')
      router.push(`/trips/${tripId}`)
    } catch (error) {
      console.error('Error saving selections:', error)
      toast.error('Failed to save selections')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate estimated cost
  const estimatedCost =
    flights
      .filter((f) => selectedFlights.has(f.id))
      .reduce((sum, f) => sum + (f.price || 0), 0) +
    hotels
      .filter((h) => selectedHotels.has(h.id))
      .reduce((sum, h) => sum + (h.total_price || 0), 0) +
    itineraryItems
      .filter((i) => selectedItems.has(i.id))
      .reduce((sum, i) => sum + (i.estimated_cost || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasNoSuggestions =
    flights.length === 0 && hotels.length === 0 && itineraryItems.length === 0

  if (hasNoSuggestions) {
    return (
      <div className="container max-w-2xl mx-auto py-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Suggestions Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t find any suggestions for your trip. You can manually
          add flights, hotels, and activities.
        </p>
        <Button onClick={() => router.push(`/trips/${tripId}`)}>
          Go to Trip
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Review Suggestions</h2>
          <p className="text-sm text-muted-foreground">
            Select the options you want to keep for your trip
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Estimated Total</p>
          <p className="text-2xl font-bold">${estimatedCost.toLocaleString()}</p>
        </div>
      </div>

      <Tabs defaultValue="flights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flights" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights
            <Badge variant="secondary" className="ml-1">
              {selectedFlights.size}/{counts.flights}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="hotels" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels
            <Badge variant="secondary" className="ml-1">
              {selectedHotels.size}/{counts.hotels}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="itinerary" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Itinerary
            <Badge variant="secondary" className="ml-1">
              {selectedItems.size}/{counts.itinerary}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flights" className="space-y-4">
          {flights.length > 0 ? (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={selectAllFlights}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Select All
                </Button>
              </div>
              <div className="space-y-3">
                {flights.map((flight) => (
                  <FlightSuggestionCard
                    key={flight.id}
                    flight={flight}
                    isSelected={selectedFlights.has(flight.id)}
                    onToggle={() => toggleFlight(flight.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={Plane} title="No flight suggestions" />
          )}
        </TabsContent>

        <TabsContent value="hotels" className="space-y-4">
          {hotels.length > 0 ? (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={selectAllHotels}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Select All
                </Button>
              </div>
              <div className="space-y-3">
                {hotels.map((hotel) => (
                  <HotelSuggestionCard
                    key={hotel.id}
                    hotel={hotel}
                    isSelected={selectedHotels.has(hotel.id)}
                    onToggle={() => toggleHotel(hotel.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={Hotel} title="No hotel suggestions" />
          )}
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-4">
          {itineraryItems.length > 0 ? (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={selectAllItems}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Select All
                </Button>
              </div>
              <div className="space-y-3">
                {groupByDate(itineraryItems).map(([date, items]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <ItinerarySuggestionCard
                          key={item.id}
                          item={item}
                          isSelected={selectedItems.has(item.id)}
                          onToggle={() => toggleItem(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={Calendar} title="No itinerary suggestions" />
          )}
        </TabsContent>
      </Tabs>

      {/* Fixed bottom action bar */}
      <Card className="sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFlights.size + selectedHotels.size + selectedItems.size} items
            </p>
            <p className="text-lg font-semibold">
              Total: ${estimatedCost.toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/trips/${tripId}`)}
            >
              Skip
            </Button>
            <Button
              onClick={handleConfirmSelections}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm & Finalize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Flight suggestion card component
function FlightSuggestionCard({
  flight,
  isSelected,
  onToggle,
}: {
  flight: Flight
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isSelected ? (
            <Check className="h-5 w-5" />
          ) : (
            <Plane className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {flight.departure_airport} → {flight.arrival_airport}
            </span>
            {flight.airline && (
              <Badge variant="outline" className="text-xs">
                {flight.airline}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {flight.departure_datetime && (
              <span>
                {format(new Date(flight.departure_datetime), 'MMM d, HH:mm')}
              </span>
            )}
            {flight.duration_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(flight.duration_minutes / 60)}h{' '}
                {flight.duration_minutes % 60}m
              </span>
            )}
            <span>
              {flight.stops === 0
                ? 'Direct'
                : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {flight.currency} {flight.price?.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {flight.cabin_class?.toLowerCase()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Hotel suggestion card component
function HotelSuggestionCard({
  hotel,
  isSelected,
  onToggle,
}: {
  hotel: Accommodation
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isSelected ? (
            <Check className="h-5 w-5" />
          ) : (
            <Hotel className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{hotel.name}</span>
            {hotel.rating && (
              <span className="flex items-center gap-0.5 text-sm text-yellow-500">
                <Star className="h-3 w-3 fill-current" />
                {hotel.rating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {hotel.city}
            </span>
            {hotel.check_in_date && hotel.check_out_date && (
              <span>
                {format(new Date(hotel.check_in_date), 'MMM d')} -{' '}
                {format(new Date(hotel.check_out_date), 'MMM d')}
              </span>
            )}
            {hotel.nights_count && (
              <span>
                {hotel.nights_count} night{hotel.nights_count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {hotel.currency} {hotel.total_price?.toFixed(2)}
          </p>
          {hotel.price_per_night && (
            <p className="text-xs text-muted-foreground">
              ${hotel.price_per_night.toFixed(0)}/night
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Itinerary item suggestion card component
function ItinerarySuggestionCard({
  item,
  isSelected,
  onToggle,
}: {
  item: ItineraryItem
  isSelected: boolean
  onToggle: () => void
}) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sightseeing: 'bg-blue-100 text-blue-700',
      food: 'bg-orange-100 text-orange-700',
      culture: 'bg-purple-100 text-purple-700',
      adventure: 'bg-green-100 text-green-700',
      relaxation: 'bg-cyan-100 text-cyan-700',
      shopping: 'bg-pink-100 text-pink-700',
      transport: 'bg-gray-100 text-gray-700',
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-700'
  }

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={onToggle}
    >
      <CardContent className="flex items-center gap-4 py-3">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          {isSelected ? (
            <Check className="h-4 w-4" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{item.title}</span>
            <Badge className={`text-xs ${getCategoryColor(item.category)}`}>
              {item.category}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {item.start_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </span>
            )}
            {item.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.location_name}
              </span>
            )}
          </div>
        </div>
        {item.estimated_cost !== null && item.estimated_cost > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium">
              {item.currency} {item.estimated_cost}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Empty state component
function EmptyState({
  icon: Icon,
  title,
}: {
  icon: typeof Plane
  title: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{title}</p>
    </div>
  )
}

// Helper to group itinerary items by date
function groupByDate(
  items: ItineraryItem[]
): [string, ItineraryItem[]][] {
  const groups: Record<string, ItineraryItem[]> = {}

  for (const item of items) {
    const date = item.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  }

  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}
