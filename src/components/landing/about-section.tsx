'use client'

import { motion } from 'framer-motion'
import {
  Heart,
  Lightning,
  Eye,
  Sparkle,
  AirplaneTakeoff,
  Buildings,
  MapTrifold,
  CheckCircle,
  Clock,
} from '@phosphor-icons/react'

const VALUES = [
  {
    icon: Heart,
    title: 'Built by Travelers',
    description: 'We know the pain of endless planning because we\'ve been there too.',
  },
  {
    icon: Lightning,
    title: 'Speed Matters',
    description: 'Your time is precious. Get a complete trip plan in seconds, not hours.',
  },
  {
    icon: Eye,
    title: 'Transparent & Honest',
    description: 'No hidden fees, no fake reviews. Just straightforward trip planning.',
  },
  {
    icon: Sparkle,
    title: 'Always Improving',
    description: 'We\'re in early access, actively building based on your feedback.',
  },
]

const STEPS = [
  { icon: AirplaneTakeoff, label: 'Find flights', desc: 'Best prices, real-time data' },
  { icon: Buildings, label: 'Book hotels', desc: 'Curated recommendations' },
  { icon: MapTrifold, label: 'Plan activities', desc: 'Day-by-day itinerary' },
]

export function AboutSection() {
  return (
    <section id="about" className="py-40 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Why we built TripFlip and what drives us forward
            </p>
          </motion.div>

          {/* Story cards layout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left side - Story */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                <div className="relative pl-8 border-l-2 border-primary/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Problem</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Planning a week-long trip shouldn't take weeks of research. Yet there we were — juggling dozens of tabs, comparing prices, reading reviews, and still feeling unsure.
                  </p>
                </div>

                <div className="relative pl-8 border-l-2 border-primary/30">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary/60" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Solution</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We built a tool that does the research for you. It finds the best options within your budget and creates a complete itinerary — all in seconds, not hours.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary/30" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Travel planning should be exciting, not exhausting. We're here to give you back your time so you can focus on what matters — the journey itself.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right side - Visual element */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl transform rotate-3" />

                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-[#e8e4dd]">
                  <div className="text-center mb-6">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      How it works
                    </span>
                  </div>

                  <div className="space-y-4">
                    {STEPS.map((step, i) => {
                      const IconComponent = step.icon
                      return (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-[#f5f1eb]/50 border border-[#e8e4dd]"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <IconComponent weight="duotone" className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900">{step.label}</div>
                            <div className="text-sm text-gray-500">{step.desc}</div>
                          </div>
                          <CheckCircle weight="fill" className="w-6 h-6 text-green-500 shrink-0" />
                        </motion.div>
                      )
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Clock weight="bold" className="w-6 h-6" />
                      <div>
                        <span className="text-2xl font-bold">30 seconds</span>
                        <span className="text-white/80 ml-2">average planning time</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Values grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">What We Believe</h3>
            <p className="text-gray-600">The principles that guide everything we build</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => {
              const IconComponent = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-gradient-to-br from-[#f5f1eb] to-white border border-[#e8e4dd] hover:border-primary/30 hover:shadow-lg transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent weight="duotone" className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
