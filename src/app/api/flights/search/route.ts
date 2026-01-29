import { NextRequest, NextResponse } from 'next/server'
import { getAmadeusClient, type FlightOffer } from '@/lib/amadeus'

export async function GET(request: NextRequest) {
  try {
    const amadeus = getAmadeusClient()
    const searchParams = request.nextUrl.searchParams

    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const adults = searchParams.get('adults') || '1'
    const travelClass = searchParams.get('travelClass') || 'ECONOMY'
    const nonStop = searchParams.get('nonStop') === 'true'
    const maxPrice = searchParams.get('maxPrice')
    const currencyCode = searchParams.get('currencyCode') || 'USD'

    // Validate required parameters
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination, departureDate' },
        { status: 400 }
      )
    }

    // Build search parameters
    const searchParameters: Record<string, string | boolean> = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults,
      travelClass,
      currencyCode,
      max: '50', // Limit results
    }

    if (returnDate) {
      searchParameters.returnDate = returnDate
    }

    if (nonStop) {
      searchParameters.nonStop = true
    }

    if (maxPrice) {
      searchParameters.maxPrice = maxPrice
    }

    // Search for flight offers
    const response = await amadeus.shopping.flightOffersSearch.get(searchParameters)

    const flightOffers = response.data as FlightOffer[]

    // Get dictionaries for airline names and locations
    const dictionaries = response.result?.dictionaries || {}

    return NextResponse.json({
      data: flightOffers,
      dictionaries,
      meta: {
        count: flightOffers.length,
      },
    })
  } catch (error) {
    console.error('Flight search error:', error)

    // Handle Amadeus API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const amadeusError = error as { response: { statusCode: number; result: { errors?: { detail?: string }[] } } }
      return NextResponse.json(
        {
          error: 'Flight search failed',
          details: amadeusError.response?.result?.errors?.[0]?.detail || 'Unknown error'
        },
        { status: amadeusError.response?.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Location/Airport search endpoint
export async function POST(request: NextRequest) {
  try {
    const amadeus = getAmadeusClient()
    const body = await request.json()
    const { keyword, subType = 'CITY,AIRPORT' } = body

    if (!keyword || keyword.length < 2) {
      return NextResponse.json(
        { error: 'Keyword must be at least 2 characters' },
        { status: 400 }
      )
    }

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType,
    })

    return NextResponse.json({
      data: response.data,
    })
  } catch (error) {
    console.error('Location search error:', error)
    return NextResponse.json(
      { error: 'Location search failed' },
      { status: 500 }
    )
  }
}
