import { geminiModel } from './gemini'

export interface AirportLookupResult {
  success: boolean
  iataCode?: string
  airportName?: string
  city?: string
  country?: string
  source?: 'ai'
  note?: string
  error?: string
}

/**
 * Use AI to find the nearest/best airport for a location
 * AI-first approach - uses Gemini's knowledge to find the correct airport
 */
async function findAirportWithAI(location: string): Promise<AirportLookupResult> {
  try {
    const prompt = `You are an airport lookup assistant with expert knowledge of world airports.

Location: "${location}"

Find the main airport that serves this location. Consider:
1. The primary international airport serving this city/region
2. If multiple airports exist, choose the main one (e.g., JFK for New York, not LaGuardia)
3. Use your geographical knowledge - don't confuse cities with similar names in different countries

Return your answer in this exact JSON format:
{"iata": "XXX", "name": "Airport Name", "city": "City Name", "country": "Country Name"}

IMPORTANT:
- Return ONLY the JSON, nothing else
- The IATA code must be exactly 3 letters
- Be precise about geography - Tirana is in Albania (TIA), not Papua New Guinea
- If you're not 100% certain about the airport, still provide your best educated guess based on the location`

    console.log(`AI airport lookup for: "${location}"`)
    const result = await geminiModel.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log('AI response not in JSON format:', responseText)
      return {
        success: false,
        error: 'AI response not in expected format',
      }
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      iata: string
      name: string
      city: string
      country: string
    }

    if (!parsed.iata || parsed.iata.length !== 3) {
      console.log('Invalid IATA code from AI:', parsed.iata)
      return {
        success: false,
        error: 'Invalid IATA code returned',
      }
    }

    console.log(`AI found airport: ${location} -> ${parsed.iata} (${parsed.name}, ${parsed.city}, ${parsed.country})`)

    return {
      success: true,
      iataCode: parsed.iata.toUpperCase(),
      airportName: parsed.name,
      city: parsed.city,
      country: parsed.country,
      source: 'ai',
    }
  } catch (error) {
    console.error('AI airport lookup error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI lookup failed',
    }
  }
}

/**
 * AI-first airport lookup
 *
 * Uses Gemini AI to find the correct airport based on the full location context.
 * The AI understands geography and won't confuse cities with similar names.
 */
export async function lookupAirport(cityName: string, country?: string): Promise<AirportLookupResult> {
  // Build the full location string for AI
  const location = country ? `${cityName}, ${country}` : cityName

  console.log(`\n=== Airport Lookup (AI): ${location} ===`)

  // Use AI directly - it has the knowledge to find the correct airport
  const result = await findAirportWithAI(location)

  if (result.success) {
    return result
  }

  // AI lookup failed
  return {
    success: false,
    error: `Could not find airport for "${location}". ${result.error || ''}`,
  }
}
