// IATA city and airport codes mapping
// Used for Amadeus API calls which require IATA codes

export interface CityCode {
  city: string
  airport: string
  name: string
  country: string
}

// Common travel destinations with their IATA codes
// City code is for hotel searches, Airport code is for flight searches
export const CITY_CODES: Record<string, CityCode> = {
  // North America
  'new york': { city: 'NYC', airport: 'JFK', name: 'New York', country: 'United States' },
  'los angeles': { city: 'LAX', airport: 'LAX', name: 'Los Angeles', country: 'United States' },
  'chicago': { city: 'CHI', airport: 'ORD', name: 'Chicago', country: 'United States' },
  'miami': { city: 'MIA', airport: 'MIA', name: 'Miami', country: 'United States' },
  'san francisco': { city: 'SFO', airport: 'SFO', name: 'San Francisco', country: 'United States' },
  'las vegas': { city: 'LAS', airport: 'LAS', name: 'Las Vegas', country: 'United States' },
  'orlando': { city: 'ORL', airport: 'MCO', name: 'Orlando', country: 'United States' },
  'seattle': { city: 'SEA', airport: 'SEA', name: 'Seattle', country: 'United States' },
  'boston': { city: 'BOS', airport: 'BOS', name: 'Boston', country: 'United States' },
  'washington': { city: 'WAS', airport: 'DCA', name: 'Washington D.C.', country: 'United States' },
  'toronto': { city: 'YTO', airport: 'YYZ', name: 'Toronto', country: 'Canada' },
  'vancouver': { city: 'YVR', airport: 'YVR', name: 'Vancouver', country: 'Canada' },
  'montreal': { city: 'YMQ', airport: 'YUL', name: 'Montreal', country: 'Canada' },
  'mexico city': { city: 'MEX', airport: 'MEX', name: 'Mexico City', country: 'Mexico' },
  'cancun': { city: 'CUN', airport: 'CUN', name: 'Cancun', country: 'Mexico' },

  // Europe
  'london': { city: 'LON', airport: 'LHR', name: 'London', country: 'United Kingdom' },
  'paris': { city: 'PAR', airport: 'CDG', name: 'Paris', country: 'France' },
  'rome': { city: 'ROM', airport: 'FCO', name: 'Rome', country: 'Italy' },
  'roma': { city: 'ROM', airport: 'FCO', name: 'Rome', country: 'Italy' }, // Italian name
  'milan': { city: 'MIL', airport: 'MXP', name: 'Milan', country: 'Italy' },
  'milano': { city: 'MIL', airport: 'MXP', name: 'Milan', country: 'Italy' }, // Italian name
  'venice': { city: 'VCE', airport: 'VCE', name: 'Venice', country: 'Italy' },
  'venezia': { city: 'VCE', airport: 'VCE', name: 'Venice', country: 'Italy' }, // Italian name
  'florence': { city: 'FLR', airport: 'FLR', name: 'Florence', country: 'Italy' },
  'firenze': { city: 'FLR', airport: 'FLR', name: 'Florence', country: 'Italy' }, // Italian name
  'naples': { city: 'NAP', airport: 'NAP', name: 'Naples', country: 'Italy' },
  'napoli': { city: 'NAP', airport: 'NAP', name: 'Naples', country: 'Italy' }, // Italian name
  'palermo': { city: 'PMO', airport: 'PMO', name: 'Palermo', country: 'Italy' },
  'catania': { city: 'CTA', airport: 'CTA', name: 'Catania', country: 'Italy' },
  'bologna': { city: 'BLQ', airport: 'BLQ', name: 'Bologna', country: 'Italy' },
  'turin': { city: 'TRN', airport: 'TRN', name: 'Turin', country: 'Italy' },
  'torino': { city: 'TRN', airport: 'TRN', name: 'Turin', country: 'Italy' }, // Italian name
  'genoa': { city: 'GOA', airport: 'GOA', name: 'Genoa', country: 'Italy' },
  'genova': { city: 'GOA', airport: 'GOA', name: 'Genoa', country: 'Italy' }, // Italian name
  'pisa': { city: 'PSA', airport: 'PSA', name: 'Pisa', country: 'Italy' },
  'verona': { city: 'VRN', airport: 'VRN', name: 'Verona', country: 'Italy' },
  'barcelona': { city: 'BCN', airport: 'BCN', name: 'Barcelona', country: 'Spain' },
  'madrid': { city: 'MAD', airport: 'MAD', name: 'Madrid', country: 'Spain' },
  'seville': { city: 'SVQ', airport: 'SVQ', name: 'Seville', country: 'Spain' },
  'valencia': { city: 'VLC', airport: 'VLC', name: 'Valencia', country: 'Spain' },
  'malaga': { city: 'AGP', airport: 'AGP', name: 'Malaga', country: 'Spain' },
  'ibiza': { city: 'IBZ', airport: 'IBZ', name: 'Ibiza', country: 'Spain' },
  'palma': { city: 'PMI', airport: 'PMI', name: 'Palma de Mallorca', country: 'Spain' },
  'palma de mallorca': { city: 'PMI', airport: 'PMI', name: 'Palma de Mallorca', country: 'Spain' },
  'mallorca': { city: 'PMI', airport: 'PMI', name: 'Palma de Mallorca', country: 'Spain' },
  'lisbon': { city: 'LIS', airport: 'LIS', name: 'Lisbon', country: 'Portugal' },
  'lisboa': { city: 'LIS', airport: 'LIS', name: 'Lisbon', country: 'Portugal' }, // Portuguese name
  'porto': { city: 'OPO', airport: 'OPO', name: 'Porto', country: 'Portugal' },
  'faro': { city: 'FAO', airport: 'FAO', name: 'Faro', country: 'Portugal' },
  'nice': { city: 'NCE', airport: 'NCE', name: 'Nice', country: 'France' },
  'lyon': { city: 'LYS', airport: 'LYS', name: 'Lyon', country: 'France' },
  'marseille': { city: 'MRS', airport: 'MRS', name: 'Marseille', country: 'France' },
  'toulouse': { city: 'TLS', airport: 'TLS', name: 'Toulouse', country: 'France' },
  'bordeaux': { city: 'BOD', airport: 'BOD', name: 'Bordeaux', country: 'France' },
  'amsterdam': { city: 'AMS', airport: 'AMS', name: 'Amsterdam', country: 'Netherlands' },
  'berlin': { city: 'BER', airport: 'BER', name: 'Berlin', country: 'Germany' },
  'munich': { city: 'MUC', airport: 'MUC', name: 'Munich', country: 'Germany' },
  'munchen': { city: 'MUC', airport: 'MUC', name: 'Munich', country: 'Germany' }, // German name (without umlaut)
  'münchen': { city: 'MUC', airport: 'MUC', name: 'Munich', country: 'Germany' }, // German name
  'frankfurt': { city: 'FRA', airport: 'FRA', name: 'Frankfurt', country: 'Germany' },
  'vienna': { city: 'VIE', airport: 'VIE', name: 'Vienna', country: 'Austria' },
  'wien': { city: 'VIE', airport: 'VIE', name: 'Vienna', country: 'Austria' }, // German name
  'prague': { city: 'PRG', airport: 'PRG', name: 'Prague', country: 'Czech Republic' },
  'praha': { city: 'PRG', airport: 'PRG', name: 'Prague', country: 'Czech Republic' }, // Czech name
  'budapest': { city: 'BUD', airport: 'BUD', name: 'Budapest', country: 'Hungary' },
  'zurich': { city: 'ZRH', airport: 'ZRH', name: 'Zurich', country: 'Switzerland' },
  'zürich': { city: 'ZRH', airport: 'ZRH', name: 'Zurich', country: 'Switzerland' }, // German name
  'geneva': { city: 'GVA', airport: 'GVA', name: 'Geneva', country: 'Switzerland' },
  'geneve': { city: 'GVA', airport: 'GVA', name: 'Geneva', country: 'Switzerland' }, // French name
  'genève': { city: 'GVA', airport: 'GVA', name: 'Geneva', country: 'Switzerland' }, // French name with accent
  'brussels': { city: 'BRU', airport: 'BRU', name: 'Brussels', country: 'Belgium' },
  'bruxelles': { city: 'BRU', airport: 'BRU', name: 'Brussels', country: 'Belgium' }, // French name
  'brussel': { city: 'BRU', airport: 'BRU', name: 'Brussels', country: 'Belgium' }, // Dutch name
  'dublin': { city: 'DUB', airport: 'DUB', name: 'Dublin', country: 'Ireland' },
  'edinburgh': { city: 'EDI', airport: 'EDI', name: 'Edinburgh', country: 'United Kingdom' },
  'athens': { city: 'ATH', airport: 'ATH', name: 'Athens', country: 'Greece' },
  'athina': { city: 'ATH', airport: 'ATH', name: 'Athens', country: 'Greece' }, // Greek name
  'santorini': { city: 'JTR', airport: 'JTR', name: 'Santorini', country: 'Greece' },
  'thira': { city: 'JTR', airport: 'JTR', name: 'Santorini', country: 'Greece' }, // Greek name
  'mykonos': { city: 'JMK', airport: 'JMK', name: 'Mykonos', country: 'Greece' },
  'crete': { city: 'HER', airport: 'HER', name: 'Heraklion', country: 'Greece' },
  'heraklion': { city: 'HER', airport: 'HER', name: 'Heraklion', country: 'Greece' },
  'rhodes': { city: 'RHO', airport: 'RHO', name: 'Rhodes', country: 'Greece' },
  'rodos': { city: 'RHO', airport: 'RHO', name: 'Rhodes', country: 'Greece' }, // Greek name
  'corfu': { city: 'CFU', airport: 'CFU', name: 'Corfu', country: 'Greece' },
  'kerkyra': { city: 'CFU', airport: 'CFU', name: 'Corfu', country: 'Greece' }, // Greek name
  'thessaloniki': { city: 'SKG', airport: 'SKG', name: 'Thessaloniki', country: 'Greece' },
  'copenhagen': { city: 'CPH', airport: 'CPH', name: 'Copenhagen', country: 'Denmark' },
  'kobenhavn': { city: 'CPH', airport: 'CPH', name: 'Copenhagen', country: 'Denmark' }, // Danish name (without special char)
  'københavn': { city: 'CPH', airport: 'CPH', name: 'Copenhagen', country: 'Denmark' }, // Danish name
  'stockholm': { city: 'STO', airport: 'ARN', name: 'Stockholm', country: 'Sweden' },
  'oslo': { city: 'OSL', airport: 'OSL', name: 'Oslo', country: 'Norway' },
  'helsinki': { city: 'HEL', airport: 'HEL', name: 'Helsinki', country: 'Finland' },
  'warsaw': { city: 'WAW', airport: 'WAW', name: 'Warsaw', country: 'Poland' },
  'warszawa': { city: 'WAW', airport: 'WAW', name: 'Warsaw', country: 'Poland' }, // Polish name
  'krakow': { city: 'KRK', airport: 'KRK', name: 'Krakow', country: 'Poland' },
  'kraków': { city: 'KRK', airport: 'KRK', name: 'Krakow', country: 'Poland' }, // Polish name with accent
  'moscow': { city: 'MOW', airport: 'SVO', name: 'Moscow', country: 'Russia' },
  'moskva': { city: 'MOW', airport: 'SVO', name: 'Moscow', country: 'Russia' }, // Russian name (Latin)
  'istanbul': { city: 'IST', airport: 'IST', name: 'Istanbul', country: 'Turkey' },
  'tirana': { city: 'TIA', airport: 'TIA', name: 'Tirana', country: 'Albania' },
  'tirane': { city: 'TIA', airport: 'TIA', name: 'Tirana', country: 'Albania' },
  'belgrade': { city: 'BEG', airport: 'BEG', name: 'Belgrade', country: 'Serbia' },
  'sofia': { city: 'SOF', airport: 'SOF', name: 'Sofia', country: 'Bulgaria' },
  'bucharest': { city: 'BUH', airport: 'OTP', name: 'Bucharest', country: 'Romania' },
  'zagreb': { city: 'ZAG', airport: 'ZAG', name: 'Zagreb', country: 'Croatia' },
  'split': { city: 'SPU', airport: 'SPU', name: 'Split', country: 'Croatia' },
  'dubrovnik': { city: 'DBV', airport: 'DBV', name: 'Dubrovnik', country: 'Croatia' },
  'ljubljana': { city: 'LJU', airport: 'LJU', name: 'Ljubljana', country: 'Slovenia' },
  'sarajevo': { city: 'SJJ', airport: 'SJJ', name: 'Sarajevo', country: 'Bosnia and Herzegovina' },
  'podgorica': { city: 'TGD', airport: 'TGD', name: 'Podgorica', country: 'Montenegro' },
  'skopje': { city: 'SKP', airport: 'SKP', name: 'Skopje', country: 'North Macedonia' },
  'pristina': { city: 'PRN', airport: 'PRN', name: 'Pristina', country: 'Kosovo' },

  // Asia
  'tokyo': { city: 'TYO', airport: 'NRT', name: 'Tokyo', country: 'Japan' },
  'osaka': { city: 'OSA', airport: 'KIX', name: 'Osaka', country: 'Japan' },
  'kyoto': { city: 'UKY', airport: 'KIX', name: 'Kyoto', country: 'Japan' },
  'seoul': { city: 'SEL', airport: 'ICN', name: 'Seoul', country: 'South Korea' },
  'beijing': { city: 'BJS', airport: 'PEK', name: 'Beijing', country: 'China' },
  'shanghai': { city: 'SHA', airport: 'PVG', name: 'Shanghai', country: 'China' },
  'hong kong': { city: 'HKG', airport: 'HKG', name: 'Hong Kong', country: 'Hong Kong' },
  'taipei': { city: 'TPE', airport: 'TPE', name: 'Taipei', country: 'Taiwan' },
  'singapore': { city: 'SIN', airport: 'SIN', name: 'Singapore', country: 'Singapore' },
  'bangkok': { city: 'BKK', airport: 'BKK', name: 'Bangkok', country: 'Thailand' },
  'phuket': { city: 'HKT', airport: 'HKT', name: 'Phuket', country: 'Thailand' },
  'kuala lumpur': { city: 'KUL', airport: 'KUL', name: 'Kuala Lumpur', country: 'Malaysia' },
  'bali': { city: 'DPS', airport: 'DPS', name: 'Bali', country: 'Indonesia' },
  'jakarta': { city: 'JKT', airport: 'CGK', name: 'Jakarta', country: 'Indonesia' },
  'manila': { city: 'MNL', airport: 'MNL', name: 'Manila', country: 'Philippines' },
  'hanoi': { city: 'HAN', airport: 'HAN', name: 'Hanoi', country: 'Vietnam' },
  'ho chi minh city': { city: 'SGN', airport: 'SGN', name: 'Ho Chi Minh City', country: 'Vietnam' },
  'mumbai': { city: 'BOM', airport: 'BOM', name: 'Mumbai', country: 'India' },
  'delhi': { city: 'DEL', airport: 'DEL', name: 'Delhi', country: 'India' },
  'new delhi': { city: 'DEL', airport: 'DEL', name: 'New Delhi', country: 'India' },

  // Middle East
  'dubai': { city: 'DXB', airport: 'DXB', name: 'Dubai', country: 'United Arab Emirates' },
  'abu dhabi': { city: 'AUH', airport: 'AUH', name: 'Abu Dhabi', country: 'United Arab Emirates' },
  'doha': { city: 'DOH', airport: 'DOH', name: 'Doha', country: 'Qatar' },
  'tel aviv': { city: 'TLV', airport: 'TLV', name: 'Tel Aviv', country: 'Israel' },

  // Oceania
  'sydney': { city: 'SYD', airport: 'SYD', name: 'Sydney', country: 'Australia' },
  'melbourne': { city: 'MEL', airport: 'MEL', name: 'Melbourne', country: 'Australia' },
  'brisbane': { city: 'BNE', airport: 'BNE', name: 'Brisbane', country: 'Australia' },
  'perth': { city: 'PER', airport: 'PER', name: 'Perth', country: 'Australia' },
  'auckland': { city: 'AKL', airport: 'AKL', name: 'Auckland', country: 'New Zealand' },
  'queenstown': { city: 'ZQN', airport: 'ZQN', name: 'Queenstown', country: 'New Zealand' },

  // South America
  'rio de janeiro': { city: 'RIO', airport: 'GIG', name: 'Rio de Janeiro', country: 'Brazil' },
  'sao paulo': { city: 'SAO', airport: 'GRU', name: 'Sao Paulo', country: 'Brazil' },
  'buenos aires': { city: 'BUE', airport: 'EZE', name: 'Buenos Aires', country: 'Argentina' },
  'lima': { city: 'LIM', airport: 'LIM', name: 'Lima', country: 'Peru' },
  'cusco': { city: 'CUZ', airport: 'CUZ', name: 'Cusco', country: 'Peru' },
  'bogota': { city: 'BOG', airport: 'BOG', name: 'Bogota', country: 'Colombia' },
  'cartagena': { city: 'CTG', airport: 'CTG', name: 'Cartagena', country: 'Colombia' },
  'santiago': { city: 'SCL', airport: 'SCL', name: 'Santiago', country: 'Chile' },

  // Africa
  'cairo': { city: 'CAI', airport: 'CAI', name: 'Cairo', country: 'Egypt' },
  'cape town': { city: 'CPT', airport: 'CPT', name: 'Cape Town', country: 'South Africa' },
  'johannesburg': { city: 'JNB', airport: 'JNB', name: 'Johannesburg', country: 'South Africa' },
  'marrakech': { city: 'RAK', airport: 'RAK', name: 'Marrakech', country: 'Morocco' },
  'casablanca': { city: 'CAS', airport: 'CMN', name: 'Casablanca', country: 'Morocco' },
  'nairobi': { city: 'NBO', airport: 'NBO', name: 'Nairobi', country: 'Kenya' },
}

