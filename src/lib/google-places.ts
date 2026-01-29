/**
 * Google Places API (New) client for places of interest
 * https://developers.google.com/maps/documentation/places/web-service/op-overview
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!
const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1'

export interface PlacePhoto {
  name: string
  widthPx: number
  heightPx: number
  authorAttributions: Array<{
    displayName: string
    uri: string
  }>
}

export interface PlaceResult {
  id: string
  displayName: {
    text: string
    languageCode: string
  }
  formattedAddress: string
  location: {
    latitude: number
    longitude: number
  }
  rating?: number
  userRatingCount?: number
  priceLevel?: 'PRICE_LEVEL_FREE' | 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE'
  types: string[]
  primaryType?: string
  primaryTypeDisplayName?: {
    text: string
    languageCode: string
  }
  editorialSummary?: {
    text: string
    languageCode: string
  }
  photos?: PlacePhoto[]
  websiteUri?: string
  regularOpeningHours?: {
    openNow?: boolean
    weekdayDescriptions: string[]
  }
  currentOpeningHours?: {
    openNow: boolean
  }
  googleMapsUri?: string
}

export interface NearbySearchParams {
  latitude: number
  longitude: number
  radius?: number // meters, default 5000
  includedTypes?: string[] // e.g., ['tourist_attraction', 'museum', 'restaurant']
  excludedTypes?: string[]
  maxResultCount?: number // max 20
  languageCode?: string
}

export interface TextSearchParams {
  textQuery: string
  latitude?: number
  longitude?: number
  radius?: number // meters
  includedType?: string
  maxResultCount?: number
  languageCode?: string
}

export interface PlacesSearchResult {
  success: boolean
  places: PlaceResult[]
  error?: string
}

// Field mask for the API - defines which fields we want returned
const PLACE_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.types',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.editorialSummary',
  'places.photos',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
  'places.googleMapsUri',
].join(',')

/**
 * Search for nearby places using Google Places API (New)
 */
export async function searchNearbyPlaces(params: NearbySearchParams): Promise<PlacesSearchResult> {
  try {
    console.log('Google Places nearby search:', params.latitude, params.longitude)

    const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': PLACE_FIELD_MASK,
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: {
              latitude: params.latitude,
              longitude: params.longitude,
            },
            radius: params.radius || 5000,
          },
        },
        includedTypes: params.includedTypes || ['tourist_attraction', 'museum', 'point_of_interest'],
        excludedTypes: params.excludedTypes,
        maxResultCount: params.maxResultCount || 20,
        languageCode: params.languageCode || 'en',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Places API error:', error)
      return {
        success: false,
        places: [],
        error: error.error?.message || 'Failed to search places',
      }
    }

    const data = await response.json()
    const places = (data.places || []) as PlaceResult[]

    console.log('Google Places found', places.length, 'places')

    return {
      success: true,
      places,
    }
  } catch (error) {
    console.error('Google Places search error:', error)
    return {
      success: false,
      places: [],
      error: error instanceof Error ? error.message : 'Failed to search places',
    }
  }
}

/**
 * Search places by text query using Google Places API (New)
 */
export async function searchPlacesByText(params: TextSearchParams): Promise<PlacesSearchResult> {
  try {
    console.log('Google Places text search:', params.textQuery)

    const requestBody: Record<string, unknown> = {
      textQuery: params.textQuery,
      maxResultCount: params.maxResultCount || 20,
      languageCode: params.languageCode || 'en',
    }

    // Add location bias if coordinates provided
    if (params.latitude && params.longitude) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: params.latitude,
            longitude: params.longitude,
          },
          radius: params.radius || 10000,
        },
      }
    }

    if (params.includedType) {
      requestBody.includedType = params.includedType
    }

    const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': PLACE_FIELD_MASK,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Google Places API error:', error)
      return {
        success: false,
        places: [],
        error: error.error?.message || 'Failed to search places',
      }
    }

    const data = await response.json()
    const places = (data.places || []) as PlaceResult[]

    console.log('Google Places found', places.length, 'places')

    return {
      success: true,
      places,
    }
  } catch (error) {
    console.error('Google Places search error:', error)
    return {
      success: false,
      places: [],
      error: error instanceof Error ? error.message : 'Failed to search places',
    }
  }
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  try {
    const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/places/${placeId}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': PLACE_FIELD_MASK.replace(/places\./g, ''),
      },
    })

    if (!response.ok) {
      console.error('Google Places details error:', await response.json())
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Google Places details error:', error)
    return null
  }
}

