import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { getAmadeusClient, searchCityCode, type HotelOffer } from '@/lib/amadeus'
import { searchFlights, formatDuration, getStops, type DuffelFlightOffer } from '@/lib/duffel'
import { searchPlacesForTrip, estimateAttractionCost, type PlaceResult } from '@/lib/google-places'
import { geminiProModel } from '@/lib/gemini'
import { CAPACITY_DETERMINATION_PROMPT, PLACES_SELECTION_PROMPT, FLIGHT_SELECTION_PROMPT, HOTEL_SELECTION_PROMPT } from '@/lib/ai/prompts'
import { findCityCode } from '@/lib/city-codes'
import { lookupAirport } from '@/lib/airport-lookup'
import { getAirportCoordinates } from '@/lib/airports-data'
import { differenceInDays, format, addDays, parseISO, addWeeks } from 'date-fns'

// Create Supabase client with service role for background operations
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Valid categories for itinerary_items table
const VALID_CATEGORIES = ['activity', 'transport', 'meal', 'accommodation', 'flight', 'rest', 'other'] as const
type ValidCategory = typeof VALID_CATEGORIES[number]

// Map AI-generated categories to valid database categories
function mapCategory(category: string | undefined): ValidCategory {
  if (!category) return 'activity'

  const normalized = category.toLowerCase().trim()

  // Direct matches
  if (VALID_CATEGORIES.includes(normalized as ValidCategory)) {
    return normalized as ValidCategory
  }

  // Map common AI-generated categories
  const categoryMap: Record<string, ValidCategory> = {
    'sightseeing': 'activity',
    'tour': 'activity',
    'museum': 'activity',
    'landmark': 'activity',
    'attraction': 'activity',
    'culture': 'activity',
    'entertainment': 'activity',
    'shopping': 'activity',
    'nightlife': 'activity',
    'adventure': 'activity',
    'nature': 'activity',
    'beach': 'activity',
    'park': 'activity',
    'food': 'meal',
    'restaurant': 'meal',
    'dining': 'meal',
    'breakfast': 'meal',
    'lunch': 'meal',
    'dinner': 'meal',
    'cafe': 'meal',
    'coffee': 'meal',
    'bar': 'meal',
    'hotel': 'accommodation',
    'hostel': 'accommodation',
    'lodging': 'accommodation',
    'check-in': 'accommodation',
    'check-out': 'accommodation',
    'checkin': 'accommodation',
    'checkout': 'accommodation',
    'travel': 'transport',
    'transfer': 'transport',
    'taxi': 'transport',
    'train': 'transport',
    'bus': 'transport',
    'metro': 'transport',
    'subway': 'transport',
    'driving': 'transport',
    'relaxation': 'rest',
    'spa': 'rest',
    'free time': 'rest',
    'leisure': 'rest',
  }

  return categoryMap[normalized] || 'activity'
}

interface AutoPlanRequest {
  destination: {
    name: string
    coordinates: [number, number]
  }
  departureCity?: string
  startDate?: string
  endDate?: string
  travelers?: number
  budget?: number
  currency?: string
}

interface PlanningStatus {
  flights: 'pending' | 'in_progress' | 'completed' | 'error'
  itinerary: 'pending' | 'in_progress' | 'completed' | 'error'
  hotels: 'pending' | 'in_progress' | 'completed' | 'error'
  places: 'pending' | 'in_progress' | 'completed' | 'error'
  details: 'pending' | 'in_progress' | 'completed' | 'error'
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authClient = await createAuthClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to create a trip.' },
        { status: 401 }
      )
    }

    const body: AutoPlanRequest = await request.json()
    const supabase = createServiceClient()

    // Parse destination name to extract city and country
    const [cityName, ...rest] = body.destination.name.split(',').map(s => s.trim())
    const country = rest[rest.length - 1] || ''

    // Set default dates if not provided
    const startDate = body.startDate
      ? parseISO(body.startDate)
      : addWeeks(new Date(), 2)
    const endDate = body.endDate
      ? parseISO(body.endDate)
      : addDays(startDate, 7)

    const currency = body.currency || 'USD'
    const travelers = body.travelers || 1

    // Generate a temporary title (will be replaced by AI)
    const tempTitle = `Trip to ${cityName}`

    // 1. Create the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        title: tempTitle,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        total_budget: body.budget || null,
        currency,
        travelers_count: travelers,
        status: 'planning',
        travel_style: 'moderate',
        interests: ['culture', 'food', 'sightseeing'],
      })
      .select()
      .single()

    if (tripError || !trip) {
      console.error('Error creating trip:', tripError)
      return NextResponse.json(
        { error: 'Failed to create trip', details: tripError?.message },
        { status: 500 }
      )
    }

    const tripId = trip.id

    // 2. Create the destination
    const { error: destError } = await supabase
      .from('trip_destinations')
      .insert({
        trip_id: tripId,
        city: cityName,
        country,
        latitude: body.destination.coordinates[1],
        longitude: body.destination.coordinates[0],
        arrival_date: format(startDate, 'yyyy-MM-dd'),
        departure_date: format(endDate, 'yyyy-MM-dd'),
        order_index: 0,
      })

    if (destError) {
      console.error('Error creating destination:', destError)
    }

    // Store planning status in the database
    await supabase
      .from('trips')
      .update({
        planning_status: JSON.stringify({
          flights: 'pending',
          itinerary: 'pending',
          hotels: 'pending',
          places: 'pending',
          details: 'pending',
        } as PlanningStatus),
      })
      .eq('id', tripId)

    // Start the planning process in the background
    // We'll return immediately and let the client poll for status
    planTripAsync(tripId, {
      userId: user.id,
      cityName,
      country,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      coordinates: body.destination.coordinates,
      travelers,
      budget: body.budget,
      currency,
      departureCity: body.departureCity,
    }).catch(console.error)

    return NextResponse.json({
      tripId,
      status: 'planning',
      progress: {
        flights: 'pending',
        itinerary: 'pending',
        hotels: 'pending',
        places: 'pending',
        details: 'pending',
      },
    })
  } catch (error) {
    console.error('Auto-plan error:', error)
    return NextResponse.json(
      { error: 'Failed to start planning', details: String(error) },
      { status: 500 }
    )
  }
}

