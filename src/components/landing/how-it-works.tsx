'use client'

import { motion } from 'framer-motion'
import { Crosshair, Robot, PencilSimple, AirplaneTilt, type Icon } from '@phosphor-icons/react'
import { HOW_IT_WORKS } from '@/lib/landing-data'

// Map iconName to Phosphor component
const STEP_ICONS: Record<string, Icon> = {
  Crosshair,
  Robot,
  PencilSimple,
  AirplaneTilt,
}

// Weights for each step (last one is fill for emphasis)
const STEP_WEIGHTS: ('bold' | 'fill')[] = ['bold', 'bold', 'bold', 'fill']

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-40 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From destination to departure in four simple steps
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Container with relative positioning for the connecting line */}
          <div className="relative">
            {/* Single continuous connecting line (background) */}
            <div className="hidden md:block absolute top-9 left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] h-[3px] bg-[#e0dcd5] z-0">
              <motion.div
                className="h-full bg-primary rounded-full origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((step, i) => {
                const IconComponent = STEP_ICONS[step.iconName] || Crosshair
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="text-center relative"
                  >
                    {/* Step number circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="relative z-10 mx-auto mb-5 w-[72px] h-[72px] rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25"
                    >
                      <IconComponent weight={STEP_WEIGHTS[i]} className="w-8 h-8" />
                      {/* Step number */}
                      <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-primary text-primary text-sm font-bold flex items-center justify-center">
                        {step.step}
                      </span>
                    </motion.div>

                    {/* Text content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed px-2">
                      {step.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