/**
 * Get photo URL for a place photo
 */
export function getPhotoUrl(photoName: string, maxWidth: number = 400, maxHeight: number = 300): string {
  // photoName format: places/PLACE_ID/photos/PHOTO_REFERENCE
  return `${GOOGLE_PLACES_BASE_URL}/${photoName}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${GOOGLE_PLACES_API_KEY}`
}

/**
 * Convert price level enum to number (0-4)
 */
export function getPriceLevelNumber(priceLevel?: string): number | null {
  if (!priceLevel) return null
  const levels: Record<string, number> = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 1,
    'PRICE_LEVEL_MODERATE': 2,
    'PRICE_LEVEL_EXPENSIVE': 3,
    'PRICE_LEVEL_VERY_EXPENSIVE': 4,
  }
  return levels[priceLevel] ?? null
}

/**
 * Estimate attraction/activity entry cost based on category and price level
 * Since Google Places doesn't provide actual ticket prices, we estimate based on:
 * - Category (museums, parks, theme parks, etc.)
 * - Price level (free, cheap, moderate, expensive, very expensive)
 *
 * @param category - The place category (museum, attraction, park, etc.)
 * @param priceLevel - Google Places price level string
 * @param types - Array of Google Places types for more specific categorization
 * @returns Estimated cost in USD (can be converted to trip currency later)
 */
export function estimateAttractionCost(
  category: string,
  priceLevel?: string,
  types?: string[]
): number {
  // Base cost estimates by category (in USD)
  // These are typical entry fees for each category
  const baseCosts: Record<string, number> = {
    'museum': 20,
    'art_gallery': 15,
    'attraction': 15,
    'tourist_attraction': 20,
    'park': 0,              // Most city parks are free
    'national_park': 25,    // National parks often have entry fees
    'amusement_park': 50,   // Theme parks are expensive
    'zoo': 30,
    'aquarium': 35,
    'church': 0,            // Usually free (donations welcome)
    'cathedral': 5,         // Some charge small fees
    'castle': 15,
    'palace': 18,
    'historic_site': 12,
    'monument': 0,          // Usually free to view
    'viewpoint': 0,
    'beach': 0,
    'garden': 8,
    'botanical_garden': 12,
    'stadium': 20,
    'theater': 0,           // Performance costs vary, entry often free
    'shopping_mall': 0,
    'market': 0,
    'restaurant': 0,        // Food cost is separate, not entry
    'cafe': 0,
    'bar': 0,
    'nightclub': 15,        // Cover charge
    'spa': 50,
    'default': 10,
  }

  // Price level multipliers
  // These adjust the base cost based on Google's price level
  const priceLevelMultipliers: Record<string, number> = {
    'PRICE_LEVEL_FREE': 0,
    'PRICE_LEVEL_INEXPENSIVE': 0.5,
    'PRICE_LEVEL_MODERATE': 1.0,
    'PRICE_LEVEL_EXPENSIVE': 1.5,
    'PRICE_LEVEL_VERY_EXPENSIVE': 2.5,
    // Also support lowercase versions
    'free': 0,
    'cheap': 0.5,
    'moderate': 1.0,
    'expensive': 1.5,
    'very_expensive': 2.5,
  }

  // Normalize the category to lowercase for matching
  const normalizedCategory = category?.toLowerCase() || 'default'

  // Get base cost - check category first
  let baseCost = baseCosts[normalizedCategory] ?? baseCosts['default']

  // Check types array for more specific categorization
  // Types from Google are more specific and can override the generic category
  if (types && types.length > 0) {
    for (const type of types) {
      const typeLower = type.toLowerCase()
      if (typeLower in baseCosts) {
        baseCost = baseCosts[typeLower]
        break // Use the first matching type
      }
    }
  }

  // Get price level multiplier
  const multiplier = priceLevelMultipliers[priceLevel || 'PRICE_LEVEL_MODERATE'] ?? 1.0

  // If price level is FREE, return 0 regardless of category
  if (multiplier === 0) {
    return 0
  }

  // Calculate final cost
  return Math.round(baseCost * multiplier)
}

