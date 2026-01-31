import { geminiProModel } from '@/lib/gemini'

export interface AirportLookupResult {
  airportCode: string
  airportName: string
  cityName: string
  countryName: string
  cityCode: string
}

/**
 * Use AI to find the best airport IATA code for a location
 * Works for cities, countries, and regions
 */
export async function aiAirportLookup(location: string): Promise<AirportLookupResult | null> {
  try {
    const prompt = `You are an airport and city code expert. Given a location, return the best IATA airport code AND the IATA city code.

Location: "${location}"

Rules:
- For a CITY: Return the main/primary airport IATA code for that city
- For a COUNTRY: Return the busiest/main international airport in that country
- For a REGION: Return the best airport serving that region
- Only return real, existing IATA codes (3 letters)
- City codes are often different from airport codes (e.g., NYC has airports JFK, LGA, EWR)

Examples:
- "New York" → airportCode: JFK, cityCode: NYC
- "London" → airportCode: LHR, cityCode: LON
- "Los Angeles" → airportCode: LAX, cityCode: LAX
- "California" → airportCode: LAX, cityCode: LAX (main city is LA)
- "Tokyo" → airportCode: NRT, cityCode: TYO
- "Vienna" → airportCode: VIE, cityCode: VIE
- "Tirana" → airportCode: TIA, cityCode: TIA
- "Rome" → airportCode: FCO, cityCode: ROM

Return ONLY a JSON object in this exact format, no other text:
{
  "airportCode": "XXX",
  "cityCode": "XXX",
  "airportName": "Full Airport Name",
  "cityName": "City Name",
  "countryName": "Country Name"
}

If you cannot determine a valid airport, return:
{"error": "Could not find airport"}`

    const result = await geminiProModel.generateContent(prompt)
    const text = result.response.text().trim()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('AI airport lookup: Could not parse JSON from:', text)
      return null
    }
    
    const data = JSON.parse(jsonMatch[0])
    
    if (data.error) {
      console.error('AI airport lookup error:', data.error)
      return null
    }
    
    // Validate the airport code format (3 uppercase letters)
    if (!data.airportCode || !/^[A-Z]{3}$/.test(data.airportCode)) {
      console.error('AI airport lookup: Invalid airport code:', data.airportCode)
      return null
    }
    
    console.log(`AI found airport for "${location}": ${data.airportCode} (${data.airportName}), cityCode: ${data.cityCode}`)
    
    return {
      airportCode: data.airportCode,
      airportName: data.airportName,
      cityName: data.cityName,
      countryName: data.countryName,
      cityCode: data.cityCode || data.airportCode, // Use provided city code or airport code fallback
    }
  } catch (error) {
    console.error('AI airport lookup failed:', error)
    return null
  }
}

/**
 * Common airport codes as a fast fallback (no API call needed)
 */
