'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  Users, 
  Plane,
  Building2,
  Wallet,
  Clock,
  Star,
  Utensils,
  Camera,
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronDown
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
}

interface Flight {
  id: string
  flight_type: string
  airline: string
  departure_airport: string
  arrival_airport: string
  departure_datetime: string
  price: number
  stops: number
}

interface Accommodation {
  id: string
  name: string
  city: string
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
}

interface TripDestination {
  city: string
  country: string
}

export default function SharedTripPage() {
  const params = useParams()
  const shareId = params.shareId as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [destinations, setDestinations] = useState<TripDestination[]>([])
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchSharedTrip()
  }, [shareId])

  const fetchSharedTrip = async () => {
    try {
      // Find trip by share token
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('share_token', shareId)
        .eq('is_public', true)
        .single()

      if (tripError || !tripData) {
        setError('Trip not found or is no longer shared')
        setLoading(false)
        return
      }

      setTrip(tripData)

      // Fetch related data
      const [flightsRes, accommodationsRes, itineraryRes, destinationsRes] = await Promise.all([
        supabase.from('flights').select('*').eq('trip_id', tripData.id).order('departure_datetime'),
        supabase.from('accommodations').select('*').eq('trip_id', tripData.id),
        supabase.from('itinerary_items').select('*').eq('trip_id', tripData.id).order('date').order('start_time'),
        supabase.from('trip_destinations').select('city, country').eq('trip_id', tripData.id).order('order_index'),
      ])

      setFlights(flightsRes.data || [])
      setAccommodations(accommodationsRes.data || [])
      setItinerary(itineraryRes.data || [])
      setDestinations(destinationsRes.data || [])
    } catch (err) {
      setError('Failed to load trip')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading shared trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'This trip may have been deleted or is no longer shared.'}</p>
          <Link href="/plan">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" />
              Plan Your Own Trip
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const startDate = parseISO(trip.start_date)
  const endDate = parseISO(trip.end_date)
  const nights = differenceInDays(endDate, startDate)
  const destination = destinations[0]?.city || 'Trip'

  // Group itinerary by date
  const itineraryByDate = itinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date].push(item)
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  const flightsCost = flights.reduce((sum, f) => sum + (f.price || 0), 0)
  const hotelsCost = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-6 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">TripFlip</Link>
          <Link href="/plan">
            <Button variant="secondary" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Plan Your Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/90 to-primary/70 text-white pb-12 pt-8">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {destination}{destinations[0]?.country ? `, ${destinations[0].country}` : ''}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{trip.title}</h1>
            {trip.description && (
              <p className="text-xl text-white/90 mb-6 max-w-2xl">{trip.description}</p>
            )}
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{nights} nights</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{trip.travelers_count} travelers</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span className="font-semibold">${trip.total_budget?.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Plane className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Flights</p>
                <p className="text-xl font-bold">${flightsCost.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Accommodation</p>
                <p className="text-xl font-bold">${hotelsCost.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Activities</p>
                <p className="text-xl font-bold">{itinerary.length} planned</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Itinerary */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Day by Day Itinerary</h2>
          <div className="space-y-4">
            {Object.entries(itineraryByDate).map(([date, items], dayIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border overflow-hidden"
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === date ? null : date)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {dayIndex + 1}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{format(parseISO(date), 'EEEE, MMMM d')}</p>
                      <p className="text-sm text-gray-500">{items.length} activities</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedDay === date ? 'rotate-180' : ''}`} />
                </button>

                {expandedDay === date && (
                  <div className="px-6 pb-6 pt-2 border-t space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 py-3">
                        <div className="w-16 text-sm text-gray-500">
                          {item.start_time || '--:--'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex gap-3 mt-2 text-sm text-gray-500">
                            <span className="capitalize">{item.category}</span>
                            {item.estimated_cost > 0 && <span>${item.estimated_cost}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Flights */}
        {flights.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Flights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {flights.map((flight) => (
                <div key={flight.id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      flight.flight_type === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {flight.flight_type === 'outbound' ? 'Departure' : 'Return'}
                    </span>
                    <span className="font-bold">${flight.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{flight.departure_airport}</span>
                    <Plane className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold">{flight.arrival_airport}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{flight.airline}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hotels */}
        {accommodations.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Accommodation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {accommodations.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold">{hotel.name}</h3>
                    {hotel.rating && (
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{hotel.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500 mb-3">{hotel.city}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{hotel.nights_count} nights</span>
                    <span className="text-xl font-bold">${hotel.total_price?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Inspired by this trip?</p>
          <Link href="/plan">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Plan Your Own Adventure
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p className="text-gray-400">Powered by <Link href="/" className="text-white font-semibold hover:underline">TripFlip</Link></p>
      </footer>
    </div>
  )
}
