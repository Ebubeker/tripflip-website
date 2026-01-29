'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TripMap, MapDestination } from '@/components/maps/trip-map'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface TripMapSectionProps {
  destinations: MapDestination[]
  className?: string
  defaultExpanded?: boolean
}

export function TripMapSection({
  destinations,
  className,
  defaultExpanded = false,
}: TripMapSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (destinations.length === 0) {
    return null
  }

  return (
    <div className={cn('rounded-2xl border bg-card overflow-hidden', className)}>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">Trip Map</p>
            <p className="text-sm text-muted-foreground">
              {destinations.length} {destinations.length === 1 ? 'location' : 'locations'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">
              <TripMap
                destinations={destinations}
                className="h-[400px] rounded-xl"
                showRoutes
                interactive
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
