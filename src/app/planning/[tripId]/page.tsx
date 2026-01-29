'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanningProgress, PlanningStatus } from '@/components/planning/planning-progress'

export default function PlanningPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string

  const [status, setStatus] = useState<PlanningStatus>({
    flights: 'pending',
    itinerary: 'pending',
    hotels: 'pending',
    places: 'pending',
    details: 'pending',
  })
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [tripTitle, setTripTitle] = useState('')
  const [destination, setDestination] = useState('')

  useEffect(() => {
    // Poll for status updates
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}/status`)
        const data = await response.json()

        if (data.progress) {
          setStatus(data.progress)
        }

        if (data.title) {
          setTripTitle(data.title)
        }

        setIsComplete(data.isComplete || false)
        setHasError(data.hasError || false)

        // Extract destination from title
        if (data.title) {
          const match = data.title.match(/(?:to|in)\s+(.+)/i)
          if (match) {
            setDestination(match[1])
          }
        }
      } catch (error) {
        console.error('Error polling status:', error)
      }
    }

    // Initial poll
    pollStatus()

    // Set up polling interval
    const interval = setInterval(() => {
      if (!isComplete) {
        pollStatus()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [tripId, isComplete])

  const handleViewTrip = () => {
    router.push(`/trip/${tripId}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          {isComplete ? 'Your trip is ready!' : 'Planning your adventure...'}
        </h1>

        <p className="text-lg text-muted-foreground">
          {isComplete
            ? tripTitle || 'Everything is set for your trip'
            : destination
            ? `Creating the perfect experience in ${destination}`
            : 'Finding flights, hotels, and creating your itinerary'}
        </p>
      </motion.div>

      <PlanningProgress status={status} destination={destination} />

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10"
        >
          <Button size="lg" onClick={handleViewTrip} className="rounded-xl h-14 px-8">
            View Your Trip
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Some features couldn't be loaded, but you can still view your trip.
          </p>
          <Button variant="outline" onClick={handleViewTrip}>
            View Trip Anyway
          </Button>
        </motion.div>
      )}
    </div>
  )
}