// Background planning function
async function planTripAsync(
  tripId: string,
  params: {
    userId: string
    cityName: string
    country: string
    startDate: string
    endDate: string
    coordinates: [number, number]
    travelers: number
    budget?: number
    currency: string
    departureCity?: string
  }
) {
  const supabase = createServiceClient()

  const updateStatus = async (step: keyof PlanningStatus, status: PlanningStatus[keyof PlanningStatus]) => {
    const { data: trip } = await supabase
      .from('trips')
      .select('planning_status')
      .eq('id', tripId)
      .single()

    const currentStatus: PlanningStatus = trip?.planning_status
      ? JSON.parse(trip.planning_status)
      : { flights: 'pending', itinerary: 'pending', hotels: 'pending', places: 'pending', details: 'pending' }

    currentStatus[step] = status

    await supabase
      .from('trips')
      .update({ planning_status: JSON.stringify(currentStatus) })
      .eq('id', tripId)
  }

  const tripDays = differenceInDays(parseISO(params.endDate), parseISO(params.startDate)) + 1

  try {
    // Step 1: Search flights using Duffel (if we have a departure city)
    await updateStatus('flights', 'in_progress')

    if (params.departureCity) {
      try {
        // Parse departure city to extract city name and country (format: "City, Country")
        const departureParts = params.departureCity.split(',').map(s => s.trim())
        const departureCityName = departureParts[0]
        const departureCountry = departureParts.length > 1 ? departureParts[departureParts.length - 1] : undefined

        // Use comprehensive airport lookup with multiple fallbacks
        console.log('Looking up origin airport...', departureCityName, departureCountry ? `in ${departureCountry}` : '')
        const originLookup = await lookupAirport(departureCityName, departureCountry)

        console.log('Looking up destination airport...')
        const destLookup = await lookupAirport(params.cityName, params.country)

        // Check if both airports were found and collect any errors
        const airportErrors: string[] = []

        if (!originLookup.success) {
          console.error('Could not find airport for origin:', params.departureCity)
          console.error('Error:', originLookup.error)
          airportErrors.push(`Could not find airport for departure city "${params.departureCity}". ${originLookup.error || 'No airport found in our database.'}`)
        }

        if (!destLookup.success) {
          console.error('Could not find airport for destination:', params.cityName)
          console.error('Error:', destLookup.error)
          airportErrors.push(`Could not find airport for destination "${params.cityName}". ${destLookup.error || 'No airport found in our database.'}`)
        }

        // Store all airport errors in trip description
        if (airportErrors.length > 0) {
          await supabase
            .from('trips')
            .update({
              description: `Note: ${airportErrors.join(' ')} Flights could not be searched.`,
            })
            .eq('id', tripId)
        }

        const originAirport = originLookup.iataCode
        const destAirport = destLookup.iataCode
        const originCity = originLookup.city || params.departureCity
        const destCity = destLookup.city || params.cityName

        console.log('Flight search - Origin:', params.departureCity, '->', originAirport, `(${originLookup.source})`)
        console.log('Flight search - Destination:', params.cityName, '->', destAirport, `(${destLookup.source})`)

        // Log any notes about nearest airports
        if (originLookup.note) console.log('Origin note:', originLookup.note)
        if (destLookup.note) console.log('Destination note:', destLookup.note)

        if (originAirport && destAirport) {
          // Search for ROUND-TRIP flights using Duffel API
          console.log('Searching round-trip flights with Duffel...')
          const flightResult = await searchFlights({
            origin: originAirport,
            destination: destAirport,
            departureDate: params.startDate,
            returnDate: params.endDate, // Add return date for round-trip
            passengers: params.travelers,
            currency: params.currency,
          })

          if (flightResult.success && flightResult.offers.length > 0) {
            console.log('Duffel round-trip flights found:', flightResult.offers.length)

            // Get destination ID
            const { data: dest } = await supabase
              .from('trip_destinations')
              .select('id')
              .eq('trip_id', tripId)
              .single()

            // Prepare flights for AI selection (top 10 for consideration)
            const flightsForAI = flightResult.offers.slice(0, 10).map(offer => {
              const outboundSlice = offer.slices[0]
              const returnSlice = offer.slices[1]

              // Parse durations
              const parseDuration = (dur?: string) => {
                const match = dur?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
                return match ? (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0') : 0
              }

              return {
                id: offer.id,
                price: parseFloat(offer.totalAmount),
                currency: offer.totalCurrency,
                airline: offer.owner?.name || 'Unknown',
                outbound: outboundSlice ? {
                  departure: outboundSlice.segments[0]?.departingAt,
                  arrival: outboundSlice.segments[outboundSlice.segments.length - 1]?.arrivingAt,
                  durationMinutes: parseDuration(outboundSlice.duration),
                  stops: outboundSlice.segments.length - 1,
                } : null,
                return: returnSlice ? {
                  departure: returnSlice.segments[0]?.departingAt,
                  arrival: returnSlice.segments[returnSlice.segments.length - 1]?.arrivingAt,
                  durationMinutes: parseDuration(returnSlice.duration),
                  stops: returnSlice.segments.length - 1,
                } : null,
              }
            })

            // AI selects the best flight
            let selectedOffer: DuffelFlightOffer | null = null

            try {
              console.log('AI selecting best flight from', flightsForAI.length, 'options...')
              const flightSelectionPrompt = FLIGHT_SELECTION_PROMPT
                .replace('{flightsJson}', JSON.stringify(flightsForAI, null, 2))
                .replace('{travelers}', String(params.travelers))
                .replace('{currency}', params.currency)

              const selectionResult = await geminiProModel.generateContent(flightSelectionPrompt)
              const selectionText = selectionResult.response.text()

              const jsonMatch = selectionText.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const selection = JSON.parse(jsonMatch[0])
                console.log('AI selected flight:', selection.selectedOfferId)
                console.log('Reasoning:', selection.reasoning)

                selectedOffer = flightResult.offers.find(o => o.id === selection.selectedOfferId) || null
              }
            } catch (aiError) {
              console.error('AI flight selection failed, using fallback:', aiError)
            }

            // Fallback: select cheapest flight if AI fails
            if (!selectedOffer) {
              console.log('Using fallback: selecting cheapest flight')
              selectedOffer = selectBestFlightFallback(flightResult.offers)
            }

            // Save the selected flight (both outbound and return slices)
            if (selectedOffer) {
              const flightsToInsert: Record<string, unknown>[] = []

              // Process each slice (outbound and return)
              for (let sliceIndex = 0; sliceIndex < selectedOffer.slices.length; sliceIndex++) {
                const slice = selectedOffer.slices[sliceIndex]
                if (!slice || !slice.segments[0]) continue

                const isOutbound = sliceIndex === 0
                const firstSegment = slice.segments[0]
                const lastSegment = slice.segments[slice.segments.length - 1]

                const carrierCode = firstSegment.carrier?.iataCode || selectedOffer.owner?.iataCode || ''
                const flightNum = firstSegment.flightNumber || ''

                const durationMatch = slice.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
                const durationMinutes = durationMatch
                  ? (parseInt(durationMatch[1] || '0') * 60) + parseInt(durationMatch[2] || '0')
                  : null

                const depAirportCode = firstSegment.origin?.iataCode || (isOutbound ? originAirport : destAirport)
                const arrAirportCode = lastSegment?.destination?.iataCode || (isOutbound ? destAirport : originAirport)
                const depCoords = getAirportCoordinates(depAirportCode)
                const arrCoords = getAirportCoordinates(arrAirportCode)

                flightsToInsert.push({
                  trip_id: tripId,
                  destination_id: dest?.id,
                  departure_city: isOutbound ? originCity : destCity,
                  departure_airport: depAirportCode,
                  arrival_city: isOutbound ? destCity : originCity,
                  arrival_airport: arrAirportCode,
                  departure_datetime: firstSegment.departingAt,
                  arrival_datetime: lastSegment?.arrivingAt,
                  airline: selectedOffer.owner?.name || selectedOffer.owner?.iataCode || 'Unknown',
                  flight_number: carrierCode && flightNum ? `${carrierCode}${flightNum}` : null,
                  duration_minutes: durationMinutes,
                  stops: slice.segments.length - 1,
                  // For round-trip: each slice is priced as half of total (approximate)
                  price: parseFloat(selectedOffer.totalAmount) / selectedOffer.slices.length,
                  currency: selectedOffer.totalCurrency,
                  booking_status: 'saved',
                  provider: 'duffel',
                  external_id: selectedOffer.id,
                  raw_data: {
                    offer_id: selectedOffer.id,
                    owner: selectedOffer.owner,
                    slice_type: isOutbound ? 'outbound' : 'return',
                    total_offer_price: parseFloat(selectedOffer.totalAmount),
                  },
                  departure_latitude: depCoords?.lat || null,
                  departure_longitude: depCoords?.lng || null,
                  arrival_latitude: arrCoords?.lat || null,
                  arrival_longitude: arrCoords?.lng || null,
                })
              }

              if (flightsToInsert.length > 0) {
                const { error: flightError } = await supabase.from('flights').insert(flightsToInsert)
                if (flightError) {
                  console.error('Error inserting flights:', flightError)
                } else {
                  console.log('Inserted', flightsToInsert.length, 'flights (round-trip) from AI selection')
                }
              }
            }
          } else {
            console.log('No flights found or error:', flightResult.error)
          }
        } else {
          console.log('Could not find airport codes for flight search')
        }
      } catch (flightError) {
        console.error('Flight search error:', flightError)
      }
    } else {
      console.log('No departure city provided, skipping flight search')
    }

    await updateStatus('flights', 'completed')

    // Step 2: Places-First Itinerary Generation
    // 2a: AI determines capacity (how many places to visit)
    await updateStatus('itinerary', 'in_progress')

    const travelStyle = 'moderate' // Default travel style
    const interests = ['culture', 'food', 'sightseeing'] // Default interests

    let capacity = {
      placesPerDay: 3,
      totalPlaces: tripDays * 3,
      breakdown: {
        attractions: Math.ceil(tripDays * 2),
        restaurants: Math.ceil(tripDays * 1.5),
        museums: Math.ceil(tripDays * 0.5),
        parks: Math.ceil(tripDays * 0.3),
      },
      reasoning: 'Default moderate travel style',
    }

    try {
      console.log('Step 2a: AI determining capacity...')
      const capacityPrompt = CAPACITY_DETERMINATION_PROMPT
        .replace('{destination}', `${params.cityName}, ${params.country}`)
        .replace('{days}', String(tripDays))
        .replace('{travelStyle}', travelStyle)
        .replace('{interests}', interests.join(', '))

      const capacityResult = await geminiProModel.generateContent(capacityPrompt)
      const capacityText = capacityResult.response.text()

      try {
        const jsonMatch = capacityText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          capacity = JSON.parse(jsonMatch[0])
          console.log('AI capacity determined:', capacity.totalPlaces, 'places over', tripDays, 'days')
        }
      } catch (parseError) {
        console.error('Failed to parse capacity JSON, using defaults:', parseError)
      }
    } catch (error) {
      console.error('Capacity determination failed, using defaults:', error)
    }

    // 2b: Fetch real places from Google Places API based on capacity
    console.log('Step 2b: Fetching real places from Google...')
    let allPlaces: Array<PlaceResult & { category: string }> = []

    try {
      const placesResult = await searchPlacesForTrip(
        params.cityName,
        {
          latitude: params.coordinates[1],
          longitude: params.coordinates[0],
        },
        interests,
        {
          maxAttractions: Math.max(capacity.breakdown.attractions + 5, 15),
          maxRestaurants: Math.max(capacity.breakdown.restaurants + 3, 10),
          maxMuseums: Math.max(capacity.breakdown.museums + 2, 5),
          maxParks: Math.max(capacity.breakdown.parks + 2, 5),
        }
      )

      // Tag places with their category
      allPlaces = [
        ...placesResult.attractions.map(p => ({ ...p, category: 'attraction' })),
        ...placesResult.restaurants.map(p => ({ ...p, category: 'restaurant' })),
        ...placesResult.museums.map(p => ({ ...p, category: 'museum' })),
        ...placesResult.parks.map(p => ({ ...p, category: 'park' })),
      ]
      console.log('Fetched', allPlaces.length, 'real places from Google')
    } catch (error) {
      console.error('Google Places fetch failed:', error)
    }

    // 2c: AI selects and organizes places into itinerary
    let itinerary: Array<{
      day: number
      date: string
      theme: string
      activities: Array<{
        placeId: string
        timeSlot: string
        startTime: string
        endTime: string
        notes: string
      }>
    }> = []

    if (allPlaces.length > 0) {
      try {
        console.log('Step 2c: AI selecting and organizing places...')

        // Prepare places for AI selection (simplified format)
        const placesForAI = allPlaces.map(p => ({
          id: p.id,
          name: p.displayName?.text || 'Unknown',
          category: p.category,
          rating: p.rating || 0,
          address: p.formattedAddress || '',
          lat: p.location?.latitude,
          lng: p.location?.longitude,
        }))

        const selectionPrompt = PLACES_SELECTION_PROMPT
          .replace('{placesJson}', JSON.stringify(placesForAI, null, 2))
          .replace('{destination}', `${params.cityName}, ${params.country}`)
          .replace('{startDate}', params.startDate)
          .replace('{endDate}', params.endDate)
          .replace('{days}', String(tripDays))
          .replace('{travelStyle}', travelStyle)
          .replace('{interests}', interests.join(', '))
          .replace('{placesPerDay}', String(capacity.placesPerDay))

        const selectionResult = await geminiProModel.generateContent(selectionPrompt)
        const selectionText = selectionResult.response.text()

        try {
          const jsonMatch = selectionText.match(/\[[\s\S]*\]/)
          if (jsonMatch) {
            itinerary = JSON.parse(jsonMatch[0])
            console.log('AI organized', itinerary.length, 'days of itinerary')
          }
        } catch (parseError) {
          console.error('Failed to parse selection JSON:', parseError)
        }
      } catch (error) {
        console.error('AI selection failed:', error)
      }
    }

    // 2d: Save itinerary items with real coordinates
    try {
      const itemsToInsert: Record<string, unknown>[] = []

      if (itinerary.length > 0 && allPlaces.length > 0) {
        // Create a lookup map for places
        const placesMap = new Map(allPlaces.map(p => [p.id, p]))

        for (const day of itinerary) {
          const dayDate = day.date || format(addDays(parseISO(params.startDate), day.day - 1), 'yyyy-MM-dd')

          for (let actIndex = 0; actIndex < day.activities.length; actIndex++) {
            const activity = day.activities[actIndex]
            const place = placesMap.get(activity.placeId)

            if (place) {
              // Estimate attraction cost based on category and price level
              const estimatedCost = estimateAttractionCost(
                place.category,
                place.priceLevel,
                place.types
              )

              itemsToInsert.push({
                trip_id: tripId,
                date: dayDate,
                time_slot: activity.timeSlot || 'morning',
                start_time: activity.startTime || null,
                end_time: activity.endTime || null,
                title: place.displayName?.text || 'Activity',
                description: place.editorialSummary?.text || null,
                category: mapCategory(place.category === 'restaurant' ? 'meal' : 'activity'),
                location_name: place.displayName?.text || null,
                location_address: place.formattedAddress || null,
                // REAL COORDINATES from Google Places!
                latitude: place.location?.latitude || null,
                longitude: place.location?.longitude || null,
                estimated_cost: estimatedCost,
                currency: params.currency,
                booking_required: estimatedCost > 0, // If it costs money, likely needs booking
                tips: activity.notes || null,
                status: 'planned',
                order_index: actIndex,
              })
            }
          }
        }
      }

      // Fallback: if no AI itinerary, use fallback generator
      if (itemsToInsert.length === 0) {
        console.log('Using fallback itinerary generator...')
        const fallbackItinerary = generateFallbackItinerary(params.cityName, parseISO(params.startDate), tripDays)

        for (let dayIndex = 0; dayIndex < fallbackItinerary.days.length; dayIndex++) {
          const day = fallbackItinerary.days[dayIndex]
          const dayDate = day.date || format(addDays(parseISO(params.startDate), dayIndex), 'yyyy-MM-dd')

          if (day.items) {
            for (let itemIndex = 0; itemIndex < day.items.length; itemIndex++) {
              const item = day.items[itemIndex]

              itemsToInsert.push({
                trip_id: tripId,
                date: dayDate,
                time_slot: item.time_slot || 'morning',
                start_time: item.start_time || null,
                end_time: item.end_time || null,
                title: item.title,
                description: item.description || null,
                category: mapCategory(item.category),
                location_name: item.location_name || null,
                // Fallback items don't have addresses or coordinates
                estimated_cost: item.estimated_cost || 0,
                currency: params.currency,
                booking_required: item.booking_required || false,
                tips: item.tips || null,
                status: 'planned',
                order_index: itemIndex,
              })
            }
          }
        }
      }

      if (itemsToInsert.length > 0) {
        const { error: itineraryError } = await supabase.from('itinerary_items').insert(itemsToInsert)
        if (itineraryError) {
          console.error('Error inserting itinerary:', itineraryError)
        } else {
          console.log('Inserted', itemsToInsert.length, 'itinerary items with real coordinates')
        }
      }

      await updateStatus('itinerary', 'completed')
    } catch (error) {
      console.error('Itinerary insert error:', error)
      await updateStatus('itinerary', 'error')
    }

    // Step 3: Search hotels
    await updateStatus('hotels', 'in_progress')

    try {
      // Try static lookup first, then fall back to Amadeus API search
      let cityData = findCityCode(params.cityName)
      let cityCode = cityData?.city

      // If static lookup fails, use Amadeus Location API with country context
      if (!cityCode) {
        console.log('Static lookup failed for hotel city, trying Amadeus API...')
        const dynamicCity = await searchCityCode(params.cityName, params.country)
        if (dynamicCity) {
          cityCode = dynamicCity.cityCode
          console.log('Found city via Amadeus API:', dynamicCity.cityName, '->', cityCode, 'in', dynamicCity.countryName)
        }
      }

      console.log('Hotel search - City:', params.cityName, '->', cityCode)

      if (cityCode) {
        const amadeus = getAmadeusClient()

        // Get hotel list by city
        console.log('Searching hotels in city code:', cityCode.toUpperCase())
        const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
          cityCode: cityCode.toUpperCase(),
        })

        const hotelList = (hotelListResponse.data as { hotelId: string }[]) || []
        console.log('Hotels found in city:', hotelList.length)

        if (hotelList.length > 0) {
          // Shuffle hotels to get variety (don't always query the same first 10)
          const shuffledHotels = [...hotelList].sort(() => Math.random() - 0.5)

          // Create batches of 10 hotels (Amadeus limit per request)
          const batchSize = 10
          const maxBatches = Math.min(5, Math.ceil(shuffledHotels.length / batchSize)) // Query up to 50 hotels
          const allOffers: HotelOffer[] = []

          console.log(`Searching hotel offers in batches (up to ${maxBatches} batches of ${batchSize})...`)

          for (let batchIndex = 0; batchIndex < maxBatches; batchIndex++) {
            // Stop if we have enough offers (5+)
            if (allOffers.length >= 5) {
              console.log(`Found ${allOffers.length} offers, stopping batch search`)
              break
            }

            const batchStart = batchIndex * batchSize
            const batchHotels = shuffledHotels.slice(batchStart, batchStart + batchSize)
            const hotelIds = batchHotels.map(h => h.hotelId)

            console.log(`Batch ${batchIndex + 1}: Searching offers for ${hotelIds.length} hotels...`)

            try {
              const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
                hotelIds: hotelIds.join(','),
                checkInDate: params.startDate,
                checkOutDate: params.endDate,
                adults: String(params.travelers),
                roomQuantity: '1',
                currency: params.currency,
              })

              const batchOffers = (offersResponse.data as HotelOffer[]) || []
              console.log(`Batch ${batchIndex + 1}: Found ${batchOffers.length} offers`)
              allOffers.push(...batchOffers)
            } catch (batchError) {
              console.error(`Batch ${batchIndex + 1} error:`, batchError)
              // Continue to next batch on error
            }
          }

          const hotels = allOffers
          console.log('Total hotel offers found:', hotels.length)

          // Get destination ID
          const { data: dest } = await supabase
            .from('trip_destinations')
            .select('id')
            .eq('trip_id', tripId)
            .single()

          // Get total flight cost for price reasonability check
          const { data: savedFlights } = await supabase
            .from('flights')
            .select('price')
            .eq('trip_id', tripId)

          const totalFlightCost = savedFlights?.reduce((sum, f) => sum + (f.price || 0), 0) || 0
          console.log('Total flight cost for hotel selection:', totalFlightCost, params.currency)

          const nights = tripDays - 1

          // Prepare hotels for AI selection (top 10 for consideration)
          const hotelsForAI = hotels.slice(0, 10).map(hotel => {
            const totalPrice = parseFloat(hotel.offers[0]?.price?.total || '0')
            return {
              id: hotel.hotel.hotelId,
              name: hotel.hotel.name,
              rating: hotel.hotel.rating || 'N/A',
              totalPrice,
              pricePerNight: nights > 0 ? Math.round(totalPrice / nights) : totalPrice,
              roomType: hotel.offers[0]?.room?.typeEstimated?.category || 'Standard',
              priceRatio: totalFlightCost > 0 ? (totalPrice / totalFlightCost).toFixed(2) : 'N/A',
            }
          })

          // AI selects the best hotel
          let selectedHotel: HotelOffer | null = null

          try {
            console.log('AI selecting best hotel from', hotelsForAI.length, 'options...')
            const hotelSelectionPrompt = HOTEL_SELECTION_PROMPT
              .replace('{hotelsJson}', JSON.stringify(hotelsForAI, null, 2))
              .replace('{destination}', `${params.cityName}, ${params.country}`)
              .replace('{nights}', String(nights))
              .replace('{travelers}', String(params.travelers))
              .replace('{flightCost}', String(Math.round(totalFlightCost)))
              .replace(/{currency}/g, params.currency)

            const selectionResult = await geminiProModel.generateContent(hotelSelectionPrompt)
            const selectionText = selectionResult.response.text()

            const jsonMatch = selectionText.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const selection = JSON.parse(jsonMatch[0])
              console.log('AI selected hotel:', selection.selectedHotelId)
              console.log('Reasoning:', selection.reasoning)

              selectedHotel = hotels.find(h => h.hotel.hotelId === selection.selectedHotelId) || null
            }
          } catch (aiError) {
            console.error('AI hotel selection failed, using fallback:', aiError)
          }

          // Fallback: select best hotel based on price/rating ratio if AI fails
          if (!selectedHotel) {
            console.log('Using fallback: selecting best value hotel')
            selectedHotel = selectBestHotelFallback(hotels, totalFlightCost, nights)
          }

          // Save the selected hotel
          const hotelsToInsert: Record<string, unknown>[] = []

          if (selectedHotel) {
            const offer = selectedHotel.offers[0]
            if (offer) {
              const totalPrice = offer.price?.total ? parseFloat(offer.price.total) : null

              hotelsToInsert.push({
                trip_id: tripId,
                destination_id: dest?.id,
                name: selectedHotel.hotel.name,
                type: 'hotel',
                city: params.cityName,
                country: params.country,
                latitude: selectedHotel.hotel.latitude,
                longitude: selectedHotel.hotel.longitude,
                check_in_date: params.startDate,
                check_out_date: params.endDate,
                nights_count: nights,
                room_type: offer.room?.typeEstimated?.category || null,
                price_per_night: totalPrice && nights > 0 ? totalPrice / nights : null,
                total_price: totalPrice,
                currency: offer.price?.currency || params.currency,
                rating: selectedHotel.hotel.rating ? parseInt(selectedHotel.hotel.rating) : null,
                booking_status: 'saved',
                provider: 'amadeus',
                external_id: selectedHotel.hotel.hotelId,
              })
            }
          }

          if (hotelsToInsert.length > 0) {
            const { error: hotelError } = await supabase.from('accommodations').insert(hotelsToInsert)
            if (hotelError) {
              console.error('Error inserting hotels:', hotelError)
            } else {
              console.log('Inserted AI-selected hotel:', hotelsToInsert[0]?.name)
            }
          }
        } else {
          console.log('No hotels found for city code:', cityCode)
        }
      } else {
        console.log('Could not find city code for:', params.cityName)
      }

      await updateStatus('hotels', 'completed')
    } catch (error) {
      console.error('Hotel search error:', error)
      await updateStatus('hotels', 'error')
    }

    // Step 4: Save discovered places to saved_places table (reuse places from Step 2)
    await updateStatus('places', 'in_progress')

    try {
      console.log('Saving discovered places to database...')

      // Get destination ID
      const { data: dest } = await supabase
        .from('trip_destinations')
        .select('id')
        .eq('trip_id', tripId)
        .single()

      // Save places to saved_places table (reusing allPlaces from Step 2)
      const placesToInsert: Record<string, unknown>[] = []

      if (allPlaces.length > 0) {
        // Use the places we already fetched in Step 2b
        for (const place of allPlaces) {
          placesToInsert.push(mapPlaceToSavedPlace(
            place,
            params.userId,
            tripId,
            dest?.id,
            place.category,
            params.cityName,
            params.country
          ))
        }
      } else {
        // Fallback: fetch places if Step 2 didn't fetch them
        console.log('No places from Step 2, fetching from Google Places...')
        const placesResult = await searchPlacesForTrip(
          params.cityName,
          {
            latitude: params.coordinates[1],
            longitude: params.coordinates[0],
          },
          interests
        )

        // Process attractions
        for (const place of placesResult.attractions.slice(0, 8)) {
          placesToInsert.push(mapPlaceToSavedPlace(place, params.userId, tripId, dest?.id, 'attraction', params.cityName, params.country))
        }

        // Process restaurants
        for (const place of placesResult.restaurants.slice(0, 5)) {
          placesToInsert.push(mapPlaceToSavedPlace(place, params.userId, tripId, dest?.id, 'restaurant', params.cityName, params.country))
        }

        // Process museums
        for (const place of placesResult.museums.slice(0, 3)) {
          placesToInsert.push(mapPlaceToSavedPlace(place, params.userId, tripId, dest?.id, 'museum', params.cityName, params.country))
        }

        // Process parks
        for (const place of placesResult.parks.slice(0, 3)) {
          placesToInsert.push(mapPlaceToSavedPlace(place, params.userId, tripId, dest?.id, 'park', params.cityName, params.country))
        }
      }

      if (placesToInsert.length > 0) {
        const { error: placesError } = await supabase.from('saved_places').insert(placesToInsert)
        if (placesError) {
          console.error('Error inserting places:', placesError)
        } else {
          console.log('Inserted', placesToInsert.length, 'places to saved_places')
        }
      }

      await updateStatus('places', 'completed')
    } catch (error) {
      console.error('Places save error:', error)
      await updateStatus('places', 'error')
    }

    // Step 5: Generate AI title and description
    await updateStatus('details', 'in_progress')

    // Default fallback details
    let details = {
      title: `${tripDays} Days in ${params.cityName}`,
      description: `Explore the best of ${params.cityName}, ${params.country}`
    }

    try {
      const titlePrompt = `Generate a creative and engaging trip title (max 50 characters) and description (max 200 characters) for a ${tripDays}-day trip to ${params.cityName}, ${params.country}.

Return ONLY valid JSON in this exact format:
{"title": "Your creative title here", "description": "Your engaging description here"}`

      console.log('Generating title with AI...')
      const titleResult = await geminiProModel.generateContent(titlePrompt)
      const titleText = titleResult.response.text()

      try {
        const jsonMatch = titleText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          details = JSON.parse(jsonMatch[0])
          console.log('AI title generated:', details.title)
        }
      } catch {
        console.error('Failed to parse title JSON, using fallback')
      }
    } catch (error) {
      console.error('Title generation AI error, using fallback:', error)
    }

    // Update trip with title and description (either AI or fallback)
    await supabase
      .from('trips')
      .update({
        title: details.title,
        description: details.description,
        status: 'active',
      })
      .eq('id', tripId)

    await updateStatus('details', 'completed')

  } catch (error) {
    console.error('Planning error:', error)

    // Mark trip as having errors but still active
    await supabase
      .from('trips')
      .update({ status: 'active' })
      .eq('id', tripId)
  }
}

