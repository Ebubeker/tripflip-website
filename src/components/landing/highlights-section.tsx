'use client'

import { motion } from 'framer-motion'
import { MapPin, Sun, Bank, Buildings, Umbrella, Church, type Icon } from '@phosphor-icons/react'
import { EXAMPLE_TRIPS } from '@/lib/landing-data'

// Map iconName to Phosphor component
const DESTINATION_ICONS: Record<string, Icon> = {
  MapPin,
  Sun,
  Bank,
  Buildings,
  Umbrella,
  Church,
}

export function HighlightsSection() {
  return (
    <section className="py-40 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what other travelers are planning with TripFlip
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {EXAMPLE_TRIPS.map((trip, i) => {
            const IconComponent = DESTINATION_ICONS[trip.iconName] || MapPin
            return (
              <motion.div
                key={trip.destination}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl border-2 border-[#e8e4dd] hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  <IconComponent weight="duotone" className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {trip.destination}
                </h3>
                <p className="text-primary font-medium mb-4">{trip.duration}</p>
                <ul className="space-y-2">
                  {trip.highlights.map((highlight) => (
                    <li key={highlight} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