/**
 * Search for tourist attractions in a city
 */
export async function searchTouristAttractions(
  cityName: string,
  coordinates: { latitude: number; longitude: number },
  maxResults: number = 15
): Promise<PlacesSearchResult> {
  // Use text search for better results
  const result = await searchPlacesByText({
    textQuery: `top tourist attractions in ${cityName}`,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    radius: 15000,
    maxResultCount: maxResults,
  })

  return result
}

/**
 * Search for restaurants in a city
 */
export async function searchRestaurants(
  cityName: string,
  coordinates: { latitude: number; longitude: number },
  maxResults: number = 10
): Promise<PlacesSearchResult> {
  return searchPlacesByText({
    textQuery: `best restaurants in ${cityName}`,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    radius: 10000,
    includedType: 'restaurant',
    maxResultCount: maxResults,
  })
}

/**
 * Options for customizing place search limits
 */
export interface PlacesSearchOptions {
  maxAttractions?: number
  maxRestaurants?: number
  maxMuseums?: number
  maxParks?: number
}

/**
 * Search for a mix of places for trip planning
 */
export async function searchPlacesForTrip(
  cityName: string,
  coordinates: { latitude: number; longitude: number },
  interests: string[] = ['culture', 'food', 'sightseeing'],
  options?: PlacesSearchOptions
): Promise<{
  attractions: PlaceResult[]
  restaurants: PlaceResult[]
  museums: PlaceResult[]
  parks: PlaceResult[]
}> {
  const limits = {
    maxAttractions: Math.min(options?.maxAttractions || 10, 20), // Google Places max is 20
    maxRestaurants: Math.min(options?.maxRestaurants || 8, 20),
    maxMuseums: Math.min(options?.maxMuseums || 5, 20),
    maxParks: Math.min(options?.maxParks || 5, 20),
  }

  const results = {
    attractions: [] as PlaceResult[],
    restaurants: [] as PlaceResult[],
    museums: [] as PlaceResult[],
    parks: [] as PlaceResult[],
  }

  try {
    // Search attractions
    const attractionsResult = await searchTouristAttractions(cityName, coordinates, limits.maxAttractions)
    if (attractionsResult.success) {
      results.attractions = attractionsResult.places
    }

    // Search restaurants if food is an interest
    if (interests.includes('food')) {
      const restaurantsResult = await searchRestaurants(cityName, coordinates, limits.maxRestaurants)
      if (restaurantsResult.success) {
        results.restaurants = restaurantsResult.places
      }
    }

    // Search museums if culture is an interest
    if (interests.includes('culture')) {
      const museumsResult = await searchPlacesByText({
        textQuery: `museums in ${cityName}`,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: 10000,
        includedType: 'museum',
        maxResultCount: limits.maxMuseums,
      })
      if (museumsResult.success) {
        results.museums = museumsResult.places
      }
    }

    // Search parks if nature is an interest
    if (interests.includes('nature') || interests.includes('sightseeing')) {
      const parksResult = await searchNearbyPlaces({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radius: 10000,
        includedTypes: ['park', 'national_park'],
        maxResultCount: limits.maxParks,
      })
      if (parksResult.success) {
        results.parks = parksResult.places
      }
    }
  } catch (error) {
    console.error('Error searching places for trip:', error)
  }

  return results
}
