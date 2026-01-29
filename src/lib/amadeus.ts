import Amadeus from 'amadeus'

// Lazy-initialized Amadeus client (server-side only)
let amadeusClient: Amadeus | null = null

export function getAmadeusClient(): Amadeus {
  if (!amadeusClient) {
    if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
      throw new Error('Amadeus credentials not configured')
    }
    amadeusClient = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET,
    })
  }
  return amadeusClient
}

// Types for Amadeus responses
export interface FlightOffer {
  type: string
  id: string
  source: string
  instantTicketingRequired: boolean
  nonHomogeneous: boolean
  oneWay: boolean
  lastTicketingDate: string
  numberOfBookableSeats: number
  itineraries: Itinerary[]
  price: Price
  pricingOptions: PricingOptions
  validatingAirlineCodes: string[]
  travelerPricings: TravelerPricing[]
}

export interface Itinerary {
  duration: string
  segments: Segment[]
}

export interface Segment {
  departure: FlightEndpoint
  arrival: FlightEndpoint
  carrierCode: string
  number: string
  aircraft: { code: string }
  operating?: { carrierCode: string }
  duration: string
  id: string
  numberOfStops: number
  blacklistedInEU: boolean
}

export interface FlightEndpoint {
  iataCode: string
  terminal?: string
  at: string
}

export interface Price {
  currency: string
  total: string
  base: string
  fees?: Fee[]
  grandTotal: string
}

export interface Fee {
  amount: string
  type: string
}

export interface PricingOptions {
  fareType: string[]
  includedCheckedBagsOnly: boolean
}

export interface TravelerPricing {
  travelerId: string
  fareOption: string
  travelerType: string
  price: Price
  fareDetailsBySegment: FareDetails[]
}

export interface FareDetails {
  segmentId: string
  cabin: string
  fareBasis: string
  class: string
  includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number }
}

// Hotel types
export interface HotelOffer {
  type: string
  hotel: Hotel
  available: boolean
  offers: HotelOfferDetails[]
}

export interface Hotel {
  type: string
  hotelId: string
  chainCode?: string
  dupeId?: string
  name: string
  cityCode: string
  latitude?: number
  longitude?: number
  address?: HotelAddress
  amenities?: string[]
  rating?: string
  contact?: HotelContact
}

export interface HotelAddress {
  lines?: string[]
  cityName?: string
  countryCode?: string
  postalCode?: string
}

export interface HotelContact {
  phone?: string
  fax?: string
  email?: string
}

export interface HotelOfferDetails {
  id: string
  checkInDate: string
  checkOutDate: string
  rateCode?: string
  rateFamilyEstimated?: { code: string; type: string }
  room: Room
  guests: GuestInfo
  price: HotelPrice
  policies?: HotelPolicies
}

export interface Room {
  type?: string
  typeEstimated?: {
    category?: string
    beds?: number
    bedType?: string
  }
  description?: { text?: string; lang?: string }
}

export interface GuestInfo {
  adults: number
}

export interface HotelPrice {
  currency: string
  base?: string
  total: string
  variations?: {
    average?: { base?: string }
    changes?: { startDate: string; endDate: string; base?: string }[]
  }
}

export interface HotelPolicies {
  cancellation?: {
    deadline?: string
    amount?: string
    numberOfNights?: number
    description?: { text?: string }
  }
  paymentType?: string
  guarantee?: {
    acceptedPayments?: { methods?: string[] }
  }
}

// Location/Airport types
export interface Location {
  type: string
  subType: string
  name: string
  detailedName?: string
  id: string
  self?: { href: string; methods: string[] }
  iataCode: string
  address?: {
    cityName?: string
    cityCode?: string
    countryName?: string
    countryCode?: string
    regionCode?: string
  }
  geoCode?: {
    latitude: number
    longitude: number
  }
}

// Airline info
export interface Airline {
  type: string
  iataCode: string
  icaoCode?: string
  businessName: string
  commonName?: string
}

