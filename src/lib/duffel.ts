import { Duffel } from '@duffel/api'

// Initialize Duffel client
// NOTE: Always use live mode to get real flights with actual prices
// Test mode only returns mock data without budget airlines (Ryanair, Wizz Air, etc.)
const duffel = new Duffel({
  token: process.env.DUFFEL_API_TOKEN!,
})

export interface DuffelFlightOffer {
  id: string
  owner: {
    name: string
    iataCode: string
    logoUrl?: string
  }
  slices: Array<{
    id: string
    origin: {
      iataCode: string
      name: string
      cityName: string
    }
    destination: {
      iataCode: string
      name: string
      cityName: string
    }
    departingAt: string
    arrivingAt: string
    duration: string
    segments: Array<{
      id: string
      aircraft?: { name: string }
      carrier: {
        name: string
        iataCode: string
        logoUrl?: string
      }
      operatingCarrier?: {
        name: string
        iataCode: string
      }
      flightNumber: string
      origin: {
        iataCode: string
        name: string
        cityName: string
        terminal?: string
      }
      destination: {
        iataCode: string
        name: string
        cityName: string
        terminal?: string
      }
      departingAt: string
      arrivingAt: string
      duration: string
    }>
  }>
  totalAmount: string
  totalCurrency: string
  baseCurrency: string
  baseAmount: string
  taxAmount: string
  taxCurrency: string
  passengers: Array<{
    id: string
    type: string
  }>
}

export interface FlightSearchParams {
  origin: string // IATA code
  destination: string // IATA code
  departureDate: string // YYYY-MM-DD
  returnDate?: string // YYYY-MM-DD for round trips
  passengers: number
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first'
  currency?: string
  maxConnections?: 0 | 1 | 2
}

export interface FlightSearchResult {
  success: boolean
  offers: DuffelFlightOffer[]
  error?: string
}

/**
 * Search for flights using Duffel API
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  try {
    console.log('Duffel flight search:', params.origin, '->', params.destination, 'on', params.departureDate)

    // Build slices (one-way or round-trip)
    const slices = [
      {
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departureDate,
      },
    ]

    // Add return slice for round trips
    if (params.returnDate) {
      slices.push({
        origin: params.destination,
        destination: params.origin,
        departure_date: params.returnDate,
      })
    }

    // Build passengers array
    const passengers = []
    for (let i = 0; i < params.passengers; i++) {
      passengers.push({ type: 'adult' as const })
    }

    // Create offer request
    // Using type assertion because Duffel SDK types require optional time fields
    const offerRequest = await duffel.offerRequests.create({
      slices: slices as Parameters<typeof duffel.offerRequests.create>[0]['slices'],
      passengers: passengers as Parameters<typeof duffel.offerRequests.create>[0]['passengers'],
      cabin_class: params.cabinClass || 'economy',
      return_offers: true, // Return offers in the response directly
      max_connections: (params.maxConnections ?? 1) as 0 | 1 | 2, // Default to max 1 stop
    })

    // Get the offers from the response
    const offers = (offerRequest.data.offers || []) as unknown as DuffelFlightOffer[]

    console.log('Duffel found', offers.length, 'flight offers')

    // Sort by price and return top results
    const sortedOffers = offers
      .sort((a, b) => parseFloat(a.totalAmount) - parseFloat(b.totalAmount))
      .slice(0, 10) // Return top 10 results

    return {
      success: true,
      offers: sortedOffers,
    }
  } catch (error) {
    console.error('Duffel flight search error:', error)

    // Handle specific Duffel errors
    if (error instanceof Error) {
      return {
        success: false,
        offers: [],
        error: error.message,
      }
    }

    return {
      success: false,
      offers: [],
      error: 'Failed to search flights',
    }
  }
}

/**
 * Format Duffel duration (ISO 8601) to readable string
 */
export function formatDuration(isoDuration: string): string {
  // PT2H30M -> 2h 30m
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return isoDuration

  const hours = match[1] ? `${match[1]}h` : ''
  const minutes = match[2] ? `${match[2]}m` : ''
  return `${hours} ${minutes}`.trim()
}

/**
 * Calculate number of stops from slices
 */
export function getStops(offer: DuffelFlightOffer): number {
  const firstSlice = offer.slices[0]
  return firstSlice ? firstSlice.segments.length - 1 : 0
}

/**
 * Get marketing airline from offer
 */
export function getAirline(offer: DuffelFlightOffer): { name: string; code: string; logo?: string } {
  return {
    name: offer.owner.name,
    code: offer.owner.iataCode,
    logo: offer.owner.logoUrl,
  }
}

export { duffel }
