import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { getAmadeusClient, searchCityCode } from '@/lib/amadeus'
import { searchFlights, formatDuration, getStops } from '@/lib/duffel'
import { searchPlacesForTrip, estimateAttractionCost } from '@/lib/google-places'
import { geminiProModel } from '@/lib/gemini'
import { lookupAirport } from '@/lib/airport-lookup'
import { getAirportCoordinates } from '@/lib/airports-data'
import { smartAirportLookup } from '@/lib/ai-airport-lookup'
import { differenceInDays, format, addDays, parseISO } from 'date-fns'

// Create Supabase client with service role
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface AutoGenerateRequest {
  destination: string
  departureCity: string
  startDate: string
  endDate: string
  travelers: number
  budget?: 'budget' | 'mid-range' | 'luxury'
  pace?: 'relaxed' | 'moderate' | 'active'
}

// Detect if destination is city, region, or country
async function analyzeDestination(destination: string): Promise<{
  type: 'city' | 'region' | 'country'
  searchRadius: number
  cities: string[]
}> {
  // Common country names
  const countries = ['japan', 'italy', 'france', 'spain', 'germany', 'greece', 'thailand', 'vietnam', 'australia', 'brazil', 'mexico', 'egypt', 'morocco', 'india', 'portugal', 'netherlands', 'croatia', 'turkey']
  
  // Common region names
  const regions = ['tuscany', 'provence', 'andalusia', 'bavaria', 'catalonia', 'amalfi coast', 'french riviera', 'scottish highlands', 'cinque terre', 'lake district', 'cotswolds']
  
  const lowerDest = destination.toLowerCase()
  
  if (countries.some(c => lowerDest.includes(c))) {
    return {
      type: 'country',
      searchRadius: 50000, // 50km for major cities
      cities: await getCountryCities(destination)
    }
  }
  
  if (regions.some(r => lowerDest.includes(r))) {
    return {
      type: 'region',
      searchRadius: 30000, // 30km
      cities: await getRegionCities(destination)
    }
  }
  
  // Default: treat as city
  return {
    type: 'city',
    searchRadius: 15000, // 15km
    cities: [destination]
  }
}

async function getCountryCities(country: string): Promise<string[]> {
  // Return major tourist cities for common countries
  const cityMap: Record<string, string[]> = {
    'japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    'italy': ['Rome', 'Florence', 'Venice', 'Milan'],
    'france': ['Paris', 'Nice', 'Lyon', 'Marseille'],
    'spain': ['Barcelona', 'Madrid', 'Seville', 'Valencia'],
    'greece': ['Athens', 'Santorini', 'Mykonos'],
    'thailand': ['Bangkok', 'Chiang Mai', 'Phuket'],
    'portugal': ['Lisbon', 'Porto', 'Sintra'],
  }
  
  const lowerCountry = country.toLowerCase()
  for (const [key, cities] of Object.entries(cityMap)) {
    if (lowerCountry.includes(key)) {
      return cities
    }
  }
  
  return [country] // Fallback to using the input as-is
}

async function getRegionCities(region: string): Promise<string[]> {
  const regionMap: Record<string, string[]> = {
    'tuscany': ['Florence', 'Siena', 'Pisa', 'San Gimignano'],
    'provence': ['Nice', 'Avignon', 'Aix-en-Provence'],
    'andalusia': ['Seville', 'Granada', 'Cordoba', 'Malaga'],
    'amalfi coast': ['Positano', 'Amalfi', 'Ravello'],
  }
  
  const lowerRegion = region.toLowerCase()
  for (const [key, cities] of Object.entries(regionMap)) {
    if (lowerRegion.includes(key)) {
      return cities
    }
  }
  
  return [region]
}

// Select best flight automatically
function selectBestFlight(flights: any[], budget: string): any {
  if (!flights || flights.length === 0) return null
  
  // Sort by value score (price/duration balance)
  const scored = flights.map(flight => {
    const price = parseFloat(flight.totalAmount || flight.price?.total || '9999')
    const stops = flight.slices?.[0]?.segments?.length - 1 || flight.itineraries?.[0]?.segments?.length - 1 || 0
    
    // Score: lower is better
    let score = price
    if (budget === 'budget') {
      score = price // Prioritize price
    } else if (budget === 'luxury') {
      score = price + (stops * 200) // Penalize stops more
    } else {
      score = price + (stops * 100) // Balanced
    }
    
    return { flight, score }
  })
  
  scored.sort((a, b) => a.score - b.score)
  return scored[0]?.flight
}

