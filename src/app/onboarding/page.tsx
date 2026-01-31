'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Gauge,
  Heart,
  Check
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

const budgetOptions = [
  { id: 'budget', label: 'Budget', desc: 'Hostels, budget airlines, street food', icon: '💰' },
  { id: 'mid-range', label: 'Mid-Range', desc: 'Nice hotels, good restaurants', icon: '🏨' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium everything, first class', icon: '✨' },
]

const paceOptions = [
  { id: 'relaxed', label: 'Relaxed', desc: '2-3 activities per day, plenty of rest', icon: '🧘' },
  { id: 'moderate', label: 'Moderate', desc: '3-4 activities, good balance', icon: '⚖️' },
  { id: 'active', label: 'Active', desc: '4-5+ activities, maximize experiences', icon: '🏃' },
]

const interestOptions = [
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'nature', label: 'Nature & Outdoors', icon: '🌲' },
  { id: 'food', label: 'Food & Dining', icon: '🍜' },
  { id: 'adventure', label: 'Adventure & Sports', icon: '🎿' },
  { id: 'relaxation', label: 'Relaxation & Wellness', icon: '💆' },
  { id: 'nightlife', label: 'Nightlife', icon: '🎉' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'family', label: 'Family Activities', icon: '👨‍👩‍👧' },
  { id: 'art', label: 'Art & Museums', icon: '🎨' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️' },
  { id: 'local', label: 'Local Experiences', icon: '🏘️' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  
  const [budget, setBudget] = useState<string>('mid-range')
  const [pace, setPace] = useState<string>('moderate')
  const [interests, setInterests] = useState<string[]>([])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSkip = () => {
    router.push('/plan')
  }

  const handleComplete = async () => {
    setSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Save preferences to database
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            budget_preference: budget,
            travel_style: [pace],
            interests: interests,
          })
      }
      
      // Store in localStorage as backup
      localStorage.setItem('tripflip_preferences', JSON.stringify({
        budget,
        pace,
        interests,
      }))
      
      router.push('/plan')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      router.push('/plan')
    }
  }

  const steps = [
    // Step 0: Welcome
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Welcome to TripFlip</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
        AI-powered travel planning that creates your perfect trip in seconds.
      </p>
      <p className="text-gray-500 mb-12">
        Let's learn a bit about your travel style to personalize your experience.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" onClick={() => setStep(1)} className="gap-2 px-8">
          Let's Go
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Button size="lg" variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
      </div>
    </motion.div>,

    // Step 1: Budget
    <motion.div
      key="budget"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Step 1 of 3</p>
          <h2 className="text-2xl font-bold">What's your budget style?</h2>
        </div>
      </div>
      
      <div className="space-y-3 mb-8">
        {budgetOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setBudget(option.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              budget === option.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="flex-1">
              <p className="font-semibold">{option.label}</p>
              <p className="text-sm text-gray-500">{option.desc}</p>
            </div>
            {budget === option.id && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={() => setStep(2)} className="flex-1 gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Pace
    <motion.div
      key="pace"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Gauge className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Step 2 of 3</p>
          <h2 className="text-2xl font-bold">How do you like to travel?</h2>
        </div>
      </div>
      
      <div className="space-y-3 mb-8">
        {paceOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setPace(option.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
              pace === option.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="flex-1">
              <p className="font-semibold">{option.label}</p>
              <p className="text-sm text-gray-500">{option.desc}</p>
            </div>
            {pace === option.id && (
              <Check className="w-5 h-5 text-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1 gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 3: Interests
    <motion.div
      key="interests"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Step 3 of 3</p>
          <h2 className="text-2xl font-bold">What do you love?</h2>
        </div>
      </div>
      
      <p className="text-gray-500 mb-6">Select all that interest you</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {interestOptions.map(option => (
          <button
            key={option.id}
            onClick={() => toggleInterest(option.id)}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              interests.includes(option.id)
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl block mb-1">{option.icon}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button 
          onClick={handleComplete} 
          disabled={saving}
          className="flex-1 gap-2"
        >
          {saving ? 'Saving...' : 'Start Planning'}
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
        
        {/* Progress dots */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
