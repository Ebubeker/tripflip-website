'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { FloatingPlanes } from './floating-planes'
import { WaitlistModal } from './waitlist-modal'
import { AirplaneTakeoff, MapPinLine, Calendar } from '@phosphor-icons/react'

export function HeroSection() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
      <FloatingPlanes />

      {/* Animated background gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-10 left-1/4 h-[600px] w-[600px] rounded-full bg-sky-400/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-sky-300/15 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 h-[300px] w-[300px] rounded-full bg-orange-200/20 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container mx-auto px-4 text-center z-10">
        {/* Launch badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now in Early Access — Free to use
          </span>
        </motion.div>

        {/* Main headline with highlighted text */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-8xl font-bold text-gray-900 mb-8 tracking-tight leading-[1.1]"
        >
          Plan Your{' '}
          <span className="relative inline-block">
            <span className="relative z-10">Dream Trip</span>
            <motion.span
              className="absolute -inset-1 -inset-x-3 bg-primary/20 rounded-lg -z-0 -rotate-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            />
          </span>
          <br className="hidden sm:block" />
          <span className="relative inline-block mt-2">
            <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
              In Seconds
            </span>
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-1.5 bg-primary/40 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered travel planning that finds the{' '}
          <span className="font-semibold text-gray-800">best flights</span>,{' '}
          <span className="font-semibold text-gray-800">hotels</span>, and{' '}
          <span className="font-semibold text-gray-800">experiences</span> tailored just for you.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm text-gray-700 shadow-sm">
            <AirplaneTakeoff weight="duotone" className="w-4 h-4 text-primary" />
            Flight Search
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm text-gray-700 shadow-sm">
            <MapPinLine weight="duotone" className="w-4 h-4 text-primary" />
            Hotel Booking
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 text-sm text-gray-700 shadow-sm">
            <Calendar weight="duotone" className="w-4 h-4 text-primary" />
            Smart Itinerary
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={() => setIsWaitlistOpen(true)}
            size="lg"
            className="text-lg px-10 py-7 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            Join Waitlist
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            onClick={() => {
              const element = document.getElementById('how-it-works')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            variant="ghost"
            size="lg"
            className="text-lg px-8 py-7 rounded-xl bg-white/80 hover:bg-white text-sky-600 border-2 border-sky-200 hover:border-sky-400 transition-all"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Trust indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-sm text-gray-500"
        >
          Be the first to know when we launch • Exclusive early access
        </motion.p>
      </div>

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </section>
  )
}
