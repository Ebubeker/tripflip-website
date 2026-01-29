'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Map, MessageSquare, Sparkles, Navigation, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TripMap, type MapDestination } from '@/components/maps'
import { ChatInterface, ItineraryGenerator } from '@/components/ai'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { Trip, TripDestination } from '@/types/database'

export default function MapPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [selectedDestination, setSelectedDestination] = useState<MapDestination | null>(null)
  const [activeTab, setActiveTab] = useState('map')
  const [isLoading, setIsLoading] = useState(true)
  const [destinations, setDestinations] = useState<MapDestination[]>([])
  const [trip, setTrip] = useState<Trip | null>(null)
  const [tripContext, setTripContext] = useState({
    destinations: [] as string[],
    startDate: '',
    endDate: '',
    budget: 0,
    currency: 'USD',
  })

  // Fetch trip and destinations
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .single() as { data: Trip | null; error: Error | null }

        if (tripError) throw tripError
        setTrip(tripData)

        // Fetch destinations
        const { data: destData, error: destError } = await supabase
          .from('trip_destinations')
          .select('*')
          .eq('trip_id', tripId)
          .order('order_index', { ascending: true }) as { data: TripDestination[] | null; error: Error | null }

        if (destError) throw destError

        // Transform to MapDestination format
        const mapDestinations: MapDestination[] = (destData || []).map((dest, index) => ({
          id: dest.id,
          name: `${dest.city}, ${dest.country}`,
          coordinates: [dest.longitude || 0, dest.latitude || 0] as [number, number],
          type: index === 0 ? 'origin' : index === (destData?.length || 0) - 1 ? 'destination' : 'stopover',
          arrivalDate: dest.arrival_date || undefined,
          departureDate: dest.departure_date || undefined,
          order: dest.order_index,
        }))

        setDestinations(mapDestinations)

        // Set trip context for AI
        setTripContext({
          destinations: mapDestinations.map((d) => d.name),
          startDate: tripData?.start_date || '',
          endDate: tripData?.end_date || '',
          budget: tripData?.total_budget || 0,
          currency: tripData?.currency || 'USD',
        })
      } catch (error) {
        console.error('Error fetching map data:', error)
        toast.error('Failed to load map data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tripId, supabase])

  const handleMarkerClick = (destination: MapDestination) => {
    setSelectedDestination(destination)
  }

  const handleAddActivity = async (activity: { time_slot: string; title: string; description: string; category: string; estimated_cost?: number; tips?: string }, date: string) => {
    try {
      const untypedSupabase = createUntypedClient()
      const { error } = await untypedSupabase.from('itinerary_items').insert({
        trip_id: tripId,
        date,
        time_slot: activity.time_slot,
        title: activity.title,
        description: activity.description,
        category: activity.category,
        estimated_cost: activity.estimated_cost || null,
        tips: activity.tips || null,
        status: 'planned',
      })

      if (error) throw error
      toast.success('Activity added to itinerary!')
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error('Failed to add activity')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Map & AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Visualize your trip and get AI-powered recommendations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Itinerary Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Route</CardTitle>
              <CardDescription>
                Interactive map showing your destinations and travel route
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                destinations.length > 0 ? (
                  <TripMap
                    destinations={destinations}
                    className="h-[500px]"
                    showRoutes={true}
                    onMarkerClick={handleMarkerClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-[500px] bg-muted/50 rounded-lg">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Map className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Destinations Added</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Add destinations to your trip to see them on the map.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-[500px] bg-muted/50 rounded-lg">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Map className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Map Not Configured</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Configure your Mapbox token in environment variables to enable
                    interactive maps.
                  </p>
                  <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    <span>Powered by Mapbox</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destination List */}
          <Card>
            <CardHeader>
              <CardTitle>Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              {destinations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No destinations added yet. Add destinations to your trip to see them here.
                </p>
              ) : (
                <div className="space-y-3">
                  {destinations.map((dest, index) => (
                    <div
                      key={dest.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDestination?.id === dest.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedDestination(dest)}
                    >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${
                          dest.type === 'origin'
                            ? 'bg-green-500'
                            : dest.type === 'destination'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{dest.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dest.arrivalDate && dest.departureDate
                            ? `${dest.arrivalDate} - ${dest.departureDate}`
                            : 'Dates not set'}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {dest.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid gap-4 lg:grid-cols-2">
            <ChatInterface
              tripContext={tripContext}
              className="lg:col-span-2"
            />
          </div>
        </TabsContent>

        <TabsContent value="generator">
          <ItineraryGenerator
            tripId={tripId}
            destinations={tripContext.destinations}
            startDate={tripContext.startDate}
            endDate={tripContext.endDate}
            budget={tripContext.budget}
            currency={tripContext.currency}
            onItineraryGenerated={(itinerary) => {
              console.log('Generated itinerary:', itinerary)
            }}
            onAddActivity={handleAddActivity}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
