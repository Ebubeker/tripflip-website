'use client'

import { motion } from 'framer-motion'
import { AirplaneTilt } from '@phosphor-icons/react'

// Different weights for visual variety
const weights = ['thin', 'light', 'regular', 'bold', 'duotone', 'fill'] as const

const planes = [
  // Top left area
  { x: '8%', y: '12%', delay: 0, rotate: 45, size: 'w-10 h-10 md:w-16 md:h-16', weight: 4, opacity: 0.35 },
  // Top right
  { x: '88%', y: '8%', delay: 0.5, rotate: -35, size: 'w-8 h-8 md:w-14 md:h-14', weight: 5, opacity: 0.4 },
  // Left middle
  { x: '5%', y: '50%', delay: 1, rotate: 55, size: 'w-12 h-12 md:w-20 md:h-20', weight: 4, opacity: 0.25 },
  // Right middle
  { x: '92%', y: '45%', delay: 1.5, rotate: -50, size: 'w-9 h-9 md:w-14 md:h-14', weight: 5, opacity: 0.35 },
  // Center top
  { x: '50%', y: '5%', delay: 2, rotate: 20, size: 'w-6 h-6 md:w-10 md:h-10', weight: 3, opacity: 0.3 },
  // Bottom right
  { x: '75%', y: '80%', delay: 0.8, rotate: 35, size: 'w-8 h-8 md:w-12 md:h-12', weight: 4, opacity: 0.3 },
  // Bottom left
  { x: '20%', y: '85%', delay: 1.2, rotate: -25, size: 'w-10 h-10 md:w-16 md:h-16', weight: 5, opacity: 0.25 },
  // Bottom center
  { x: '60%', y: '90%', delay: 1.8, rotate: 60, size: 'w-6 h-6 md:w-9 md:h-9', weight: 3, opacity: 0.35 },
  // Extra planes for more life
  { x: '30%', y: '30%', delay: 0.3, rotate: 40, size: 'w-5 h-5 md:w-8 md:h-8', weight: 2, opacity: 0.2 },
  { x: '70%', y: '25%', delay: 1.1, rotate: -15, size: 'w-7 h-7 md:w-11 md:h-11', weight: 4, opacity: 0.25 },
]

export function FloatingPlanes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {planes.map((plane, i) => (
        <motion.div
          key={i}
          className="absolute text-primary"
          style={{ left: plane.x, top: plane.y, opacity: plane.opacity }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [plane.opacity * 0.7, plane.opacity, plane.opacity * 0.7],
            scale: 1,
            y: [0, -30 - i * 3, 0],
            x: [0, 15 + i * 2, 0],
            rotate: [plane.rotate, plane.rotate + 5, plane.rotate],
          }}
          transition={{
            delay: plane.delay,
            duration: 5 + i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <AirplaneTilt
            weight={weights[plane.weight]}
            className={plane.size}
          />
        </motion.div>
      ))}
    </div>
  )
}
