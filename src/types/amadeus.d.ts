declare module 'amadeus' {
  interface AmadeusOptions {
    clientId: string
    clientSecret: string
    hostname?: string
  }

  interface AmadeusResponse<T = unknown> {
    data: T
    result: {
      dictionaries?: Record<string, Record<string, string>>
      meta?: Record<string, unknown>
    }
  }

  interface FlightOffersSearchParams {
    originLocationCode: string
    destinationLocationCode: string
    departureDate: string
    returnDate?: string
    adults: string
    travelClass?: string
    nonStop?: boolean
    currencyCode?: string
    max?: string
    maxPrice?: string
  }

  interface HotelOffersSearchParams {
    hotelIds: string
    checkInDate: string
    checkOutDate: string
    adults: string
    roomQuantity?: string
    currency?: string
    priceRange?: string
    ratings?: string
    amenities?: string
  }

  interface HotelsByCity {
    cityCode: string
  }

  interface HotelsByGeocode {
    latitude: number
    longitude: number
    radius?: number
    radiusUnit?: string
  }

  interface LocationSearchParams {
    keyword: string
    subType?: string
  }

  class Amadeus {
    constructor(options: AmadeusOptions)

    shopping: {
      flightOffersSearch: {
        get(params: FlightOffersSearchParams | Record<string, string | boolean>): Promise<AmadeusResponse>
      }
      hotelOffersSearch: {
        get(params: HotelOffersSearchParams | Record<string, string>): Promise<AmadeusResponse>
      }
    }

    referenceData: {
      locations: {
        get(params: LocationSearchParams): Promise<AmadeusResponse>
        hotels: {
          byCity: {
            get(params: HotelsByCity): Promise<AmadeusResponse>
          }
          byGeocode: {
            get(params: HotelsByGeocode): Promise<AmadeusResponse>
          }
        }
      }
    }
  }

  export default Amadeus
}