/**
 * Get airport code from city name
 * @param cityName - City name to look up
 * @returns IATA airport code or null if not found
 */
export function getAirportCode(cityName: string): string | null {
  const normalized = cityName.toLowerCase().trim()
  const cityData = CITY_CODES[normalized]
  return cityData?.airport || null
}

/**
 * Get city code from city name (for hotel searches)
 * @param cityName - City name to look up
 * @returns IATA city code or null if not found
 */
export function getCityCode(cityName: string): string | null {
  const normalized = cityName.toLowerCase().trim()
  const cityData = CITY_CODES[normalized]
  return cityData?.city || null
}

/**
 * Get full city data from city name
 * @param cityName - City name to look up
 * @returns CityCode object or null if not found
 */
export function getCityData(cityName: string): CityCode | null {
  const normalized = cityName.toLowerCase().trim()
  return CITY_CODES[normalized] || null
}

/**
 * Try to find a city code by partial match
 * @param cityName - City name to search for
 * @returns Best matching CityCode or null
 */
export function findCityCode(cityName: string): CityCode | null {
  const normalized = cityName.toLowerCase().trim()

  // First try exact match
  if (CITY_CODES[normalized]) {
    return CITY_CODES[normalized]
  }

  // Try partial match
  for (const [key, value] of Object.entries(CITY_CODES)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return value
    }
  }

  return null
}

/**
 * Get all available cities
 * @returns Array of all city codes
 */
export function getAllCities(): CityCode[] {
  return Object.values(CITY_CODES)
}

/**
 * Search cities by name
 * @param query - Search query
 * @returns Array of matching cities
 */
export function searchCities(query: string): CityCode[] {
  const normalized = query.toLowerCase().trim()
  if (!normalized) return []

  return Object.entries(CITY_CODES)
    .filter(([key, value]) =>
      key.includes(normalized) ||
      value.name.toLowerCase().includes(normalized) ||
      value.country.toLowerCase().includes(normalized)
    )
    .map(([, value]) => value)
}