// Helper functions
export function formatDuration(duration: string): string {
  // Convert ISO 8601 duration (PT2H30M) to readable format (2h 30m)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return duration

  const hours = match[1] ? `${match[1]}h` : ''
  const minutes = match[2] ? ` ${match[2]}m` : ''
  return `${hours}${minutes}`.trim()
}

export function formatDateTime(dateTime: string): { date: string; time: string } {
  const date = new Date(dateTime)
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}

export function calculateLayover(arrival: string, departure: string): string {
  const arrivalTime = new Date(arrival).getTime()
  const departureTime = new Date(departure).getTime()
  const diffMs = departureTime - arrivalTime
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

// Search result for city/airport lookup
export interface CitySearchResult {
  cityCode: string
  airportCode: string
  cityName: string
  countryName: string
}

/**
 * Remove diacritics/accents from a string for API compatibility
 * e.g., "Tiranë" -> "Tirane", "València" -> "Valencia"
 */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Remove any remaining special characters
}

/**
 * Search for city and airport codes using Amadeus Location API
 * This allows supporting any city worldwide without a static list
 * @param cityName - The city name to search for
 * @param country - Optional country name to filter results (helps avoid geographical confusion)
 */
export async function searchCityCode(cityName: string, country?: string): Promise<CitySearchResult | null> {
  try {
    const amadeus = getAmadeusClient()

    // Remove diacritics for Amadeus API compatibility
    const normalizedName = removeDiacritics(cityName)
    console.log('Amadeus search - normalized:', cityName, '->', normalizedName, country ? `in ${country}` : '')

    // Search for cities matching the keyword
    const response = await amadeus.referenceData.locations.get({
      keyword: normalizedName,
      subType: 'CITY,AIRPORT',
    })

    let locations = (response.data as Location[]) || []

    if (locations.length === 0) {
      console.log('No locations found for:', cityName)
      return null
    }

    // If country is provided, filter to prefer matches in that country
    if (country) {
      const normalizedCountry = country.toLowerCase().trim()

      // Try to find matches in the specified country
      const countryMatches = locations.filter(loc => {
        const locCountry = (loc.address?.countryName || '').toLowerCase()
        return locCountry.includes(normalizedCountry) || normalizedCountry.includes(locCountry)
      })

      // If we found matches in the right country, use those
      if (countryMatches.length > 0) {
        console.log(`Found ${countryMatches.length} matches in ${country}`)
        locations = countryMatches
      } else {
        console.log(`No matches found in ${country}, using all ${locations.length} results`)
      }
    }

    // Find the best match - prefer CITY type, then AIRPORT
    const cityMatch = locations.find(loc => loc.subType === 'CITY')
    const airportMatch = locations.find(loc => loc.subType === 'AIRPORT')

    if (cityMatch) {
      console.log(`Selected city: ${cityMatch.name} (${cityMatch.iataCode}) in ${cityMatch.address?.countryName}`)
      return {
        cityCode: cityMatch.iataCode,
        airportCode: airportMatch?.iataCode || cityMatch.iataCode,
        cityName: cityMatch.address?.cityName || cityMatch.name,
        countryName: cityMatch.address?.countryName || '',
      }
    }

    if (airportMatch) {
      console.log(`Selected airport: ${airportMatch.name} (${airportMatch.iataCode}) in ${airportMatch.address?.countryName}`)
      return {
        cityCode: airportMatch.address?.cityCode || airportMatch.iataCode,
        airportCode: airportMatch.iataCode,
        cityName: airportMatch.address?.cityName || airportMatch.name,
        countryName: airportMatch.address?.countryName || '',
      }
    }

    // Fallback to first result
    const first = locations[0]
    console.log(`Fallback to first result: ${first.name} (${first.iataCode}) in ${first.address?.countryName}`)
    return {
      cityCode: first.address?.cityCode || first.iataCode,
      airportCode: first.iataCode,
      cityName: first.address?.cityName || first.name,
      countryName: first.address?.countryName || '',
    }
  } catch (error) {
    console.error('Error searching city code:', error)
    return null
  }
}