// Select best hotel automatically
function selectBestHotel(hotels: any[], budget: string): any {
  if (!hotels || hotels.length === 0) return null
  
  const scored = hotels.map(hotel => {
    const price = parseFloat(hotel.offers?.[0]?.price?.total || hotel.price?.total || '9999')
    const rating = parseFloat(hotel.hotel?.rating || '3')
    
    let score: number
    if (budget === 'budget') {
      score = price - (rating * 10) // Slight bump for rating
    } else if (budget === 'luxury') {
      score = price - (rating * 100) // Heavy weight on rating
    } else {
      score = price - (rating * 50) // Balanced
    }
    
    return { hotel, score }
  })
  
  scored.sort((a, b) => a.score - b.score)
  return scored[0]?.hotel
}

export async function POST(request: NextRequest) {
  try {
    const body: AutoGenerateRequest = await request.json()
    const { destination, departureCity, startDate, endDate, travelers, budget = 'mid-range', pace = 'moderate' } = body

    // Validate required fields
    if (!destination || !departureCity || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()
    const authClient = await createAuthClient()
    
    // Get user if logged in
    const { data: { user } } = await authClient.auth.getUser()
    
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const tripDays = differenceInDays(end, start) + 1
    const nights = tripDays - 1

    console.log('Starting auto-generation for:', destination, 'from', departureCity)

    // Step 1: Analyze destination
    const destAnalysis = await analyzeDestination(destination)
    console.log('Destination analysis:', destAnalysis)

    // Step 2: Get airport codes (with AI fallback)
    let departureAirport = await searchCityCode(departureCity)
    let destinationAirport = await searchCityCode(destAnalysis.cities[0])
    
    // If Amadeus fails, try smart AI-powered lookup
    if (!departureAirport) {
      console.log(`Amadeus failed for "${departureCity}", trying AI lookup...`)
      const aiResult = await smartAirportLookup(departureCity)
      if (aiResult) {
        departureAirport = {
          cityCode: aiResult.cityCode,
          airportCode: aiResult.airportCode,
          cityName: aiResult.cityName,
          countryName: aiResult.countryName,
        }
      }
    }
    
    if (!destinationAirport) {
      console.log(`Amadeus failed for "${destAnalysis.cities[0]}", trying AI lookup...`)
      const aiResult = await smartAirportLookup(destAnalysis.cities[0])
      if (aiResult) {
        destinationAirport = {
          cityCode: aiResult.cityCode,
          airportCode: aiResult.airportCode,
          cityName: aiResult.cityName,
          countryName: aiResult.countryName,
        }
      }
    }
    
    if (!departureAirport || !destinationAirport) {
      return NextResponse.json(
        { error: 'Could not find airports for the specified cities. Please try using major city names.' },
        { status: 400 }
      )
    }

    console.log('Airports:', departureAirport.airportCode, '->', destinationAirport.airportCode)

    // Step 3: Search flights (using Duffel for better results)
    let outboundFlight = null
    let returnFlight = null
    let flightPrice = 0

    try {
      const flightResults = await searchFlights({
        origin: departureAirport.airportCode,
        destination: destinationAirport.airportCode,
        departureDate: startDate,
        returnDate: endDate,
        passengers: travelers,
        cabinClass: budget === 'luxury' ? 'business' : 'economy'
      })

      if (flightResults.success && flightResults.offers && flightResults.offers.length > 0) {
        const selectedFlight = selectBestFlight(flightResults.offers, budget)
        if (selectedFlight) {
          flightPrice = parseFloat(selectedFlight.totalAmount || '0') * travelers
          outboundFlight = {
            airline: selectedFlight.owner?.name || selectedFlight.slices?.[0]?.segments?.[0]?.carrier?.name || 'Unknown',
            flightNumber: selectedFlight.slices?.[0]?.segments?.[0]?.flightNumber || 'TBD',
            departureAirport: departureAirport.airportCode,
            departureCity: departureCity,
            arrivalAirport: destinationAirport.airportCode,
            arrivalCity: destAnalysis.cities[0],
            departureTime: selectedFlight.slices?.[0]?.departingAt,
            arrivalTime: selectedFlight.slices?.[0]?.arrivingAt,
            price: flightPrice / 2,
            stops: selectedFlight.slices?.[0]?.segments?.length - 1 || 0,
          }
          
          if (selectedFlight.slices?.[1]) {
            returnFlight = {
              airline: selectedFlight.owner?.name || selectedFlight.slices?.[1]?.segments?.[0]?.carrier?.name || 'Unknown',
              flightNumber: selectedFlight.slices?.[1]?.segments?.[0]?.flightNumber || 'TBD',
              departureAirport: destinationAirport.airportCode,
              departureCity: destAnalysis.cities[0],
              arrivalAirport: departureAirport.airportCode,
              arrivalCity: departureCity,
              departureTime: selectedFlight.slices?.[1]?.departingAt,
              arrivalTime: selectedFlight.slices?.[1]?.arrivingAt,
              price: flightPrice / 2,
              stops: selectedFlight.slices?.[1]?.segments?.length - 1 || 0,
            }
          }
        }
      }
    } catch (flightError) {
      console.error('Flight search error:', flightError)
      // Continue without flights - we can still generate the trip
    }

    // Step 4: Search hotels
    let selectedHotel = null
    let hotelPrice = 0

    try {
      const amadeus = getAmadeusClient()
      console.log('Searching hotels in city:', destinationAirport.cityCode)
      
      const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: destinationAirport.cityCode,
      })

      const hotelList = hotelListResponse.data as { hotelId: string }[]
      console.log('Found', hotelList?.length || 0, 'hotels in city')
      
      if (hotelList && hotelList.length > 0) {
        const hotelIds = hotelList.slice(0, 15).map((h) => h.hotelId)
        
        const hotelOffers = await amadeus.shopping.hotelOffersSearch.get({
          hotelIds: hotelIds.join(','),
          checkInDate: startDate,
          checkOutDate: endDate,
          adults: travelers.toString(),
          roomQuantity: Math.ceil(travelers / 2).toString(),
        })

        const hotelData = hotelOffers.data as any[]
        console.log('Hotel offers found:', hotelData?.length || 0)

        if (hotelData && hotelData.length > 0) {
          // Log first hotel structure for debugging
          console.log('First hotel structure:', JSON.stringify(hotelData[0], null, 2).slice(0, 500))

          selectedHotel = selectBestHotel(hotelData, budget)
          if (selectedHotel) {
            hotelPrice = parseFloat(selectedHotel.offers?.[0]?.price?.total || '0')
            console.log('Selected hotel:', selectedHotel.hotel?.name, 'price:', hotelPrice)
            console.log('Selected hotel full:', JSON.stringify(selectedHotel, null, 2).slice(0, 500))
          } else {
            console.log('selectBestHotel returned null')
          }
        }
      }
    } catch (hotelError: any) {
      console.error('Hotel search error:', hotelError?.message || hotelError)
      console.error('Hotel search stack:', hotelError?.stack)
    }

    // Step 5: Search POIs using Google Places
    let places: any[] = []
    try {
      // Get coordinates for the destination
      const destCoordinates = destinationAirport?.airportCode
        ? getAirportCoordinates(destinationAirport.airportCode)
        : null

      if (destCoordinates && destCoordinates.lat !== 0 && destCoordinates.lng !== 0) {
        const placesResult = await searchPlacesForTrip(
          destAnalysis.cities[0],
          { latitude: destCoordinates.lat, longitude: destCoordinates.lng },
          ['tourist_attraction', 'museum', 'restaurant', 'park', 'landmark']
        )
        // Combine all place types into a single array
        places = [
          ...placesResult.attractions,
          ...placesResult.restaurants,
          ...placesResult.museums,
          ...placesResult.parks,
        ]
      } else {
        console.warn('Could not get coordinates for destination, skipping places search')
      }
    } catch (placesError) {
      console.error('Places search error:', placesError)
    }

    // Step 6: Generate itinerary with Gemini
    const activitiesPerDay = pace === 'relaxed' ? 2 : pace === 'active' ? 5 : 3
    
    const itineraryPrompt = `
You are a travel planning AI. Create a ${tripDays}-day itinerary for ${destination}.

Trip Details:
- Duration: ${tripDays} days (${startDate} to ${endDate})
- Travelers: ${travelers}
- Budget: ${budget}
- Pace: ${pace} (${activitiesPerDay} activities per day)
- Destination type: ${destAnalysis.type}
${destAnalysis.type !== 'city' ? `- Cities to visit: ${destAnalysis.cities.join(', ')}` : ''}

Available attractions (use these when possible):
${places.slice(0, 20).map(p => `- ${p.displayName?.text}: ${p.primaryTypeDisplayName?.text || p.primaryType || 'attraction'}`).join('\n')}

Generate a JSON response with this structure:
{
  "title": "Trip title",
  "description": "Brief trip description",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        {
          "name": "Activity name",
          "description": "Brief description",
          "category": "sightseeing|food|culture|nature|adventure",
          "startTime": "09:00",
          "duration": 120,
          "estimatedCost": 25
        }
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Make the itinerary practical with:
- Geographically clustered activities (minimize travel between locations)
- Appropriate timing (opening hours, travel time)
- Mix of experiences based on the pace
- Include meals at local restaurants
- Start mornings easy (near hotel)

Return ONLY valid JSON, no markdown.`

    let itinerary: any = null
    try {
      const result = await geminiProModel.generateContent(itineraryPrompt)
      const text = result.response.text()
      
      // Clean and parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[0])
      }
    } catch (aiError) {
      console.error('AI itinerary error:', aiError)
    }

    // Step 7: Calculate total price
    const activitiesCost = itinerary?.days?.reduce((total: number, day: any) => {
      return total + (day.activities?.reduce((dayTotal: number, act: any) => dayTotal + (act.estimatedCost || 0), 0) || 0)
    }, 0) || 0
    
    const estimatedMeals = tripDays * travelers * (budget === 'budget' ? 30 : budget === 'luxury' ? 100 : 50)
    const totalPrice = flightPrice + hotelPrice + (activitiesCost * travelers) + estimatedMeals

    // Step 8: Create trip in database (only if user is logged in)
    const tripData = {
      user_id: user?.id,
      title: itinerary?.title || `Trip to ${destination}`,
      description: itinerary?.description || `${tripDays}-day trip to ${destination}`,
      start_date: startDate,
      end_date: endDate,
      travelers_count: travelers,
      total_budget: totalPrice,
      currency: 'USD',
      status: 'planning',
      trip_type: 'leisure',
      travel_style: pace,
      interests: [],
      planning_status: JSON.stringify({
        flights: outboundFlight ? 'completed' : 'pending',
        hotels: selectedHotel ? 'completed' : 'pending',
        itinerary: itinerary ? 'completed' : 'pending',
        places: places.length > 0 ? 'completed' : 'pending',
        details: 'completed'
      })
    }

    // If no user, return preview without saving
    if (!user) {
      console.log('No user logged in - returning preview')
      return NextResponse.json({
        success: true,
        preview: true,
        message: 'Sign up to save this trip!',
        trip: {
          title: tripData.title,
          description: tripData.description,
          startDate,
          endDate,
          travelers,
          totalBudget: totalPrice,
        },
        flights: outboundFlight ? [outboundFlight, returnFlight].filter(Boolean) : [],
        hotel: selectedHotel ? {
          name: selectedHotel.hotel?.name,
          rating: selectedHotel.hotel?.rating,
          price: hotelPrice,
        } : null,
        itinerary: itinerary?.days || [],
        places: places.slice(0, 10).map(p => ({
          name: p.displayName?.text,
          type: p.primaryType,
          rating: p.rating,
        })),
        summary: {
          destination,
          dates: `${startDate} to ${endDate}`,
          travelers,
          totalPrice,
          flightPrice,
          hotelPrice,
          hasFlights: !!outboundFlight,
          hasHotel: !!selectedHotel,
          activitiesCount: itinerary?.days?.reduce((sum: number, d: any) => sum + (d.activities?.length || 0), 0) || 0
        }
      })
    }

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .insert(tripData)
      .select()
      .single()

    if (tripError) {
      console.error('Trip creation error:', tripError)
      return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
    }

    // Step 9: Create destination
    const { data: destData } = await supabase
      .from('trip_destinations')
      .insert({
        trip_id: trip.id,
        city: destAnalysis.cities[0],
        country: destination,
        arrival_date: startDate,
        departure_date: endDate,
        order_index: 0
      })
      .select()
      .single()

    // Step 10: Create flights
    if (outboundFlight) {
      console.log('Saving outbound flight:', outboundFlight.airline, outboundFlight.flightNumber)
      const { error: outboundError } = await supabase.from('flights').insert({
        trip_id: trip.id,
        flight_type: 'outbound',
        airline: outboundFlight.airline,
        flight_number: outboundFlight.flightNumber,
        departure_airport: outboundFlight.departureAirport,
        departure_city: outboundFlight.departureCity,
        arrival_airport: outboundFlight.arrivalAirport,
        arrival_city: outboundFlight.arrivalCity,
        departure_datetime: outboundFlight.departureTime,
        arrival_datetime: outboundFlight.arrivalTime,
        price: outboundFlight.price,
        stops: outboundFlight.stops,
        booking_status: 'saved'
      })
      if (outboundError) console.error('Outbound flight insert error:', outboundError)
    } else {
      console.log('No outbound flight to save')
    }

    if (returnFlight) {
      console.log('Saving return flight:', returnFlight.airline, returnFlight.flightNumber)
      const { error: returnError } = await supabase.from('flights').insert({
        trip_id: trip.id,
        flight_type: 'return',
        airline: returnFlight.airline,
        flight_number: returnFlight.flightNumber,
        departure_airport: returnFlight.departureAirport,
        departure_city: returnFlight.departureCity,
        arrival_airport: returnFlight.arrivalAirport,
        arrival_city: returnFlight.arrivalCity,
        departure_datetime: returnFlight.departureTime,
        arrival_datetime: returnFlight.arrivalTime,
        price: returnFlight.price,
        stops: returnFlight.stops,
        booking_status: 'saved'
      })
      if (returnError) console.error('Return flight insert error:', returnError)
    }

    // Step 11: Create hotel
    if (selectedHotel) {
      console.log('Saving hotel:', selectedHotel.hotel?.name, 'price:', hotelPrice)
      const { error: hotelError } = await supabase.from('accommodations').insert({
        trip_id: trip.id,
        name: selectedHotel.hotel?.name || 'Selected Hotel',
        type: 'hotel',
        city: destAnalysis.cities[0],
        check_in_date: startDate,
        check_out_date: endDate,
        nights_count: nights,
        total_price: hotelPrice,
        rating: parseFloat(selectedHotel.hotel?.rating || '4'),
        booking_status: 'saved'
      })
      if (hotelError) {
        console.error('Hotel insert error:', hotelError)
      }
    } else {
      console.log('No hotel selected to save')
    }

    // Step 12: Create itinerary items
    if (itinerary?.days) {
      for (const day of itinerary.days) {
        for (const activity of day.activities || []) {
          await supabase.from('itinerary_items').insert({
            trip_id: trip.id,
            destination_id: destData?.id,
            date: day.date || format(addDays(parseISO(startDate), day.dayNumber - 1), 'yyyy-MM-dd'),
            title: activity.name,
            description: activity.description,
            category: mapCategory(activity.category),
            start_time: activity.startTime,
            estimated_cost: activity.estimatedCost,
            status: 'planned'
          })
        }
      }
    }

    // Step 13: Save POIs as saved_places
    for (const place of places.slice(0, 15)) {
      if (user?.id) {
        await supabase.from('saved_places').insert({
          user_id: user.id,
          trip_id: trip.id,
          name: place.displayName?.text || 'Unknown Place',
          category: place.primaryType,
          address: place.formattedAddress,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude,
          rating: place.rating,
          review_count: place.userRatingCount
        })
      }
    }

    console.log('Trip created successfully:', trip.id)

    return NextResponse.json({
      success: true,
      tripId: trip.id,
      summary: {
        destination,
        dates: `${startDate} to ${endDate}`,
        travelers,
        totalPrice,
        flightPrice,
        hotelPrice,
        hasFlights: !!outboundFlight,
        hasHotel: !!selectedHotel,
        activitiesCount: itinerary?.days?.reduce((sum: number, d: any) => sum + (d.activities?.length || 0), 0) || 0
      }
    })

  } catch (error: any) {
    console.error('Auto-generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate trip' },
      { status: 500 }
    )
  }
}

// Map AI categories to valid database categories
function mapCategory(category: string): string {
  const mapping: Record<string, string> = {
    'sightseeing': 'activity',
    'food': 'meal',
    'culture': 'activity',
    'nature': 'activity',
    'adventure': 'activity',
    'shopping': 'activity',
    'entertainment': 'activity',
    'relaxation': 'rest',
  }
  return mapping[category?.toLowerCase()] || 'activity'
}