const COMMON_AIRPORTS: Record<string, AirportLookupResult> = {
  // Major cities
  'new york': { airportCode: 'JFK', airportName: 'John F. Kennedy International Airport', cityName: 'New York', countryName: 'United States', cityCode: 'NYC' },
  'london': { airportCode: 'LHR', airportName: 'Heathrow Airport', cityName: 'London', countryName: 'United Kingdom', cityCode: 'LON' },
  'paris': { airportCode: 'CDG', airportName: 'Charles de Gaulle Airport', cityName: 'Paris', countryName: 'France', cityCode: 'PAR' },
  'tokyo': { airportCode: 'NRT', airportName: 'Narita International Airport', cityName: 'Tokyo', countryName: 'Japan', cityCode: 'TYO' },
  'dubai': { airportCode: 'DXB', airportName: 'Dubai International Airport', cityName: 'Dubai', countryName: 'United Arab Emirates', cityCode: 'DXB' },
  'singapore': { airportCode: 'SIN', airportName: 'Changi Airport', cityName: 'Singapore', countryName: 'Singapore', cityCode: 'SIN' },
  'hong kong': { airportCode: 'HKG', airportName: 'Hong Kong International Airport', cityName: 'Hong Kong', countryName: 'Hong Kong', cityCode: 'HKG' },
  'sydney': { airportCode: 'SYD', airportName: 'Sydney Airport', cityName: 'Sydney', countryName: 'Australia', cityCode: 'SYD' },
  'los angeles': { airportCode: 'LAX', airportName: 'Los Angeles International Airport', cityName: 'Los Angeles', countryName: 'United States', cityCode: 'LAX' },
  'bangkok': { airportCode: 'BKK', airportName: 'Suvarnabhumi Airport', cityName: 'Bangkok', countryName: 'Thailand', cityCode: 'BKK' },
  'amsterdam': { airportCode: 'AMS', airportName: 'Schiphol Airport', cityName: 'Amsterdam', countryName: 'Netherlands', cityCode: 'AMS' },
  'frankfurt': { airportCode: 'FRA', airportName: 'Frankfurt Airport', cityName: 'Frankfurt', countryName: 'Germany', cityCode: 'FRA' },
  'rome': { airportCode: 'FCO', airportName: 'Leonardo da Vinci International Airport', cityName: 'Rome', countryName: 'Italy', cityCode: 'ROM' },
  'barcelona': { airportCode: 'BCN', airportName: 'Barcelona-El Prat Airport', cityName: 'Barcelona', countryName: 'Spain', cityCode: 'BCN' },
  'madrid': { airportCode: 'MAD', airportName: 'Adolfo Suárez Madrid-Barajas Airport', cityName: 'Madrid', countryName: 'Spain', cityCode: 'MAD' },
  'vienna': { airportCode: 'VIE', airportName: 'Vienna International Airport', cityName: 'Vienna', countryName: 'Austria', cityCode: 'VIE' },
  'tirana': { airportCode: 'TIA', airportName: 'Tirana International Airport', cityName: 'Tirana', countryName: 'Albania', cityCode: 'TIA' },
  'berlin': { airportCode: 'BER', airportName: 'Berlin Brandenburg Airport', cityName: 'Berlin', countryName: 'Germany', cityCode: 'BER' },
  'munich': { airportCode: 'MUC', airportName: 'Munich Airport', cityName: 'Munich', countryName: 'Germany', cityCode: 'MUC' },
  'milan': { airportCode: 'MXP', airportName: 'Milan Malpensa Airport', cityName: 'Milan', countryName: 'Italy', cityCode: 'MIL' },
  'florence': { airportCode: 'FLR', airportName: 'Florence Airport', cityName: 'Florence', countryName: 'Italy', cityCode: 'FLR' },
  'venice': { airportCode: 'VCE', airportName: 'Venice Marco Polo Airport', cityName: 'Venice', countryName: 'Italy', cityCode: 'VCE' },
  'lisbon': { airportCode: 'LIS', airportName: 'Lisbon Airport', cityName: 'Lisbon', countryName: 'Portugal', cityCode: 'LIS' },
  'athens': { airportCode: 'ATH', airportName: 'Athens International Airport', cityName: 'Athens', countryName: 'Greece', cityCode: 'ATH' },
  'istanbul': { airportCode: 'IST', airportName: 'Istanbul Airport', cityName: 'Istanbul', countryName: 'Turkey', cityCode: 'IST' },
  'cairo': { airportCode: 'CAI', airportName: 'Cairo International Airport', cityName: 'Cairo', countryName: 'Egypt', cityCode: 'CAI' },
  'marrakech': { airportCode: 'RAK', airportName: 'Marrakech Menara Airport', cityName: 'Marrakech', countryName: 'Morocco', cityCode: 'RAK' },
  'bali': { airportCode: 'DPS', airportName: 'Ngurah Rai International Airport', cityName: 'Denpasar', countryName: 'Indonesia', cityCode: 'DPS' },
  'phuket': { airportCode: 'HKT', airportName: 'Phuket International Airport', cityName: 'Phuket', countryName: 'Thailand', cityCode: 'HKT' },
  'kyoto': { airportCode: 'KIX', airportName: 'Kansai International Airport', cityName: 'Osaka', countryName: 'Japan', cityCode: 'OSA' },
  'osaka': { airportCode: 'KIX', airportName: 'Kansai International Airport', cityName: 'Osaka', countryName: 'Japan', cityCode: 'OSA' },
  'seoul': { airportCode: 'ICN', airportName: 'Incheon International Airport', cityName: 'Seoul', countryName: 'South Korea', cityCode: 'SEL' },
  'beijing': { airportCode: 'PEK', airportName: 'Beijing Capital International Airport', cityName: 'Beijing', countryName: 'China', cityCode: 'BJS' },
  'shanghai': { airportCode: 'PVG', airportName: 'Shanghai Pudong International Airport', cityName: 'Shanghai', countryName: 'China', cityCode: 'SHA' },
  'mumbai': { airportCode: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj International Airport', cityName: 'Mumbai', countryName: 'India', cityCode: 'BOM' },
  'delhi': { airportCode: 'DEL', airportName: 'Indira Gandhi International Airport', cityName: 'New Delhi', countryName: 'India', cityCode: 'DEL' },
  'kuala lumpur': { airportCode: 'KUL', airportName: 'Kuala Lumpur International Airport', cityName: 'Kuala Lumpur', countryName: 'Malaysia', cityCode: 'KUL' },
  'jakarta': { airportCode: 'CGK', airportName: 'Soekarno-Hatta International Airport', cityName: 'Jakarta', countryName: 'Indonesia', cityCode: 'JKT' },
  'toronto': { airportCode: 'YYZ', airportName: 'Toronto Pearson International Airport', cityName: 'Toronto', countryName: 'Canada', cityCode: 'YTO' },
  'vancouver': { airportCode: 'YVR', airportName: 'Vancouver International Airport', cityName: 'Vancouver', countryName: 'Canada', cityCode: 'YVR' },
  'mexico city': { airportCode: 'MEX', airportName: 'Mexico City International Airport', cityName: 'Mexico City', countryName: 'Mexico', cityCode: 'MEX' },
  'sao paulo': { airportCode: 'GRU', airportName: 'São Paulo/Guarulhos International Airport', cityName: 'São Paulo', countryName: 'Brazil', cityCode: 'SAO' },
  'buenos aires': { airportCode: 'EZE', airportName: 'Ministro Pistarini International Airport', cityName: 'Buenos Aires', countryName: 'Argentina', cityCode: 'BUE' },
  'cape town': { airportCode: 'CPT', airportName: 'Cape Town International Airport', cityName: 'Cape Town', countryName: 'South Africa', cityCode: 'CPT' },
  'johannesburg': { airportCode: 'JNB', airportName: 'O.R. Tambo International Airport', cityName: 'Johannesburg', countryName: 'South Africa', cityCode: 'JNB' },
  'melbourne': { airportCode: 'MEL', airportName: 'Melbourne Airport', cityName: 'Melbourne', countryName: 'Australia', cityCode: 'MEL' },
  'auckland': { airportCode: 'AKL', airportName: 'Auckland Airport', cityName: 'Auckland', countryName: 'New Zealand', cityCode: 'AKL' },
  'dublin': { airportCode: 'DUB', airportName: 'Dublin Airport', cityName: 'Dublin', countryName: 'Ireland', cityCode: 'DUB' },
  'edinburgh': { airportCode: 'EDI', airportName: 'Edinburgh Airport', cityName: 'Edinburgh', countryName: 'United Kingdom', cityCode: 'EDI' },
  'prague': { airportCode: 'PRG', airportName: 'Václav Havel Airport Prague', cityName: 'Prague', countryName: 'Czech Republic', cityCode: 'PRG' },
  'budapest': { airportCode: 'BUD', airportName: 'Budapest Ferenc Liszt International Airport', cityName: 'Budapest', countryName: 'Hungary', cityCode: 'BUD' },
  'warsaw': { airportCode: 'WAW', airportName: 'Warsaw Chopin Airport', cityName: 'Warsaw', countryName: 'Poland', cityCode: 'WAW' },
  'krakow': { airportCode: 'KRK', airportName: 'Kraków John Paul II International Airport', cityName: 'Kraków', countryName: 'Poland', cityCode: 'KRK' },
  'zurich': { airportCode: 'ZRH', airportName: 'Zurich Airport', cityName: 'Zurich', countryName: 'Switzerland', cityCode: 'ZRH' },
  'geneva': { airportCode: 'GVA', airportName: 'Geneva Airport', cityName: 'Geneva', countryName: 'Switzerland', cityCode: 'GVA' },
  'brussels': { airportCode: 'BRU', airportName: 'Brussels Airport', cityName: 'Brussels', countryName: 'Belgium', cityCode: 'BRU' },
  'copenhagen': { airportCode: 'CPH', airportName: 'Copenhagen Airport', cityName: 'Copenhagen', countryName: 'Denmark', cityCode: 'CPH' },
  'stockholm': { airportCode: 'ARN', airportName: 'Stockholm Arlanda Airport', cityName: 'Stockholm', countryName: 'Sweden', cityCode: 'STO' },
  'oslo': { airportCode: 'OSL', airportName: 'Oslo Gardermoen Airport', cityName: 'Oslo', countryName: 'Norway', cityCode: 'OSL' },
  'helsinki': { airportCode: 'HEL', airportName: 'Helsinki-Vantaa Airport', cityName: 'Helsinki', countryName: 'Finland', cityCode: 'HEL' },
  'reykjavik': { airportCode: 'KEF', airportName: 'Keflavík International Airport', cityName: 'Reykjavik', countryName: 'Iceland', cityCode: 'REK' },
  'nice': { airportCode: 'NCE', airportName: 'Nice Côte d\'Azur Airport', cityName: 'Nice', countryName: 'France', cityCode: 'NCE' },
  'lyon': { airportCode: 'LYS', airportName: 'Lyon-Saint Exupéry Airport', cityName: 'Lyon', countryName: 'France', cityCode: 'LYS' },
  'san francisco': { airportCode: 'SFO', airportName: 'San Francisco International Airport', cityName: 'San Francisco', countryName: 'United States', cityCode: 'SFO' },
  'miami': { airportCode: 'MIA', airportName: 'Miami International Airport', cityName: 'Miami', countryName: 'United States', cityCode: 'MIA' },
  'chicago': { airportCode: 'ORD', airportName: "O'Hare International Airport", cityName: 'Chicago', countryName: 'United States', cityCode: 'CHI' },
  'boston': { airportCode: 'BOS', airportName: 'Boston Logan International Airport', cityName: 'Boston', countryName: 'United States', cityCode: 'BOS' },
  'seattle': { airportCode: 'SEA', airportName: 'Seattle-Tacoma International Airport', cityName: 'Seattle', countryName: 'United States', cityCode: 'SEA' },
  'las vegas': { airportCode: 'LAS', airportName: 'Harry Reid International Airport', cityName: 'Las Vegas', countryName: 'United States', cityCode: 'LAS' },
  'san diego': { airportCode: 'SAN', airportName: 'San Diego International Airport', cityName: 'San Diego', countryName: 'United States', cityCode: 'SAN' },
  'denver': { airportCode: 'DEN', airportName: 'Denver International Airport', cityName: 'Denver', countryName: 'United States', cityCode: 'DEN' },
  'atlanta': { airportCode: 'ATL', airportName: 'Hartsfield-Jackson Atlanta International Airport', cityName: 'Atlanta', countryName: 'United States', cityCode: 'ATL' },
  'orlando': { airportCode: 'MCO', airportName: 'Orlando International Airport', cityName: 'Orlando', countryName: 'United States', cityCode: 'ORL' },
  'washington': { airportCode: 'IAD', airportName: 'Washington Dulles International Airport', cityName: 'Washington D.C.', countryName: 'United States', cityCode: 'WAS' },
  'washington dc': { airportCode: 'IAD', airportName: 'Washington Dulles International Airport', cityName: 'Washington D.C.', countryName: 'United States', cityCode: 'WAS' },
  'honolulu': { airportCode: 'HNL', airportName: 'Daniel K. Inouye International Airport', cityName: 'Honolulu', countryName: 'United States', cityCode: 'HNL' },
  'hawaii': { airportCode: 'HNL', airportName: 'Daniel K. Inouye International Airport', cityName: 'Honolulu', countryName: 'United States', cityCode: 'HNL' },
  
  // Regions/States
  'california': { airportCode: 'LAX', airportName: 'Los Angeles International Airport', cityName: 'Los Angeles', countryName: 'United States', cityCode: 'LAX' },
  'florida': { airportCode: 'MIA', airportName: 'Miami International Airport', cityName: 'Miami', countryName: 'United States', cityCode: 'MIA' },
  'texas': { airportCode: 'DFW', airportName: 'Dallas/Fort Worth International Airport', cityName: 'Dallas', countryName: 'United States', cityCode: 'DFW' },
  'new york state': { airportCode: 'JFK', airportName: 'John F. Kennedy International Airport', cityName: 'New York', countryName: 'United States', cityCode: 'NYC' },
  
  // Countries (return main international airport)
  'japan': { airportCode: 'NRT', airportName: 'Narita International Airport', cityName: 'Tokyo', countryName: 'Japan', cityCode: 'TYO' },
  'italy': { airportCode: 'FCO', airportName: 'Leonardo da Vinci International Airport', cityName: 'Rome', countryName: 'Italy', cityCode: 'ROM' },
  'france': { airportCode: 'CDG', airportName: 'Charles de Gaulle Airport', cityName: 'Paris', countryName: 'France', cityCode: 'PAR' },
  'spain': { airportCode: 'MAD', airportName: 'Adolfo Suárez Madrid-Barajas Airport', cityName: 'Madrid', countryName: 'Spain', cityCode: 'MAD' },
  'germany': { airportCode: 'FRA', airportName: 'Frankfurt Airport', cityName: 'Frankfurt', countryName: 'Germany', cityCode: 'FRA' },
  'united kingdom': { airportCode: 'LHR', airportName: 'Heathrow Airport', cityName: 'London', countryName: 'United Kingdom', cityCode: 'LON' },
  'uk': { airportCode: 'LHR', airportName: 'Heathrow Airport', cityName: 'London', countryName: 'United Kingdom', cityCode: 'LON' },
  'usa': { airportCode: 'JFK', airportName: 'John F. Kennedy International Airport', cityName: 'New York', countryName: 'United States', cityCode: 'NYC' },
  'united states': { airportCode: 'JFK', airportName: 'John F. Kennedy International Airport', cityName: 'New York', countryName: 'United States', cityCode: 'NYC' },
  'australia': { airportCode: 'SYD', airportName: 'Sydney Airport', cityName: 'Sydney', countryName: 'Australia', cityCode: 'SYD' },
  'thailand': { airportCode: 'BKK', airportName: 'Suvarnabhumi Airport', cityName: 'Bangkok', countryName: 'Thailand', cityCode: 'BKK' },
  'greece': { airportCode: 'ATH', airportName: 'Athens International Airport', cityName: 'Athens', countryName: 'Greece', cityCode: 'ATH' },
  'portugal': { airportCode: 'LIS', airportName: 'Lisbon Airport', cityName: 'Lisbon', countryName: 'Portugal', cityCode: 'LIS' },
  'netherlands': { airportCode: 'AMS', airportName: 'Schiphol Airport', cityName: 'Amsterdam', countryName: 'Netherlands', cityCode: 'AMS' },
  'austria': { airportCode: 'VIE', airportName: 'Vienna International Airport', cityName: 'Vienna', countryName: 'Austria', cityCode: 'VIE' },
  'albania': { airportCode: 'TIA', airportName: 'Tirana International Airport', cityName: 'Tirana', countryName: 'Albania', cityCode: 'TIA' },
  'croatia': { airportCode: 'ZAG', airportName: 'Zagreb Airport', cityName: 'Zagreb', countryName: 'Croatia', cityCode: 'ZAG' },
  'turkey': { airportCode: 'IST', airportName: 'Istanbul Airport', cityName: 'Istanbul', countryName: 'Turkey', cityCode: 'IST' },
  'egypt': { airportCode: 'CAI', airportName: 'Cairo International Airport', cityName: 'Cairo', countryName: 'Egypt', cityCode: 'CAI' },
  'morocco': { airportCode: 'CMN', airportName: 'Mohammed V International Airport', cityName: 'Casablanca', countryName: 'Morocco', cityCode: 'CAS' },
  'india': { airportCode: 'DEL', airportName: 'Indira Gandhi International Airport', cityName: 'New Delhi', countryName: 'India', cityCode: 'DEL' },
  'indonesia': { airportCode: 'CGK', airportName: 'Soekarno-Hatta International Airport', cityName: 'Jakarta', countryName: 'Indonesia', cityCode: 'JKT' },
  'vietnam': { airportCode: 'SGN', airportName: 'Tan Son Nhat International Airport', cityName: 'Ho Chi Minh City', countryName: 'Vietnam', cityCode: 'SGN' },
  'mexico': { airportCode: 'MEX', airportName: 'Mexico City International Airport', cityName: 'Mexico City', countryName: 'Mexico', cityCode: 'MEX' },
  'brazil': { airportCode: 'GRU', airportName: 'São Paulo/Guarulhos International Airport', cityName: 'São Paulo', countryName: 'Brazil', cityCode: 'SAO' },
  'south africa': { airportCode: 'JNB', airportName: 'O.R. Tambo International Airport', cityName: 'Johannesburg', countryName: 'South Africa', cityCode: 'JNB' },
  'new zealand': { airportCode: 'AKL', airportName: 'Auckland Airport', cityName: 'Auckland', countryName: 'New Zealand', cityCode: 'AKL' },
  'ireland': { airportCode: 'DUB', airportName: 'Dublin Airport', cityName: 'Dublin', countryName: 'Ireland', cityCode: 'DUB' },
  'switzerland': { airportCode: 'ZRH', airportName: 'Zurich Airport', cityName: 'Zurich', countryName: 'Switzerland', cityCode: 'ZRH' },
  'belgium': { airportCode: 'BRU', airportName: 'Brussels Airport', cityName: 'Brussels', countryName: 'Belgium', cityCode: 'BRU' },
  'denmark': { airportCode: 'CPH', airportName: 'Copenhagen Airport', cityName: 'Copenhagen', countryName: 'Denmark', cityCode: 'CPH' },
  'sweden': { airportCode: 'ARN', airportName: 'Stockholm Arlanda Airport', cityName: 'Stockholm', countryName: 'Sweden', cityCode: 'STO' },
  'norway': { airportCode: 'OSL', airportName: 'Oslo Gardermoen Airport', cityName: 'Oslo', countryName: 'Norway', cityCode: 'OSL' },
  'finland': { airportCode: 'HEL', airportName: 'Helsinki-Vantaa Airport', cityName: 'Helsinki', countryName: 'Finland', cityCode: 'HEL' },
  'iceland': { airportCode: 'KEF', airportName: 'Keflavík International Airport', cityName: 'Reykjavik', countryName: 'Iceland', cityCode: 'REK' },
  'czech republic': { airportCode: 'PRG', airportName: 'Václav Havel Airport Prague', cityName: 'Prague', countryName: 'Czech Republic', cityCode: 'PRG' },
  'hungary': { airportCode: 'BUD', airportName: 'Budapest Ferenc Liszt International Airport', cityName: 'Budapest', countryName: 'Hungary', cityCode: 'BUD' },
  'poland': { airportCode: 'WAW', airportName: 'Warsaw Chopin Airport', cityName: 'Warsaw', countryName: 'Poland', cityCode: 'WAW' },
  
  // Regions
  'tuscany': { airportCode: 'FLR', airportName: 'Florence Airport', cityName: 'Florence', countryName: 'Italy', cityCode: 'FLR' },
  'provence': { airportCode: 'MRS', airportName: 'Marseille Provence Airport', cityName: 'Marseille', countryName: 'France', cityCode: 'MRS' },
  'andalusia': { airportCode: 'SVQ', airportName: 'Seville Airport', cityName: 'Seville', countryName: 'Spain', cityCode: 'SVQ' },
  'amalfi coast': { airportCode: 'NAP', airportName: 'Naples International Airport', cityName: 'Naples', countryName: 'Italy', cityCode: 'NAP' },
  'french riviera': { airportCode: 'NCE', airportName: 'Nice Côte d\'Azur Airport', cityName: 'Nice', countryName: 'France', cityCode: 'NCE' },
  'bavarian alps': { airportCode: 'MUC', airportName: 'Munich Airport', cityName: 'Munich', countryName: 'Germany', cityCode: 'MUC' },
  'scottish highlands': { airportCode: 'INV', airportName: 'Inverness Airport', cityName: 'Inverness', countryName: 'United Kingdom', cityCode: 'INV' },
}

/**
 * Smart airport lookup with fallbacks:
 * 1. Try common airports cache (instant)
 * 2. Fall back to AI lookup (slower but handles any location)
 */
export async function smartAirportLookup(location: string): Promise<AirportLookupResult | null> {
  const normalizedLocation = location.toLowerCase().trim()
  
  // Check common airports first (instant lookup)
  if (COMMON_AIRPORTS[normalizedLocation]) {
    console.log(`Found "${location}" in common airports cache`)
    return COMMON_AIRPORTS[normalizedLocation]
  }
  
  // Try AI lookup for uncommon locations
  console.log(`"${location}" not in cache, trying AI lookup...`)
  return await aiAirportLookup(location)
}
