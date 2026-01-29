'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane,
  Hotel,
  Calendar,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface PlanningStep {
  id: string
  title: string
  description: string
  icon: typeof Plane
  status: 'pending' | 'in_progress' | 'completed' | 'error'
}

interface PlanSummary {
  flightsFound: number
  hotelsFound: number
  itineraryDaysGenerated: number
  estimatedTotalCost: number
}

export default function PlanningPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.tripId as string

  const [steps, setSteps] = useState<PlanningStep[]>([
    {
      id: 'flights',
      title: 'Searching Flights',
      description: 'Finding the best flight options between your destinations',
      icon: Plane,
      status: 'pending',
    },
    {
      id: 'hotels',
      title: 'Finding Hotels',
      description: 'Searching for accommodations at each destination',
      icon: Hotel,
      status: 'pending',
    },
    {
      id: 'itinerary',
      title: 'Generating Itinerary',
      description: 'Creating a personalized day-by-day plan with AI',
      icon: Calendar,
      status: 'pending',
    },
  ])

  const [isPlanning, setIsPlanning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [summary, setSummary] = useState<PlanSummary | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Calculate progress
  const completedSteps = steps.filter((s) => s.status === 'completed').length
  const progress = (completedSteps / steps.length) * 100

  useEffect(() => {
    if (!isPlanning && !isComplete) {
      startPlanning()
    }
  }, [tripId])

  const startPlanning = async () => {
    setIsPlanning(true)
    setHasError(false)
    setErrors([])

    // Simulate step-by-step progress for better UX
    // In reality, the API does everything at once

    // Step 1: Flights
    setSteps((prev) =>
      prev.map((s) =>
        s.id === 'flights' ? { ...s, status: 'in_progress' } : s
      )
    )

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 2: Hotels
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 'flights') return { ...s, status: 'completed' }
        if (s.id === 'hotels') return { ...s, status: 'in_progress' }
        return s
      })
    )

    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Step 3: Itinerary
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === 'hotels') return { ...s, status: 'completed' }
        if (s.id === 'itinerary') return { ...s, status: 'in_progress' }
        return s
      })
    )

    // Call the planning API
    try {
      const response = await fetch(`/api/trips/${tripId}/plan`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Planning failed')
      }

      // Mark all steps as complete
      setSteps((prev) =>
        prev.map((s) => ({ ...s, status: 'completed' }))
      )

      setSummary(result.summary)

      if (result.errors && result.errors.length > 0) {
        setErrors(result.errors)
      }

      setIsComplete(true)
      toast.success('Trip planning complete!')
    } catch (error) {
      console.error('Planning error:', error)
      setHasError(true)

      // Mark current step as error
      setSteps((prev) =>
        prev.map((s) =>
          s.status === 'in_progress' ? { ...s, status: 'error' } : s
        )
      )

      toast.error('Failed to complete trip planning')
    } finally {
      setIsPlanning(false)
    }
  }

  const handleViewSuggestions = () => {
    router.push(`/trips/${tripId}/suggestions`)
  }

  const handleRetry = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'pending' })))
    setIsComplete(false)
    startPlanning()
  }

  const handleSkip = () => {
    router.push(`/trips/${tripId}`)
  }

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isComplete ? 'Your Trip is Ready!' : 'Planning Your Trip'}
        </h1>
        <p className="text-muted-foreground">
          {isComplete
            ? 'We found flights, hotels, and created a personalized itinerary'
            : 'Finding the best options and creating your personalized itinerary'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center mt-2">
          {isComplete ? 'Complete' : `${completedSteps} of ${steps.length} steps`}
        </p>
      </div>

      {/* Steps */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  {/* Status Icon */}
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                      step.status === 'completed'
                        ? 'bg-green-100 text-green-600'
                        : step.status === 'in_progress'
                        ? 'bg-primary/10 text-primary'
                        : step.status === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : step.status === 'in_progress' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium ${
                        step.status === 'pending'
                          ? 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {isComplete && summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">What We Found</CardTitle>
              <CardDescription>
                Review and customize these suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Plane className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{summary.flightsFound}</p>
                    <p className="text-sm text-muted-foreground">
                      Flight options
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Hotel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{summary.hotelsFound}</p>
                    <p className="text-sm text-muted-foreground">
                      Hotel options
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {summary.itineraryDaysGenerated}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Days planned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      ${summary.estimatedTotalCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Est. cost
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors/Warnings */}
          {errors.length > 0 && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      Some items could not be found
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      {errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        {isComplete ? (
          <>
            <Button variant="outline" onClick={handleSkip}>
              Skip to Trip
            </Button>
            <Button onClick={handleViewSuggestions}>
              Review Suggestions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : hasError ? (
          <>
            <Button variant="outline" onClick={handleSkip}>
              Skip Planning
            </Button>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  )
}
