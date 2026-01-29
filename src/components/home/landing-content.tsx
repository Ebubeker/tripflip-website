'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plane,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Wallet,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DestinationSearch, DestinationResult, QuickOptions, TripOptions } from '@/components/home'
import { addWeeks, addDays } from 'date-fns'
import { toast } from 'sonner'

const popularDestinations = [
  { name: 'Paris', country: 'France', emoji: '🗼' },
  { name: 'Tokyo', country: 'Japan', emoji: '🗾' },
  { name: 'New York', country: 'USA', emoji: '🗽' },
  { name: 'Bali', country: 'Indonesia', emoji: '🏝️' },
  { name: 'Rome', country: 'Italy', emoji: '🏛️' },
  { name: 'Barcelona', country: 'Spain', emoji: '⛪' },
]

const features = [
  {
    icon: Plane,
    title: 'Auto-find Flights',
    description: 'We find the best combination of price and travel time',
  },
  {
    icon: Clock,
    title: 'AI Itinerary',
    description: 'Get a personalized day-by-day plan in seconds',
  },
  {
    icon: Wallet,
    title: 'Budget Smart',
    description: 'Stay within budget with smart recommendations',
  },
]

export function LandingContent() {
  const router = useRouter()
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<TripOptions>({
    startDate: addWeeks(new Date(), 2),
    endDate: addDays(addWeeks(new Date(), 2), 7),
    travelers: 1,
    budget: undefined,
    currency: 'USD',
    departureCity: undefined,
  })

  const handleDestinationSelect = (destination: DestinationResult) => {
    setSelectedDestination(destination)
  }

  const handleStartPlanning = async () => {
    if (!selectedDestination) {
      toast.error('Please select a destination first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/trips/auto-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            name: selectedDestination.fullName,
            coordinates: selectedDestination.coordinates,
          },
          departureCity: options.departureCity,
          startDate: options.startDate?.toISOString(),
          endDate: options.endDate?.toISOString(),
          travelers: options.travelers,
          budget: options.budget,
          currency: options.currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to create a trip')
          router.push('/login')
          return
        }
        throw new Error(data.error || 'Failed to create trip')
      }

      router.push(`/planning/${data.tripId}`)
    } catch (error) {
      console.error('Error starting trip:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start planning. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePopularDestination = async (destination: { name: string; country: string }) => {
    const query = `${destination.name}, ${destination.country}`
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        `types=place,locality&limit=1`
      )
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        setSelectedDestination({
          name: destination.name,
          fullName: feature.place_name,
          coordinates: feature.center,
          country: destination.country,
        })
      }
    } catch (error) {
      console.error('Error fetching destination:', error)
    }
  }

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered Trip Planning
              </div>

              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Where to next?
              </h1>

              <p className="mb-8 text-lg text-muted-foreground md:text-xl">
                Enter your dream destination and we'll plan everything for you
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-xl"
            >
              <DestinationSearch
                onSelect={handleDestinationSelect}
                placeholder="Search any destination..."
                autoFocus
              />

              {selectedDestination && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 flex items-center justify-center gap-2 text-sm text-primary"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{selectedDestination.fullName}</span>
                </motion.div>
              )}

              <div className="mt-6">
                <QuickOptions options={options} onChange={setOptions} />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <Button
                  size="lg"
                  onClick={handleStartPlanning}
                  disabled={!selectedDestination || isLoading}
                  className="h-14 px-8 text-lg rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating your trip...
                    </>
                  ) : (
                    <>
                      Plan My Trip
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Popular destinations
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {popularDestinations.map((dest) => (
              <Button
                key={dest.name}
                variant="outline"
                onClick={() => handlePopularDestination(dest)}
                className="rounded-full px-6 py-2 h-auto hover:bg-primary/10 hover:border-primary/30 transition-colors"
              >
                <span className="mr-2">{dest.emoji}</span>
                {dest.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                We handle everything
              </h2>
              <p className="text-lg text-muted-foreground">
                Just pick your destination. Our AI does the rest.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center h-full border-2 border-transparent hover:border-primary/20 transition-colors">
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="mb-2 font-semibold text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready for your next adventure?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start planning in seconds. No complex forms, no manual work.
            </p>
            <Button size="lg" asChild className="rounded-xl">
              <Link href="#" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Start Planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
