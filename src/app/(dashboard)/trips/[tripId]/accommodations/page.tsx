'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Hotel, Plus, List, Search as SearchIcon, Loader2, Trash2, Star } from 'lucide-react'
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
import { HotelSearchForm, HotelResults } from '@/components/accommodations'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { HotelOffer } from '@/lib/amadeus'
import type { Accommodation } from '@/types/database'

export default function AccommodationsPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<HotelOffer[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedHotelId, setSelectedHotelId] = useState<string>()
  const [savedAccommodations, setSavedAccommodations] = useState<Accommodation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch saved accommodations
  useEffect(() => {
    async function fetchAccommodations() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('accommodations')
          .select('*')
          .eq('trip_id', tripId)
          .neq('booking_status', 'suggested')
          .order('check_in_date', { ascending: true })

        if (error) throw error
        setSavedAccommodations(data || [])
      } catch (error) {
        console.error('Error fetching accommodations:', error)
        toast.error('Failed to load accommodations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccommodations()
  }, [tripId, supabase])

  const handleSearch = async (data: {
    cityCode: string
    checkInDate: Date
    checkOutDate: Date
    adults: number
    roomQuantity: number
    ratings?: string[]
  }) => {
    setIsSearching(true)
    setHasSearched(true)

    try {
      const searchParams = new URLSearchParams({
        cityCode: data.cityCode,
        checkInDate: data.checkInDate.toISOString().split('T')[0],
        checkOutDate: data.checkOutDate.toISOString().split('T')[0],
        adults: data.adults.toString(),
        roomQuantity: data.roomQuantity.toString(),
      })

      if (data.ratings && data.ratings.length > 0) {
        searchParams.set('ratings', data.ratings.join(','))
      }

      const response = await fetch(`/api/hotels/search?${searchParams}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Search failed')
      }

      setSearchResults(result.data || [])

      if (result.data?.length === 0) {
        toast.info('No hotels found matching your criteria')
      } else {
        toast.success(`Found ${result.data?.length || 0} hotels`)
      }
    } catch (error) {
      console.error('Hotel search error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to search hotels')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectHotel = async (hotel: HotelOffer, offerId: string) => {
    setIsSaving(true)
    setSelectedHotelId(hotel.hotel.hotelId)

    try {
      // Find the selected offer
      const selectedOffer = hotel.offers.find((o) => o.id === offerId) || hotel.offers[0]

      const accommodationData: {
        trip_id: string
        name: string
        type: string
        city: string
        latitude?: number
        longitude?: number
        check_in_date?: string
        check_out_date?: string
        room_type: string | null
        price_per_night: number | null
        total_price: number | null
        currency: string
        rating: number | null
        booking_status: string
        provider: string
        external_id: string
      } = {
        trip_id: tripId,
        name: hotel.hotel.name,
        type: 'hotel',
        city: hotel.hotel.cityCode || '',
        latitude: hotel.hotel.latitude,
        longitude: hotel.hotel.longitude,
        check_in_date: selectedOffer?.checkInDate,
        check_out_date: selectedOffer?.checkOutDate,
        room_type: selectedOffer?.room?.typeEstimated?.category || null,
        price_per_night: selectedOffer?.price?.total
          ? parseFloat(selectedOffer.price.total) / (calculateNights(selectedOffer.checkInDate, selectedOffer.checkOutDate) || 1)
          : null,
        total_price: selectedOffer?.price?.total ? parseFloat(selectedOffer.price.total) : null,
        currency: selectedOffer?.price?.currency || 'USD',
        rating: hotel.hotel.rating ? parseInt(hotel.hotel.rating) : null,
        booking_status: 'pending',
        provider: 'amadeus',
        external_id: hotel.hotel.hotelId,
      }

      const untypedSupabase = createUntypedClient()
      const { data, error } = await untypedSupabase
        .from('accommodations')
        .insert(accommodationData)
        .select()
        .single()

      if (error) throw error

      setSavedAccommodations([...savedAccommodations, data as Accommodation])
      toast.success('Hotel saved to trip!')
    } catch (error) {
      console.error('Save hotel error:', error)
      toast.error('Failed to save hotel')
    } finally {
      setIsSaving(false)
      setSelectedHotelId(undefined)
    }
  }

  const handleDeleteAccommodation = async (accommodationId: string) => {
    try {
      const { error } = await supabase
        .from('accommodations')
        .delete()
        .eq('id', accommodationId)

      if (error) throw error

      setSavedAccommodations(savedAccommodations.filter((a) => a.id !== accommodationId))
      toast.success('Accommodation removed')
    } catch (error) {
      console.error('Delete accommodation error:', error)
      toast.error('Failed to remove accommodation')
    }
  }

  function calculateNights(checkIn?: string, checkOut?: string): number | null {
    if (!checkIn || !checkOut) return null
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Accommodations</h2>
          <p className="text-sm text-muted-foreground">
            Search and manage your stays
          </p>
        </div>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Manual Booking
        </Button>
      </div>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="search">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search Hotels
          </TabsTrigger>
          <TabsTrigger value="booked">
            <List className="mr-2 h-4 w-4" />
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Hotels</CardTitle>
              <CardDescription>
                Find hotels and accommodations powered by Amadeus API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HotelSearchForm
                onSearch={handleSearch}
                isLoading={isSearching}
              />
            </CardContent>
          </Card>

          {hasSearched && (
            <div>
              <h3 className="mb-4 text-lg font-semibold">Search Results</h3>
              <HotelResults
                hotels={searchResults}
                onSelectHotel={handleSelectHotel}
                isSelecting={isSaving}
                selectedHotelId={selectedHotelId}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="booked">
          <Card>
            <CardHeader>
              <CardTitle>Booked Accommodations</CardTitle>
              <CardDescription>
                {savedAccommodations.length} accommodation{savedAccommodations.length !== 1 ? 's' : ''} saved for this trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedAccommodations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Hotel className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Accommodations Added Yet</h3>
                  <p className="text-muted-foreground max-w-sm mb-4">
                    Search for hotels and add them to your trip, or manually add existing bookings.
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
                    Search Hotels
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedAccommodations.map((accommodation) => (
                    <div
                      key={accommodation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Hotel className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{accommodation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {accommodation.city}
                            {accommodation.rating && (
                              <span className="inline-flex items-center ml-2">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                                {accommodation.rating}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {accommodation.check_in_date && format(new Date(accommodation.check_in_date), 'MMM d')}
                            {accommodation.check_out_date && (
                              <> - {format(new Date(accommodation.check_out_date), 'MMM d, yyyy')}</>
                            )}
                            {accommodation.nights_count && (
                              <> ({accommodation.nights_count} night{accommodation.nights_count > 1 ? 's' : ''})</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {accommodation.currency} {accommodation.total_price?.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {accommodation.booking_status}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAccommodation(accommodation.id)}
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
