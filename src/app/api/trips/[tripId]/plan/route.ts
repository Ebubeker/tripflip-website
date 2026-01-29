import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAmadeusClient, type FlightOffer, type HotelOffer } from '@/lib/amadeus'
import { geminiProModel } from '@/lib/gemini'
import { ITINERARY_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { getAirportCode, getCityCode } from '@/lib/city-codes'
import { differenceInDays, format, addDays, parseISO } from 'date-fns'

// Create Supabase client for server-side operations
function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface TripDestination {
  id: string
  city: string
  country: string
  arrival_date: string | null
  departure_date: string | null
  order_index: number
}

interface Trip {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  travelers_count: number
  travel_style: string | null
  interests: string[]
  trip_destinations: TripDestination[]
}

interface PlanSummary {
  flightsFound: number
  hotelsFound: number
  itineraryDaysGenerated: number
  estimatedTotalCost: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = createServerClient()

    // 1. Fetch trip with destinations
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*, trip_destinations(*)')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found', details: tripError?.message },
        { status: 404 }
      )
    }

    const typedTrip = trip as Trip
    const destinations = (typedTrip.trip_destinations || []).sort(
      (a, b) => a.order_index - b.order_index
    )

    if (destinations.length === 0) {
      return NextResponse.json(
        { error: 'No destinations found for this trip' },
        { status: 400 }
      )
    }

    const summary: PlanSummary = {
      flightsFound: 0,
      hotelsFound: 0,
      itineraryDaysGenerated: 0,
      estimatedTotalCost: 0,
    }

    const errors: string[] = []

    // 2. Search flights between consecutive destinations
    const flightsToInsert: Record<string, unknown>[] = []

    for (let i = 0; i < destinations.length - 1; i++) {
      const origin = destinations[i]
      const dest = destinations[i + 1]

      // Get airport codes
      const originCode = getAirportCode(origin.city)
      const destCode = getAirportCode(dest.city)

      if (!originCode || !destCode) {
        errors.push(`Could not find airport codes for ${origin.city} or ${dest.city}`)
        continue
      }

      // Determine departure date (use destination's departure_date or trip start date)
      const departureDate = origin.departure_date || typedTrip.start_date
      if (!departureDate) {
        errors.push(`No departure date for flight from ${origin.city}`)
        continue
      }

      try {
        const amadeus = getAmadeusClient()
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: originCode,
          destinationLocationCode: destCode,
          departureDate,
          adults: String(typedTrip.travelers_count || 1),
          travelClass: 'ECONOMY',
          currencyCode: typedTrip.currency || 'USD',
          max: '5', // Get top 5 options
        })

        const flights = (response.data as FlightOffer[]) || []

        // Save top 3 flights as suggestions
        for (const flight of flights.slice(0, 3)) {
          const firstSegment = flight.itineraries[0]?.segments[0]
          const lastSegment = flight.itineraries[0]?.segments[flight.itineraries[0].segments.length - 1]

          if (!firstSegment || !lastSegment) continue

          const price = parseFloat(flight.price.total)
          summary.estimatedTotalCost += price

          flightsToInsert.push({
            trip_id: tripId,
            flight_type: flight.itineraries.length > 1 ? 'round_trip' : 'one_way',
            airline: firstSegment.carrierCode || null,
            flight_number: firstSegment.number || null,
            departure_airport: firstSegment.departure.iataCode || '',
            departure_city: origin.city,
            arrival_airport: lastSegment.arrival.iataCode || '',
            arrival_city: dest.city,
            departure_datetime: firstSegment.departure.at || null,
            arrival_datetime: lastSegment.arrival.at || null,
            duration_minutes: parseDuration(flight.itineraries[0]?.duration),
            stops: flight.itineraries[0]?.segments.length - 1 || 0,
            cabin_class: flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY',
            price,
            currency: flight.price.currency,
            booking_status: 'suggested',
            provider: 'amadeus',
            external_id: flight.id,
          })
        }

        summary.flightsFound += Math.min(flights.length, 3)
      } catch (flightError) {
        console.error(`Flight search error for ${origin.city} → ${dest.city}:`, flightError)
        errors.push(`Flight search failed for ${origin.city} → ${dest.city}`)
      }
    }

    // Insert flights
    if (flightsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('flights')
        .insert(flightsToInsert)

      if (insertError) {
        console.error('Error inserting flights:', insertError)
        errors.push('Failed to save some flight suggestions')
      }
    }

    // 3. Search hotels at each destination
    const hotelsToInsert: Record<string, unknown>[] = []

    for (const dest of destinations) {
      const cityCode = getCityCode(dest.city)

      if (!cityCode) {
        errors.push(`Could not find city code for ${dest.city}`)
        continue
      }

      const checkIn = dest.arrival_date || typedTrip.start_date
      const checkOut = dest.departure_date || typedTrip.end_date

      if (!checkIn || !checkOut) {
        errors.push(`Missing dates for hotel search in ${dest.city}`)
        continue
      }

      try {
        const amadeus = getAmadeusClient()

        // First get hotel list by city
        const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: cityCode.toUpperCase(),
        })

        const hotelList = (hotelListResponse.data as { hotelId: string }[]) || []

        if (hotelList.length === 0) {
          errors.push(`No hotels found in ${dest.city}`)
          continue
        }

        // Get hotel offers for top hotels
        const hotelIds = hotelList.slice(0, 10).map((h) => h.hotelId)

        const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds: hotelIds.join(','),
          checkInDate: checkIn,
          checkOutDate: checkOut,
          adults: String(typedTrip.travelers_count || 1),
          roomQuantity: '1',
          currency: typedTrip.currency || 'USD',
        })

        const hotels = (offersResponse.data as HotelOffer[]) || []

        // Save top 3 hotels as suggestions
        for (const hotel of hotels.slice(0, 3)) {
          const offer = hotel.offers[0]
          if (!offer) continue

          const totalPrice = offer.price?.total ? parseFloat(offer.price.total) : null
          if (totalPrice) {
            summary.estimatedTotalCost += totalPrice
          }

          const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn))

          hotelsToInsert.push({
            trip_id: tripId,
            destination_id: dest.id,
            name: hotel.hotel.name,
            type: 'hotel',
            city: dest.city,
            country: dest.country,
            latitude: hotel.hotel.latitude,
            longitude: hotel.hotel.longitude,
            check_in_date: checkIn,
            check_out_date: checkOut,
            nights_count: nights,
            room_type: offer.room?.typeEstimated?.category || null,
            price_per_night: totalPrice ? totalPrice / nights : null,
            total_price: totalPrice,
            currency: offer.price?.currency || typedTrip.currency || 'USD',
            rating: hotel.hotel.rating ? parseInt(hotel.hotel.rating) : null,
            booking_status: 'suggested',
            provider: 'amadeus',
            external_id: hotel.hotel.hotelId,
          })
        }

        summary.hotelsFound += Math.min(hotels.length, 3)
      } catch (hotelError) {
        console.error(`Hotel search error for ${dest.city}:`, hotelError)
        errors.push(`Hotel search failed for ${dest.city}`)
      }
    }

    // Insert hotels
    if (hotelsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('accommodations')
        .insert(hotelsToInsert)

      if (insertError) {
        console.error('Error inserting hotels:', insertError)
        errors.push('Failed to save some hotel suggestions')
      }
    }

    // 4. Generate AI itinerary
    if (typedTrip.start_date && typedTrip.end_date) {
      try {
        const start = parseISO(typedTrip.start_date)
        const end = parseISO(typedTrip.end_date)
        const tripDays = differenceInDays(end, start) + 1

        const tripInfo = `
Destinations: ${destinations.map((d) => `${d.city}, ${d.country}`).join(' → ')}
Trip Duration: ${tripDays} days (${typedTrip.start_date} to ${typedTrip.end_date})
Budget: ${typedTrip.total_budget ? `${typedTrip.currency} ${typedTrip.total_budget}` : 'Not specified'}
Travel Style: ${typedTrip.travel_style || 'Balanced'}
Interests: ${typedTrip.interests?.join(', ') || 'General sightseeing'}
`.trim()

        const prompt = ITINERARY_GENERATION_PROMPT.replace('{tripInfo}', tripInfo)

        const result = await geminiProModel.generateContent(prompt)
        const responseText = result.response.text()

        // Parse the JSON response
        let itinerary
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            itinerary = JSON.parse(jsonMatch[0])
          }
        } catch {
          console.error('Failed to parse itinerary JSON')
          itinerary = generateFallbackItinerary(destinations, start, tripDays)
        }

        // Insert itinerary items
        if (itinerary?.days) {
          const itemsToInsert: Record<string, unknown>[] = []

          for (let dayIndex = 0; dayIndex < itinerary.days.length; dayIndex++) {
            const day = itinerary.days[dayIndex]
            const dayDate = day.date || format(addDays(start, dayIndex), 'yyyy-MM-dd')

            if (day.items) {
              for (let itemIndex = 0; itemIndex < day.items.length; itemIndex++) {
                const item = day.items[itemIndex]
                const estimatedCost = item.estimated_cost || 0
                summary.estimatedTotalCost += estimatedCost

                itemsToInsert.push({
                  trip_id: tripId,
                  date: dayDate,
                  time_slot: item.time_slot || 'morning',
                  start_time: item.start_time || null,
                  end_time: item.end_time || null,
                  title: item.title,
                  description: item.description || null,
                  category: item.category || 'sightseeing',
                  location_name: item.location_name || null,
                  estimated_cost: estimatedCost,
                  currency: typedTrip.currency || 'USD',
                  booking_required: item.booking_required || false,
                  tips: item.tips || null,
                  status: 'suggested',
                  order_index: itemIndex,
                })
              }
            }
          }

          if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('itinerary_items')
              .insert(itemsToInsert)

            if (insertError) {
              console.error('Error inserting itinerary:', insertError)
              errors.push('Failed to save itinerary suggestions')
            } else {
              summary.itineraryDaysGenerated = itinerary.days.length
            }
          }
        }
      } catch (itineraryError) {
        console.error('Itinerary generation error:', itineraryError)
        errors.push('Failed to generate AI itinerary')
      }
    } else {
      errors.push('Start and end dates required for itinerary generation')
    }

    return NextResponse.json({
      success: true,
      summary,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Trip planning error:', error)
    return NextResponse.json(
      { error: 'Failed to plan trip', details: String(error) },
      { status: 500 }
    )
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

// Fallback itinerary generator
function generateFallbackItinerary(
  destinations: TripDestination[],
  startDate: Date,
  tripDays: number
) {
  const days = []

  for (let i = 0; i < Math.min(tripDays, 7); i++) {
    const dayDate = format(addDays(startDate, i), 'yyyy-MM-dd')
    const destIndex = Math.floor(i / Math.ceil(tripDays / destinations.length))
    const destination = destinations[destIndex] || destinations[0]

    days.push({
      date: dayDate,
      title: `Day ${i + 1} in ${destination.city}`,
      items: [
        {
          time_slot: 'morning',
          title: `Explore ${destination.city}`,
          description: 'Start your day exploring the local area',
          category: 'sightseeing',
          location_name: destination.city,
          estimated_cost: 0,
          start_time: '09:00',
          end_time: '12:00',
          tips: 'Start early to avoid crowds',
          booking_required: false,
        },
        {
          time_slot: 'afternoon',
          title: 'Local Lunch',
          description: 'Try local cuisine at a recommended restaurant',
          category: 'food',
          location_name: destination.city,
          estimated_cost: 30,
          start_time: '12:30',
          end_time: '14:00',
          tips: 'Ask locals for recommendations',
          booking_required: false,
        },
        {
          time_slot: 'afternoon',
          title: 'Cultural Experience',
          description: 'Visit a local museum or cultural site',
          category: 'culture',
          location_name: destination.city,
          estimated_cost: 20,
          start_time: '14:30',
          end_time: '17:30',
          tips: 'Check opening hours in advance',
          booking_required: true,
        },
        {
          time_slot: 'evening',
          title: 'Dinner & Evening Walk',
          description: 'Enjoy dinner and explore the evening atmosphere',
          category: 'food',
          location_name: destination.city,
          estimated_cost: 50,
          start_time: '19:00',
          end_time: '22:00',
          tips: 'Book popular restaurants in advance',
          booking_required: false,
        },
      ],
    })
  }

  return { days }
}
