'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  MapPin,
  Calendar,
  Users,
  Wallet,
  MoreVertical,
  Trash2,
  Share2,
  ExternalLink,
  Loader2,
  Plane
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'

interface Trip {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  travelers_count: number
  total_budget: number
  status: string
  trip_destinations: Array<{ city: string; country: string }>
}

export default function TripsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<Trip[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/trips')
        return
      }

      const { data, error } = await supabase
        .from('trips')
        .select(`
          id,
          title,
          description,
          start_date,
          end_date,
          travelers_count,
          total_budget,
          status,
          trip_destinations (city, country)
        `)
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })

      if (error) throw error
      setTrips(data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) throw error
      setTrips(trips.filter(t => t.id !== tripId))
    } catch (error) {
      console.error('Error deleting trip:', error)
    }
  }

  const shareTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/share`, { method: 'POST' })
      const data = await response.json()
      
      if (data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl)
        alert('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing trip:', error)
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true
    const endDate = parseISO(trip.end_date)
    if (filter === 'upcoming') return isFuture(endDate) || isToday(endDate)
    if (filter === 'past') return isPast(endDate) && !isToday(endDate)
    return true
  })

  const getTripStatus = (trip: Trip) => {
    const start = parseISO(trip.start_date)
    const end = parseISO(trip.end_date)
    const now = new Date()
    
    if (isPast(end)) return { label: 'Completed', color: 'bg-gray-100 text-gray-600' }
    if (isFuture(start)) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-600' }
    return { label: 'In Progress', color: 'bg-green-100 text-green-600' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-gray-500">{trips.length} trips planned</p>
          </div>
          <Link href="/plan">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Plan New Trip
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Trips Grid */}
        {filteredTrips.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, i) => {
              const status = getTripStatus(trip)
              const destination = trip.trip_destinations?.[0]
              
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/trip/${trip.id}`)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareTrip(trip.id)}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Trip
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteTrip(trip.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1">{trip.title}</h3>
                    {destination && (
                      <p className="text-white/80 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {destination.city}{destination.country ? `, ${destination.country}` : ''}
                      </p>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {format(parseISO(trip.start_date), 'MMM d')} - {format(parseISO(trip.end_date), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{trip.travelers_count} travelers</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">${trip.total_budget?.toLocaleString() || '0'}</span>
                      </div>
                      <Link href={`/trip/${trip.id}`}>
                        <Button variant="outline" size="sm">
                          View Trip
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "Start planning your first adventure!"
                : `No ${filter} trips found.`}
            </p>
            <Link href="/plan">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Plan Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
