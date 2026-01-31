'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Plane,
  Building2,
  Wallet,
  Map,
  Share2,
  Download,
  ChevronRight,
  Clock,
  Star,
  Navigation,
  Utensils,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'

interface Trip {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  travelers_count: number
  total_budget: number
  currency: string
  status: string
  planning_status: string
}

interface Flight {
  id: string
  flight_type: string
  airline: string
  flight_number: string
  departure_airport: string
  departure_city: string
  arrival_airport: string
  arrival_city: string
  departure_datetime: string
  arrival_datetime: string
  price: number
  stops: number
}

interface Accommodation {
  id: string
  name: string
  city: string
  check_in_date: string
  check_out_date: string
  nights_count: number
  total_price: number
  rating: number
}

interface ItineraryItem {
  id: string
  date: string
  title: string
  description: string
  category: string
  start_time: string
  estimated_cost: number
  status: string
}

interface TripDestination {
  id: string
  city: string
  country: string
}

export default function TripPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string
  
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [destinations, setDestinations] = useState<TripDestination[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTripData()
  }, [tripId])

  const fetchTripData = async () => {
    try {
      // Fetch trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()

      if (tripError) throw tripError
      setTrip(tripData)

      // Fetch related data in parallel
      const [flightsRes, accommodationsRes, itineraryRes, destinationsRes] = await Promise.all([
        supabase.from('flights').select('*').eq('trip_id', tripId).order('departure_datetime'),
        supabase.from('accommodations').select('*').eq('trip_id', tripId),
        supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('date').order('start_time'),
        supabase.from('trip_destinations').select('*').eq('trip_id', tripId).order('order_index'),
      ])

      setFlights(flightsRes.data || [])
      setAccommodations(accommodationsRes.data || [])
      setItinerary(itineraryRes.data || [])
      setDestinations(destinationsRes.data || [])
    } catch (error) {
      console.error('Error fetching trip:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#0369a1] mx-auto mb-6" />
          <p className="text-gray-600 font-medium text-lg">Loading your trip...</p>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900">Trip not found</h2>
          <p className="text-gray-600 mb-6">This trip doesn't exist or you don't have access to it</p>
          <Button onClick={() => router.push('/plan')} className="bg-[#0369a1] hover:bg-[#0284c7]">Plan a new trip</Button>
        </div>
      </div>
    )
  }

  const startDate = parseISO(trip.start_date)
  const endDate = parseISO(trip.end_date)
  const nights = differenceInDays(endDate, startDate)
  const destination = destinations[0]?.city || 'Your Trip'

  // Group itinerary by date
  const itineraryByDate = itinerary.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  // Calculate costs
  const flightsCost = flights.reduce((sum, f) => sum + (f.price || 0), 0)
  const hotelsCost = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)
  const activitiesCost = itinerary.reduce((sum, i) => sum + (i.estimated_cost || 0), 0) * trip.travelers_count

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white pt-20 pb-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-white/90 mb-3"
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{destination}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold mb-5 tracking-tight"
            >
              {trip.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white/95 mb-8 max-w-3xl leading-relaxed"
            >
              {trip.description}
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-8"
            >
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80 font-medium">Dates</div>
                  <div className="font-semibold">{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')} <span className="text-white/80 font-normal">({nights} nights)</span></div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80 font-medium">Travelers</div>
                  <div className="font-semibold">{trip.travelers_count} {trip.travelers_count === 1 ? 'person' : 'people'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm text-white/80 font-medium">Budget</div>
                  <div className="text-2xl font-bold">${trip.total_budget?.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white/80 backdrop-blur-md border-b border-black/10 sticky top-16 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-black/10 hover:border-black/20 hover:bg-black/5 transition-all text-gray-900">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-black/10 hover:border-black/20 hover:bg-black/5 transition-all text-gray-900">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 border-black/10 hover:border-black/20 hover:bg-black/5 transition-all text-gray-900">
            <Map className="w-4 h-4" />
            View Map
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-black/10 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="rounded-lg px-6 !text-gray-900 hover:!text-gray-900 hover:bg-gray-50 data-[state=active]:!text-gray-900 data-[state=active]:bg-[#0369a1]/10 data-[state=active]:font-semibold transition-all">Overview</TabsTrigger>
            <TabsTrigger value="itinerary" className="rounded-lg px-6 !text-gray-900 hover:!text-gray-900 hover:bg-gray-50 data-[state=active]:!text-gray-900 data-[state=active]:bg-[#0369a1]/10 data-[state=active]:font-semibold transition-all">Itinerary</TabsTrigger>
            <TabsTrigger value="flights" className="rounded-lg px-6 !text-gray-900 hover:!text-gray-900 hover:bg-gray-50 data-[state=active]:!text-gray-900 data-[state=active]:bg-[#0369a1]/10 data-[state=active]:font-semibold transition-all">Flights</TabsTrigger>
            <TabsTrigger value="hotels" className="rounded-lg px-6 !text-gray-900 hover:!text-gray-900 hover:bg-gray-50 data-[state=active]:!text-gray-900 data-[state=active]:bg-[#0369a1]/10 data-[state=active]:font-semibold transition-all">Hotels</TabsTrigger>
            <TabsTrigger value="budget" className="rounded-lg px-6 !text-gray-900 hover:!text-gray-900 hover:bg-gray-50 data-[state=active]:!text-gray-900 data-[state=active]:bg-[#0369a1]/10 data-[state=active]:font-semibold transition-all">Budget</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-7 shadow-sm border border-black/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0369a1]/10 flex items-center justify-center">
                    <Plane className="w-6 h-6 text-[#0369a1]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Flights</p>
                    <p className="text-2xl font-bold text-gray-900">{flights.length > 0 ? `${flights.length} booked` : 'Not found'}</p>
                  </div>
                </div>
                {flights[0] && (
                  <p className="text-sm text-gray-600 font-medium">
                    {flights[0].departure_airport} → {flights[0].arrival_airport}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-7 shadow-sm border border-black/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Accommodation</p>
                    <p className="text-2xl font-bold text-gray-900">{nights} nights</p>
                  </div>
                </div>
                {accommodations[0] && (
                  <p className="text-sm text-gray-600 font-medium">{accommodations[0].name}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-7 shadow-sm border border-black/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Activities</p>
                    <p className="text-2xl font-bold text-gray-900">{itinerary.length} planned</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  ~{Math.round(itinerary.length / nights)} per day
                </p>
              </motion.div>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-black/10">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Trip Highlights</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {itinerary.slice(0, 6).map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-all border border-black/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0369a1] to-[#0ea5e9] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 leading-snug">{item.title}</p>
                      <p className="text-sm text-gray-500 capitalize mt-0.5">{item.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            {Object.entries(itineraryByDate).map(([date, items], dayIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-black/10 overflow-hidden"
              >
                {/* Day Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 px-8 py-5 border-b border-black/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Day {dayIndex + 1}</p>
                      <p className="text-xl font-bold text-gray-900 mt-0.5">{format(parseISO(date), 'EEEE, MMMM d')}</p>
                    </div>
                    <div className="text-sm text-gray-600 font-medium bg-white px-3 py-1.5 rounded-full border border-black/10">
                      {items.length} {items.length === 1 ? 'activity' : 'activities'}
                    </div>
                  </div>
                </div>

                {/* Activities */}
                <div className="p-6 space-y-4">
                  {items.map((item, i) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Time */}
                      <div className="w-16 text-sm text-gray-500 pt-1">
                        {item.start_time || '--:--'}
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          item.category === 'meal' ? 'bg-orange-400' :
                          item.category === 'activity' ? 'bg-blue-400' :
                          'bg-gray-400'
                        }`} />
                        {i < items.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          {item.estimated_cost > 0 && (
                            <span>${item.estimated_cost}</span>
                          )}
                          <span className="capitalize">{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {Object.keys(itineraryByDate).length === 0 && (
              <div className="bg-white rounded-2xl p-16 text-center border border-black/10 shadow-sm">
                <div className="max-w-sm mx-auto">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No itinerary items yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start planning your daily activities</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="space-y-4">
            {flights.map((flight) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-black/10 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    flight.flight_type === 'outbound' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {flight.flight_type === 'outbound' ? 'Departure' : 'Return'}
                  </span>
                  <span className="text-lg font-bold text-gray-900">${flight.price?.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-8">
                  {/* Departure */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.departure_airport}</p>
                    <p className="text-sm text-gray-500">{flight.departure_city}</p>
                    {flight.departure_datetime && (
                      <p className="text-sm font-medium mt-2 text-gray-700">
                        {format(parseISO(flight.departure_datetime), 'HH:mm')}
                      </p>
                    )}
                  </div>

                  {/* Flight Line */}
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                    <Plane className="w-5 h-5 text-gray-400 mx-2" />
                    <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{flight.arrival_airport}</p>
                    <p className="text-sm text-gray-500">{flight.arrival_city}</p>
                    {flight.arrival_datetime && (
                      <p className="text-sm font-medium mt-2 text-gray-700">
                        {format(parseISO(flight.arrival_datetime), 'HH:mm')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-black/10 flex items-center justify-between text-sm text-gray-600 font-medium">
                  <span>{flight.airline} • {flight.flight_number}</span>
                  <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
                </div>
              </motion.div>
            ))}

            {flights.length === 0 && (
              <div className="bg-white rounded-2xl p-16 text-center border border-black/10 shadow-sm">
                <div className="max-w-sm mx-auto">
                  <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No flights found for this trip</p>
                  <p className="text-gray-500 text-sm mt-2">Try searching for flights manually</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Hotels Tab */}
          <TabsContent value="hotels" className="space-y-4">
            {accommodations.map((hotel) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-black/10 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                    <p className="text-gray-500">{hotel.city}</p>
                  </div>
                  {hotel.rating && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{hotel.rating}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">{format(parseISO(hotel.check_in_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">{format(parseISO(hotel.check_out_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-black/10">
                  <span className="text-gray-600 font-medium">{hotel.nights_count} {hotel.nights_count === 1 ? 'night' : 'nights'}</span>
                  <span className="text-2xl font-bold text-gray-900">${hotel.total_price?.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}

            {accommodations.length === 0 && (
              <div className="bg-white rounded-2xl p-16 text-center border border-black/10 shadow-sm">
                <div className="max-w-sm mx-auto">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium text-lg">No accommodations found</p>
                  <p className="text-gray-500 text-sm mt-2">Search and book your stay</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            {/* Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-[#0369a1] via-[#0284c7] to-[#0ea5e9] text-white rounded-2xl p-8 overflow-hidden shadow-lg"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              </div>
              <div className="relative z-10">
                <p className="text-white/90 mb-2 font-medium">Total Trip Cost</p>
                <p className="text-5xl md:text-6xl font-bold tracking-tight">${trip.total_budget?.toLocaleString()}</p>
                <p className="text-white/80 mt-3 text-lg">
                  ${Math.round((trip.total_budget || 0) / trip.travelers_count).toLocaleString()} per person
                </p>
              </div>
            </motion.div>

            {/* Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-black/10 space-y-4"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Cost Breakdown</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-black/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0369a1]/10 flex items-center justify-center">
                      <Plane className="w-6 h-6 text-[#0369a1]" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Flights</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">${flightsCost.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-black/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Accommodation</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">${hotelsCost.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-black/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-violet-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Activities</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">${activitiesCost.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-black/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-600/10 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Estimated Meals</span>
                  </div>
                  <span className="font-bold text-gray-900 text-xl">
                    ${Math.round((trip.total_budget || 0) - flightsCost - hotelsCost - activitiesCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Per Day */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-black/10"
            >
              <h3 className="text-xl font-bold mb-6 text-gray-900">Daily Average</h3>
              <div className="text-4xl md:text-5xl font-bold text-[#0369a1]">
                ${Math.round((trip.total_budget || 0) / nights).toLocaleString()}
                <span className="text-lg font-normal text-gray-500"> / day</span>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
