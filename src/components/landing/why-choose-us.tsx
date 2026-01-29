'use client'

import { motion } from 'framer-motion'
import { Crosshair, Robot, Coins, ShieldCheck, type Icon } from '@phosphor-icons/react'
import { WHY_CHOOSE_US } from '@/lib/landing-data'

// Map iconName to Phosphor component
const FEATURE_ICONS: Record<string, Icon> = {
  Crosshair,
  Robot,
  Coins,
  ShieldCheck,
}

export function WhyChooseUsSection() {
  return (
    <section className="py-40 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose TripFlip?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to plan the perfect trip, all in one place
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {WHY_CHOOSE_US.map((feature, i) => {
            const IconComponent = FEATURE_ICONS[feature.iconName] || Crosshair
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-[#f5f1eb] to-white border border-[#e8e4dd] text-center hover:shadow-lg transition-all"
              >
                <div className="mb-4 transform hover:scale-110 transition-transform flex justify-center">
                  <IconComponent weight="duotone" className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
