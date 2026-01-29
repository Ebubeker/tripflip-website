import { NextRequest, NextResponse } from 'next/server'
import { getAmadeusClient, type HotelOffer } from '@/lib/amadeus'

// Search hotels by city
export async function GET(request: NextRequest) {
  try {
    const amadeus = getAmadeusClient()
    const searchParams = request.nextUrl.searchParams

    const cityCode = searchParams.get('cityCode')
    const checkInDate = searchParams.get('checkInDate')
    const checkOutDate = searchParams.get('checkOutDate')
    const adults = searchParams.get('adults') || '1'
    const roomQuantity = searchParams.get('roomQuantity') || '1'
    const priceRange = searchParams.get('priceRange')
    const currency = searchParams.get('currency') || 'USD'
    const ratings = searchParams.get('ratings') // e.g., "3,4,5"
    const amenities = searchParams.get('amenities') // e.g., "WIFI,POOL"

    // Validate required parameters
    if (!cityCode || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: cityCode, checkInDate, checkOutDate' },
        { status: 400 }
      )
    }

    // First, get hotel list by city
    const hotelListResponse = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: cityCode.toUpperCase(),
    })

    const hotelList = hotelListResponse.data as { hotelId: string }[]
    if (!hotelList || hotelList.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { count: 0 },
      })
    }

    // Get hotel IDs (limit to first 20 for performance)
    const hotelIds = hotelList
      .slice(0, 20)
      .map((hotel) => hotel.hotelId)

    // Build search parameters for hotel offers
    const searchParameters: Record<string, string> = {
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults,
      roomQuantity,
      currency,
    }

    if (priceRange) {
      searchParameters.priceRange = priceRange
    }

    if (ratings) {
      searchParameters.ratings = ratings
    }

    if (amenities) {
      searchParameters.amenities = amenities
    }

    // Search for hotel offers
    const offersResponse = await amadeus.shopping.hotelOffersSearch.get(searchParameters)

    const hotelOffers = offersResponse.data as HotelOffer[]

    return NextResponse.json({
      data: hotelOffers,
      meta: {
        count: hotelOffers.length,
      },
    })
  } catch (error) {
    console.error('Hotel search error:', error)

    // Handle Amadeus API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const amadeusError = error as { response: { statusCode: number; result: { errors?: { detail?: string }[] } } }
      return NextResponse.json(
        {
          error: 'Hotel search failed',
          details: amadeusError.response?.result?.errors?.[0]?.detail || 'Unknown error',
        },
        { status: amadeusError.response?.statusCode || 500 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Search hotels by geo coordinates
export async function POST(request: NextRequest) {
  try {
    const amadeus = getAmadeusClient()
    const body = await request.json()
    const {
      latitude,
      longitude,
      radius = 5,
      radiusUnit = 'KM',
      checkInDate,
      checkOutDate,
      adults = 1,
      roomQuantity = 1,
      currency = 'USD',
    } = body

    // Validate required parameters
    if (!latitude || !longitude || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude, longitude, checkInDate, checkOutDate' },
        { status: 400 }
      )
    }

    // Get hotels by geo coordinates
    const hotelListResponse = await amadeus.referenceData.locations.hotels.byGeocode.get({
      latitude,
      longitude,
      radius,
      radiusUnit,
    })

    const hotelList = hotelListResponse.data as { hotelId: string }[]
    if (!hotelList || hotelList.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { count: 0 },
      })
    }

    // Get hotel IDs (limit to first 20 for performance)
    const hotelIds = hotelList
      .slice(0, 20)
      .map((hotel) => hotel.hotelId)

    // Search for hotel offers
    const offersResponse = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate,
      checkOutDate,
      adults: adults.toString(),
      roomQuantity: roomQuantity.toString(),
      currency,
    })

    const hotelOffers = offersResponse.data as HotelOffer[]

    return NextResponse.json({
      data: hotelOffers,
      meta: {
        count: hotelOffers.length,
      },
    })
  } catch (error) {
    console.error('Hotel geo search error:', error)
    return NextResponse.json({ error: 'Hotel search failed' }, { status: 500 })
  }
}
