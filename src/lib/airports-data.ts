/**
 * Static airport coordinates database
 * Used for displaying airports on the trip map
 */

export interface AirportData {
  lat: number
  lng: number
  name: string
  city: string
  country: string
}

// Major world airports with coordinates
export const AIRPORT_COORDINATES: Record<string, AirportData> = {
  // North America - USA
  'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International', city: 'New York', country: 'United States' },
  'LAX': { lat: 33.9416, lng: -118.4085, name: 'Los Angeles International', city: 'Los Angeles', country: 'United States' },
  'ORD': { lat: 41.9742, lng: -87.9073, name: "O'Hare International", city: 'Chicago', country: 'United States' },
  'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'United States' },
  'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver International', city: 'Denver', country: 'United States' },
  'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', country: 'United States' },
  'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International', city: 'San Francisco', country: 'United States' },
  'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International', city: 'Seattle', country: 'United States' },
  'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami International', city: 'Miami', country: 'United States' },
  'BOS': { lat: 42.3656, lng: -71.0096, name: 'Logan International', city: 'Boston', country: 'United States' },
  'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty International', city: 'Newark', country: 'United States' },
  'LGA': { lat: 40.7769, lng: -73.8740, name: 'LaGuardia', city: 'New York', country: 'United States' },
  'IAD': { lat: 38.9531, lng: -77.4565, name: 'Washington Dulles International', city: 'Washington', country: 'United States' },
  'DCA': { lat: 38.8512, lng: -77.0402, name: 'Ronald Reagan Washington National', city: 'Washington', country: 'United States' },
  'PHX': { lat: 33.4373, lng: -112.0078, name: 'Phoenix Sky Harbor International', city: 'Phoenix', country: 'United States' },
  'LAS': { lat: 36.0840, lng: -115.1537, name: 'Harry Reid International', city: 'Las Vegas', country: 'United States' },
  'MCO': { lat: 28.4312, lng: -81.3081, name: 'Orlando International', city: 'Orlando', country: 'United States' },
  'MSP': { lat: 44.8848, lng: -93.2223, name: 'Minneapolis-Saint Paul International', city: 'Minneapolis', country: 'United States' },
  'DTW': { lat: 42.2162, lng: -83.3554, name: 'Detroit Metropolitan Wayne County', city: 'Detroit', country: 'United States' },
  'PHL': { lat: 39.8744, lng: -75.2424, name: 'Philadelphia International', city: 'Philadelphia', country: 'United States' },
  'SAN': { lat: 32.7338, lng: -117.1933, name: 'San Diego International', city: 'San Diego', country: 'United States' },
  'HNL': { lat: 21.3187, lng: -157.9225, name: 'Daniel K. Inouye International', city: 'Honolulu', country: 'United States' },

  // North America - Canada
  'YYZ': { lat: 43.6777, lng: -79.6248, name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  'YVR': { lat: 49.1967, lng: -123.1815, name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  'YUL': { lat: 45.4706, lng: -73.7408, name: 'Montréal-Pierre Elliott Trudeau International', city: 'Montreal', country: 'Canada' },
  'YYC': { lat: 51.1215, lng: -114.0076, name: 'Calgary International', city: 'Calgary', country: 'Canada' },

  // North America - Mexico
  'MEX': { lat: 19.4363, lng: -99.0721, name: 'Mexico City International', city: 'Mexico City', country: 'Mexico' },
  'CUN': { lat: 21.0365, lng: -86.8771, name: 'Cancún International', city: 'Cancun', country: 'Mexico' },
  'GDL': { lat: 20.5218, lng: -103.3111, name: 'Guadalajara International', city: 'Guadalajara', country: 'Mexico' },

  // Europe - United Kingdom
  'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow', city: 'London', country: 'United Kingdom' },
  'LGW': { lat: 51.1537, lng: -0.1821, name: 'London Gatwick', city: 'London', country: 'United Kingdom' },
  'STN': { lat: 51.8860, lng: 0.2389, name: 'London Stansted', city: 'London', country: 'United Kingdom' },
  'LTN': { lat: 51.8763, lng: -0.3717, name: 'London Luton', city: 'London', country: 'United Kingdom' },
  'MAN': { lat: 53.3537, lng: -2.2750, name: 'Manchester', city: 'Manchester', country: 'United Kingdom' },
  'EDI': { lat: 55.9508, lng: -3.3615, name: 'Edinburgh', city: 'Edinburgh', country: 'United Kingdom' },
  'BHX': { lat: 52.4539, lng: -1.7480, name: 'Birmingham', city: 'Birmingham', country: 'United Kingdom' },

  // Europe - France
  'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France' },
  'ORY': { lat: 48.7233, lng: 2.3795, name: 'Paris Orly', city: 'Paris', country: 'France' },
  'NCE': { lat: 43.6584, lng: 7.2159, name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France' },
  'LYS': { lat: 45.7256, lng: 5.0811, name: 'Lyon-Saint Exupéry', city: 'Lyon', country: 'France' },
  'MRS': { lat: 43.4393, lng: 5.2214, name: 'Marseille Provence', city: 'Marseille', country: 'France' },

  // Europe - Germany
  'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt', city: 'Frankfurt', country: 'Germany' },
  'MUC': { lat: 48.3537, lng: 11.7750, name: 'Munich', city: 'Munich', country: 'Germany' },
  'BER': { lat: 52.3667, lng: 13.5033, name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  'DUS': { lat: 51.2895, lng: 6.7668, name: 'Düsseldorf', city: 'Dusseldorf', country: 'Germany' },
  'HAM': { lat: 53.6304, lng: 10.0065, name: 'Hamburg', city: 'Hamburg', country: 'Germany' },
  'CGN': { lat: 50.8659, lng: 7.1427, name: 'Cologne Bonn', city: 'Cologne', country: 'Germany' },

  // Europe - Italy
  'FCO': { lat: 41.8003, lng: 12.2389, name: 'Rome Fiumicino', city: 'Rome', country: 'Italy' },
  'MXP': { lat: 45.6306, lng: 8.7231, name: 'Milan Malpensa', city: 'Milan', country: 'Italy' },
  'LIN': { lat: 45.4451, lng: 9.2768, name: 'Milan Linate', city: 'Milan', country: 'Italy' },
  'VCE': { lat: 45.5053, lng: 12.3519, name: 'Venice Marco Polo', city: 'Venice', country: 'Italy' },
  'NAP': { lat: 40.8860, lng: 14.2908, name: 'Naples International', city: 'Naples', country: 'Italy' },
  'FLR': { lat: 43.8100, lng: 11.2051, name: 'Florence', city: 'Florence', country: 'Italy' },
  'BGY': { lat: 45.6739, lng: 9.7042, name: 'Milan Bergamo', city: 'Bergamo', country: 'Italy' },
  'PSA': { lat: 43.6839, lng: 10.3927, name: 'Pisa International', city: 'Pisa', country: 'Italy' },
  'BLQ': { lat: 44.5354, lng: 11.2887, name: 'Bologna Guglielmo Marconi', city: 'Bologna', country: 'Italy' },
  'CTA': { lat: 37.4668, lng: 15.0664, name: 'Catania-Fontanarossa', city: 'Catania', country: 'Italy' },
  'PMO': { lat: 38.1760, lng: 13.0910, name: 'Palermo Falcone-Borsellino', city: 'Palermo', country: 'Italy' },

  // Europe - Spain
  'MAD': { lat: 40.4983, lng: -3.5676, name: 'Madrid Barajas', city: 'Madrid', country: 'Spain' },
  'BCN': { lat: 41.2974, lng: 2.0833, name: 'Barcelona El Prat', city: 'Barcelona', country: 'Spain' },
  'AGP': { lat: 36.6749, lng: -4.4991, name: 'Málaga-Costa del Sol', city: 'Malaga', country: 'Spain' },
  'PMI': { lat: 39.5517, lng: 2.7388, name: 'Palma de Mallorca', city: 'Palma', country: 'Spain' },
  'ALC': { lat: 38.2822, lng: -0.5582, name: 'Alicante-Elche', city: 'Alicante', country: 'Spain' },
  'SVQ': { lat: 37.4180, lng: -5.8931, name: 'Seville', city: 'Seville', country: 'Spain' },
  'VLC': { lat: 39.4893, lng: -0.4816, name: 'Valencia', city: 'Valencia', country: 'Spain' },
  'IBZ': { lat: 38.8729, lng: 1.3731, name: 'Ibiza', city: 'Ibiza', country: 'Spain' },

  // Europe - Netherlands
  'AMS': { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },

  // Europe - Belgium
  'BRU': { lat: 50.9014, lng: 4.4844, name: 'Brussels', city: 'Brussels', country: 'Belgium' },

  // Europe - Switzerland
  'ZRH': { lat: 47.4647, lng: 8.5492, name: 'Zurich', city: 'Zurich', country: 'Switzerland' },
  'GVA': { lat: 46.2381, lng: 6.1089, name: 'Geneva', city: 'Geneva', country: 'Switzerland' },

  // Europe - Austria
  'VIE': { lat: 48.1103, lng: 16.5697, name: 'Vienna International', city: 'Vienna', country: 'Austria' },

  // Europe - Portugal
  'LIS': { lat: 38.7756, lng: -9.1354, name: 'Lisbon Humberto Delgado', city: 'Lisbon', country: 'Portugal' },
  'OPO': { lat: 41.2481, lng: -8.6814, name: 'Porto Francisco Sá Carneiro', city: 'Porto', country: 'Portugal' },
  'FAO': { lat: 37.0144, lng: -7.9659, name: 'Faro', city: 'Faro', country: 'Portugal' },

  // Europe - Greece
  'ATH': { lat: 37.9364, lng: 23.9445, name: 'Athens International', city: 'Athens', country: 'Greece' },
  'SKG': { lat: 40.5197, lng: 22.9709, name: 'Thessaloniki', city: 'Thessaloniki', country: 'Greece' },
  'HER': { lat: 35.3397, lng: 25.1803, name: 'Heraklion Nikos Kazantzakis', city: 'Heraklion', country: 'Greece' },
  'JTR': { lat: 36.3992, lng: 25.4793, name: 'Santorini', city: 'Santorini', country: 'Greece' },
  'JMK': { lat: 37.4351, lng: 25.3481, name: 'Mykonos', city: 'Mykonos', country: 'Greece' },
  'RHO': { lat: 36.4054, lng: 28.0862, name: 'Rhodes Diagoras', city: 'Rhodes', country: 'Greece' },
  'CFU': { lat: 39.6019, lng: 19.9117, name: 'Corfu', city: 'Corfu', country: 'Greece' },

  // Europe - Ireland
  'DUB': { lat: 53.4264, lng: -6.2499, name: 'Dublin', city: 'Dublin', country: 'Ireland' },

  // Europe - Czech Republic
  'PRG': { lat: 50.1008, lng: 14.2600, name: 'Prague Václav Havel', city: 'Prague', country: 'Czech Republic' },

  // Europe - Poland
  'WAW': { lat: 52.1657, lng: 20.9671, name: 'Warsaw Chopin', city: 'Warsaw', country: 'Poland' },
  'KRK': { lat: 50.0777, lng: 19.7848, name: 'Kraków John Paul II', city: 'Krakow', country: 'Poland' },

  // Europe - Hungary
  'BUD': { lat: 47.4298, lng: 19.2611, name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungary' },

  // Europe - Denmark
  'CPH': { lat: 55.6180, lng: 12.6508, name: 'Copenhagen', city: 'Copenhagen', country: 'Denmark' },

  // Europe - Sweden
  'ARN': { lat: 59.6519, lng: 17.9186, name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },

  // Europe - Norway
  'OSL': { lat: 60.1939, lng: 11.1004, name: 'Oslo Gardermoen', city: 'Oslo', country: 'Norway' },

  // Europe - Finland
  'HEL': { lat: 60.3172, lng: 24.9633, name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },

  // Europe - Romania
  'OTP': { lat: 44.5711, lng: 26.0850, name: 'Henri Coandă International', city: 'Bucharest', country: 'Romania' },

  // Europe - Croatia
  'ZAG': { lat: 45.7429, lng: 16.0688, name: 'Zagreb Franjo Tuđman', city: 'Zagreb', country: 'Croatia' },
  'DBV': { lat: 42.5614, lng: 18.2682, name: 'Dubrovnik', city: 'Dubrovnik', country: 'Croatia' },
  'SPU': { lat: 43.5389, lng: 16.2980, name: 'Split', city: 'Split', country: 'Croatia' },

  // Europe - Turkey
  'IST': { lat: 41.2753, lng: 28.7519, name: 'Istanbul', city: 'Istanbul', country: 'Turkey' },
  'SAW': { lat: 40.8986, lng: 29.3092, name: 'Istanbul Sabiha Gökçen', city: 'Istanbul', country: 'Turkey' },
  'AYT': { lat: 36.8987, lng: 30.8005, name: 'Antalya', city: 'Antalya', country: 'Turkey' },

  // Europe - Russia
  'SVO': { lat: 55.9726, lng: 37.4146, name: 'Moscow Sheremetyevo', city: 'Moscow', country: 'Russia' },
  'DME': { lat: 55.4088, lng: 37.9063, name: 'Moscow Domodedovo', city: 'Moscow', country: 'Russia' },
  'LED': { lat: 59.8003, lng: 30.2625, name: 'St. Petersburg Pulkovo', city: 'Saint Petersburg', country: 'Russia' },

  // Europe - Albania
  'TIA': { lat: 41.4147, lng: 19.7206, name: 'Tirana International', city: 'Tirana', country: 'Albania' },

  // Asia - UAE
  'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai International', city: 'Dubai', country: 'United Arab Emirates' },
  'AUH': { lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'United Arab Emirates' },

  // Asia - Qatar
  'DOH': { lat: 25.2609, lng: 51.6138, name: 'Hamad International', city: 'Doha', country: 'Qatar' },

  // Asia - Singapore
  'SIN': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi', city: 'Singapore', country: 'Singapore' },

  // Asia - Hong Kong
  'HKG': { lat: 22.3080, lng: 113.9185, name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong' },

  // Asia - Japan
  'NRT': { lat: 35.7720, lng: 140.3929, name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan' },
  'HND': { lat: 35.5494, lng: 139.7798, name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan' },
  'KIX': { lat: 34.4347, lng: 135.2441, name: 'Osaka Kansai', city: 'Osaka', country: 'Japan' },
  'ITM': { lat: 34.7855, lng: 135.4380, name: 'Osaka Itami', city: 'Osaka', country: 'Japan' },
  'NGO': { lat: 34.8584, lng: 136.8050, name: 'Nagoya Chubu Centrair', city: 'Nagoya', country: 'Japan' },
  'FUK': { lat: 33.5859, lng: 130.4511, name: 'Fukuoka', city: 'Fukuoka', country: 'Japan' },

  // Asia - South Korea
  'ICN': { lat: 37.4602, lng: 126.4407, name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  'GMP': { lat: 37.5583, lng: 126.7906, name: 'Seoul Gimpo', city: 'Seoul', country: 'South Korea' },

  // Asia - China
  'PEK': { lat: 40.0799, lng: 116.6031, name: 'Beijing Capital', city: 'Beijing', country: 'China' },
  'PKX': { lat: 39.5098, lng: 116.4106, name: 'Beijing Daxing', city: 'Beijing', country: 'China' },
  'PVG': { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong', city: 'Shanghai', country: 'China' },
  'SHA': { lat: 31.1979, lng: 121.3363, name: 'Shanghai Hongqiao', city: 'Shanghai', country: 'China' },
  'CAN': { lat: 23.3924, lng: 113.2988, name: 'Guangzhou Baiyun', city: 'Guangzhou', country: 'China' },
  'SZX': { lat: 22.6393, lng: 113.8107, name: 'Shenzhen Bao\'an', city: 'Shenzhen', country: 'China' },

  // Asia - Thailand
  'BKK': { lat: 13.6900, lng: 100.7501, name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand' },
  'DMK': { lat: 13.9126, lng: 100.6068, name: 'Bangkok Don Mueang', city: 'Bangkok', country: 'Thailand' },
  'HKT': { lat: 8.1132, lng: 98.3169, name: 'Phuket', city: 'Phuket', country: 'Thailand' },

  // Asia - Malaysia
  'KUL': { lat: 2.7456, lng: 101.7099, name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },

  // Asia - Indonesia
  'CGK': { lat: -6.1256, lng: 106.6559, name: 'Jakarta Soekarno-Hatta', city: 'Jakarta', country: 'Indonesia' },
  'DPS': { lat: -8.7482, lng: 115.1672, name: 'Ngurah Rai International', city: 'Bali', country: 'Indonesia' },

  // Asia - Vietnam
  'SGN': { lat: 10.8188, lng: 106.6520, name: 'Tan Son Nhat', city: 'Ho Chi Minh City', country: 'Vietnam' },
  'HAN': { lat: 21.2187, lng: 105.8044, name: 'Noi Bai', city: 'Hanoi', country: 'Vietnam' },

  // Asia - Philippines
  'MNL': { lat: 14.5086, lng: 121.0194, name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },

  // Asia - India
  'DEL': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi International', city: 'New Delhi', country: 'India' },
  'BOM': { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India' },
  'BLR': { lat: 13.1986, lng: 77.7066, name: 'Kempegowda International', city: 'Bangalore', country: 'India' },

  // Oceania - Australia
  'SYD': { lat: -33.9399, lng: 151.1753, name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia' },
  'MEL': { lat: -37.6690, lng: 144.8410, name: 'Melbourne', city: 'Melbourne', country: 'Australia' },
  'BNE': { lat: -27.3942, lng: 153.1218, name: 'Brisbane', city: 'Brisbane', country: 'Australia' },
  'PER': { lat: -31.9385, lng: 115.9672, name: 'Perth', city: 'Perth', country: 'Australia' },

  // Oceania - New Zealand
  'AKL': { lat: -37.0082, lng: 174.7850, name: 'Auckland', city: 'Auckland', country: 'New Zealand' },

  // South America - Brazil
  'GRU': { lat: -23.4356, lng: -46.4731, name: 'São Paulo Guarulhos', city: 'Sao Paulo', country: 'Brazil' },
  'GIG': { lat: -22.8099, lng: -43.2505, name: 'Rio de Janeiro Galeão', city: 'Rio de Janeiro', country: 'Brazil' },

  // South America - Argentina
  'EZE': { lat: -34.8222, lng: -58.5358, name: 'Buenos Aires Ezeiza', city: 'Buenos Aires', country: 'Argentina' },

  // South America - Chile
  'SCL': { lat: -33.3930, lng: -70.7858, name: 'Santiago Arturo Merino Benítez', city: 'Santiago', country: 'Chile' },

  // South America - Colombia
  'BOG': { lat: 4.7016, lng: -74.1469, name: 'El Dorado International', city: 'Bogota', country: 'Colombia' },

  // South America - Peru
  'LIM': { lat: -12.0219, lng: -77.1143, name: 'Jorge Chávez International', city: 'Lima', country: 'Peru' },

  // Africa - South Africa
  'JNB': { lat: -26.1392, lng: 28.2460, name: 'O. R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
  'CPT': { lat: -33.9715, lng: 18.6021, name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },

  // Africa - Egypt
  'CAI': { lat: 30.1219, lng: 31.4056, name: 'Cairo International', city: 'Cairo', country: 'Egypt' },

  // Africa - Morocco
  'CMN': { lat: 33.3675, lng: -7.5900, name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
  'RAK': { lat: 31.6069, lng: -8.0363, name: 'Marrakech Menara', city: 'Marrakech', country: 'Morocco' },

  // Africa - Kenya
  'NBO': { lat: -1.3192, lng: 36.9278, name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },

  // Middle East - Israel
  'TLV': { lat: 32.0055, lng: 34.8854, name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },

  // Middle East - Saudi Arabia
  'RUH': { lat: 24.9576, lng: 46.6988, name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
  'JED': { lat: 21.6796, lng: 39.1565, name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
}

/**
 * Get airport coordinates by IATA code
 * @param iataCode - The 3-letter IATA airport code
 * @returns Airport data with coordinates or null if not found
 */
export function getAirportCoordinates(iataCode: string): AirportData | null {
  if (!iataCode) return null
  return AIRPORT_COORDINATES[iataCode.toUpperCase()] || null
}

/**
 * Get airport coordinates with lat/lng only
 * @param iataCode - The 3-letter IATA airport code
 * @returns Object with lat and lng or null if not found
 */
export function getAirportLatLng(iataCode: string): { lat: number; lng: number } | null {
  const data = getAirportCoordinates(iataCode)
  if (!data) return null
  return { lat: data.lat, lng: data.lng }
}
