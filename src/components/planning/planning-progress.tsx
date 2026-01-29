'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Calendar, Hotel, MapPin, Sparkles, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PlanningStatus {
  flights: 'pending' | 'in_progress' | 'completed' | 'error'
  itinerary: 'pending' | 'in_progress' | 'completed' | 'error'
  hotels: 'pending' | 'in_progress' | 'completed' | 'error'
  places: 'pending' | 'in_progress' | 'completed' | 'error'
  details: 'pending' | 'in_progress' | 'completed' | 'error'
}

interface PlanningProgressProps {
  status: PlanningStatus
  destination: string
}

const steps = [
  {
    id: 'flights' as const,
    label: 'Finding best flights',
    icon: Plane,
    activeMessage: 'Searching for the best flight deals...',
  },
  {
    id: 'itinerary' as const,
    label: 'Creating your itinerary',
    icon: Calendar,
    activeMessage: 'AI is crafting your perfect day-by-day plan...',
  },
  {
    id: 'hotels' as const,
    label: 'Searching hotels',
    icon: Hotel,
    activeMessage: 'Finding comfortable places to stay...',
  },
  {
    id: 'places' as const,
    label: 'Discovering places to visit',
    icon: MapPin,
    activeMessage: 'Discovering must-see attractions...',
  },
  {
    id: 'details' as const,
    label: 'Finalizing your trip',
    icon: Sparkles,
    activeMessage: 'Adding the finishing touches...',
  },
]

const funFacts = [
  "Did you know? The Eiffel Tower grows about 6 inches every summer due to heat expansion!",
  "Fun fact: Japan has over 6,800 islands, but only about 430 are inhabited.",
  "Tip: The best photos are often taken during the 'golden hour' - just after sunrise or before sunset.",
  "Did you know? Venice is built on over 100 small islands in the Adriatic Sea!",
  "Travel tip: Always keep a photo of your passport on your phone, just in case.",
  "Fun fact: Iceland has no mosquitoes!",
  "Did you know? The shortest commercial flight is just 90 seconds long.",
  "Travel tip: Pack a small first-aid kit with essentials for every trip.",
]

export function PlanningProgress({ status, destination }: PlanningProgressProps) {
  const completedSteps = Object.values(status).filter((s) => s === 'completed').length
  const progress = (completedSteps / 5) * 100

  const currentStep = steps.find((step) => status[step.id] === 'in_progress')
  const randomFact = funFacts[Math.floor(Date.now() / 5000) % funFacts.length]

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={352}
              strokeDashoffset={352 - (352 * progress) / 100}
              strokeLinecap="round"
              className="text-primary"
              initial={{ strokeDashoffset: 352 }}
              animate={{ strokeDashoffset: 352 - (352 * progress) / 100 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Current activity message */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-8"
          >
            <p className="text-lg font-medium">{currentStep.activeMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps list */}
      <div className="space-y-4">
        {steps.map((step) => {
          const stepStatus = status[step.id]
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-colors',
                stepStatus === 'in_progress' && 'bg-primary/10',
                stepStatus === 'completed' && 'bg-green-50 dark:bg-green-950/20',
                stepStatus === 'error' && 'bg-red-50 dark:bg-red-950/20',
                stepStatus === 'pending' && 'opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                  stepStatus === 'completed' && 'bg-green-100 text-green-600 dark:bg-green-900/50',
                  stepStatus === 'in_progress' && 'bg-primary/20 text-primary',
                  stepStatus === 'error' && 'bg-red-100 text-red-600 dark:bg-red-900/50',
                  stepStatus === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {stepStatus === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : stepStatus === 'in_progress' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : stepStatus === 'error' ? (
                  <XCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-medium',
                    stepStatus === 'pending' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Fun fact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 p-4 bg-muted/30 rounded-xl"
      >
        <p className="text-sm text-muted-foreground text-center">
          {randomFact}
        </p>
      </motion.div>
    </div>
  )
}