// Fallback itinerary generator - uses valid database categories
function generateFallbackItinerary(cityName: string, startDate: Date, tripDays: number) {
  const days = []

  for (let i = 0; i < Math.min(tripDays, 7); i++) {
    const dayDate = format(addDays(startDate, i), 'yyyy-MM-dd')

    days.push({
      date: dayDate,
      title: `Day ${i + 1} in ${cityName}`,
      items: [
        {
          time_slot: 'morning',
          title: `Explore ${cityName}`,
          description: 'Start your day exploring the local area',
          category: 'activity',
          location_name: cityName,
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
          category: 'meal',
          location_name: cityName,
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
          category: 'activity',
          location_name: cityName,
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
          category: 'meal',
          location_name: cityName,
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

// Helper function to map Google Places result to saved_places table format
function mapPlaceToSavedPlace(
  place: PlaceResult,
  userId: string,
  tripId: string,
  destinationId: string | undefined,
  category: string,
  cityName: string,
  country: string
): Record<string, unknown> {
  return {
    user_id: userId,
    trip_id: tripId,
    destination_id: destinationId,
    name: place.displayName?.text || 'Unknown Place',
    description: place.editorialSummary?.text || null,
    category,
    address: place.formattedAddress || null,
    city: cityName,
    country: country,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    rating: place.rating || null,
    review_count: place.userRatingCount || null,
    price_level: mapPriceLevel(place.priceLevel),
    website: place.websiteUri || null,
    photos: place.photos?.slice(0, 5).map(p => p.name) || [],
    tags: place.types?.slice(0, 10) || [],
    external_id: place.id || null,
    provider: 'google_places',
    is_visited: false,
  }
}

// Convert Google price level to database enum
function mapPriceLevel(priceLevel?: string): string | null {
  if (!priceLevel) return null
  const levels: Record<string, string> = {
    'PRICE_LEVEL_FREE': 'free',
    'PRICE_LEVEL_INEXPENSIVE': 'cheap',
    'PRICE_LEVEL_MODERATE': 'moderate',
    'PRICE_LEVEL_EXPENSIVE': 'expensive',
    'PRICE_LEVEL_VERY_EXPENSIVE': 'very_expensive',
  }
  return levels[priceLevel] ?? null
}

/**
 * Fallback flight selection - selects the best flight based on scoring
 * Used when AI selection fails
 */
function selectBestFlightFallback(offers: DuffelFlightOffer[]): DuffelFlightOffer | null {
  if (offers.length === 0) return null

  // Parse duration from ISO format (PT2H30M) to minutes
  const parseDuration = (dur?: string): number => {
    const match = dur?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    return match ? (parseInt(match[1] || '0') * 60) + parseInt(match[2] || '0') : 0
  }

  // Score each offer - lower is better
  const scored = offers.map(offer => {
    const price = parseFloat(offer.totalAmount)

    // Calculate total duration across all slices
    let totalDuration = 0
    let totalStops = 0
    for (const slice of offer.slices) {
      totalDuration += parseDuration(slice.duration)
      totalStops += slice.segments.length - 1
    }

    // Scoring: price + (duration in hours * 10) + (stops * 50)
    // This prioritizes price but penalizes long flights and layovers
    const score = price + (totalDuration / 60 * 10) + (totalStops * 50)

    return { offer, score }
  })

  // Sort by score (ascending) and return the best
  scored.sort((a, b) => a.score - b.score)
  return scored[0].offer
}

/**
 * Fallback hotel selection - selects the best hotel based on price/rating ratio
 * Used when AI selection fails
 */
function selectBestHotelFallback(
  hotels: HotelOffer[],
  flightCost: number,
  nights: number
): HotelOffer | null {
  if (hotels.length === 0) return null

  // Score each hotel - lower is better
  const scored = hotels.map(hotel => {
    const totalPrice = parseFloat(hotel.offers[0]?.price?.total || '0')
    const rating = parseInt(hotel.hotel.rating || '3')

    // Calculate price ratio (hotel total / flight cost)
    // Ideal ratio is around 1.0-1.5 for moderate budget
    const priceRatio = flightCost > 0 ? totalPrice / flightCost : 1

    // Penalty for deviating from ideal ratio (1.5)
    const ratioPenalty = Math.abs(priceRatio - 1.5) * 100

    // Rating bonus (higher rating = lower score)
    const ratingBonus = (5 - rating) * 20

    // Extra penalty if hotel costs more than 3x flight cost
    const overbudgetPenalty = priceRatio > 3 ? 500 : 0

    const score = ratioPenalty + ratingBonus + overbudgetPenalty

    return { hotel, score, totalPrice }
  })

  // Sort by score (ascending) and return the best
  scored.sort((a, b) => a.score - b.score)
  return scored[0].hotel
}
