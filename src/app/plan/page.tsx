'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  MapPin, 
  CalendarDays, 
  Users, 
  Plane,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { DateRange } from 'react-day-picker'

export default function PlanPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  // Form state - minimal inputs
  const [destination, setDestination] = useState('')
  const [departureCity, setDepartureCity] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 14),
    to: addDays(new Date(), 21),
  })
  
  // Optional preferences
  const [budget, setBudget] = useState<'budget' | 'mid-range' | 'luxury'>('mid-range')
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'active'>('moderate')

  const generationSteps = [
    'Analyzing destination...',
    'Searching for best flights...',
    'Finding perfect accommodations...',
    'Discovering attractions & activities...',
    'Creating optimized itinerary...',
    'Calculating total costs...',
    'Finalizing your trip plan...'
  ]

  const handleGenerate = async () => {
    if (!destination || !departureCity || !dateRange?.from || !dateRange?.to) {
      return
    }

    setIsGenerating(true)
    
    // Simulate step-by-step generation with visual feedback
    for (let i = 0; i < generationSteps.length; i++) {
      setGenerationStep(generationSteps[i])
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
    }

    try {
      const response = await fetch('/api/trips/auto-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          departureCity,
          startDate: format(dateRange.from, 'yyyy-MM-dd'),
          endDate: format(dateRange.to, 'yyyy-MM-dd'),
          travelers,
          budget,
          pace,
        }),
      })

      const data = await response.json()
      
      if (data.tripId) {
        router.push(`/trip/${data.tripId}`)
      } else {
        throw new Error(data.error || 'Failed to generate trip')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setIsGenerating(false)
      setGenerationStep('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Plan Your Trip
            </h1>
            <p className="text-xl text-gray-600">
              Tell us where you want to go. We'll handle everything else.
            </p>
          </div>

          {/* Main Form */}
          <AnimatePresence mode="wait">
            {!isGenerating ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl shadow-xl p-8 space-y-6"
              >
                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-base font-medium flex items-center gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Where do you want to go?
                  </Label>
                  <Input
                    id="destination"
                    placeholder="Paris, Japan, Tuscany..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-14 text-lg rounded-xl border border-gray-300 !bg-transparent text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500">
                    Enter a city, region, or country
                  </p>
                </div>

                {/* Departure City */}
                <div className="space-y-2">
                  <Label htmlFor="departure" className="text-base font-medium flex items-center gap-2 text-gray-900">
                    <Plane className="w-4 h-4 text-blue-600" />
                    Where are you flying from?
                  </Label>
                  <Input
                    id="departure"
                    placeholder="New York, London, Tokyo..."
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    className="h-14 text-lg rounded-xl border border-gray-300 !bg-transparent text-gray-900 placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2 text-gray-900">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    When are you traveling?
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-14 text-lg rounded-xl border border-gray-300 !bg-transparent justify-start text-left font-normal hover:bg-gray-50 text-gray-900"
                      >
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
                              <span className="ml-auto text-gray-500">
                                ({Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} nights)
                              </span>
                            </>
                          ) : (
                            format(dateRange.from, 'MMM d, yyyy')
                          )
                        ) : (
                          <span className="text-gray-400">Select your travel dates</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Travelers */}
                <div className="space-y-2">
                  <Label className="text-base font-medium flex items-center gap-2 text-gray-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    How many travelers?
                  </Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-xl border border-gray-300 !bg-transparent text-gray-700 hover:bg-gray-50"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      disabled={travelers <= 1}
                    >
                      -
                    </Button>
                    <span className="text-2xl font-semibold w-12 text-center text-gray-900">{travelers}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 rounded-xl border border-gray-300 !bg-transparent text-gray-700 hover:bg-gray-50"
                      onClick={() => setTravelers(Math.min(10, travelers + 1))}
                      disabled={travelers >= 10}
                    >
                      +
                    </Button>
                    <span className="text-gray-600">
                      {travelers === 1 ? 'traveler' : 'travelers'}
                    </span>
                  </div>
                </div>

                {/* Advanced Options Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showAdvanced ? 'Hide' : 'Show'} preferences
                </button>

                {/* Advanced Options */}
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {/* Budget */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Budget Level</Label>
                        <div className="flex gap-2">
                          {(['budget', 'mid-range', 'luxury'] as const).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setBudget(level)}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all capitalize ${
                                budget === level
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pace */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Travel Pace</Label>
                        <div className="flex gap-2">
                          {(['relaxed', 'moderate', 'active'] as const).map((level) => (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setPace(level)}
                              className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all capitalize ${
                                pace === level
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={!destination || !departureCity || !dateRange?.from || !dateRange?.to}
                  className="w-full h-16 text-xl rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-600/40 transition-all disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Generate My Trip
                </Button>

                <p className="text-center text-sm text-gray-500">
                  We'll find the best flights, hotels, and activities automatically
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-xl p-12 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8"
                >
                  <Sparkles className="w-10 h-10 text-primary" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Creating Your Perfect Trip
                </h2>
                
                <motion.p
                  key={generationStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-gray-600 mb-8"
                >
                  {generationStep}
                </motion.p>

                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: 'easeInOut' }}
                  />
                </div>

                <p className="mt-6 text-sm text-gray-500">
                  This usually takes about 10-15 seconds
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
