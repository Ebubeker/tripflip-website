'use client'

import { format, parseISO } from 'date-fns'
import { MapPin, Clock, Utensils, Camera, Landmark, ShoppingBag, Mountain, Music, Plane, Bed } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface ItineraryItem {
  id: string
  title: string
  description?: string | null
  time_slot: string
  start_time?: string | null
  category: string
  location_name?: string | null
  estimated_cost?: number | null
  currency?: string
}

interface DayData {
  date: string
  items: ItineraryItem[]
}

interface DayCardsProps {
  days: DayData[]
  currency?: string
  className?: string
}

const categoryIcons: Record<string, typeof MapPin> = {
  sightseeing: Camera,
  food: Utensils,
  culture: Landmark,
  shopping: ShoppingBag,
  nature: Mountain,
  nightlife: Music,
  transport: Plane,
  accommodation: Bed,
  default: MapPin,
}

const categoryColors: Record<string, string> = {
  sightseeing: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  food: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
  culture: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
  shopping: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30',
  nature: 'text-green-500 bg-green-50 dark:bg-green-950/30',
  nightlife: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
  transport: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
  accommodation: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
  default: 'text-gray-500 bg-gray-50 dark:bg-gray-950/30',
}

export function DayCards({ days, currency = 'USD', className }: DayCardsProps) {
  if (days.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground">No itinerary items yet</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {days.map((day, index) => {
            const date = parseISO(day.date)
            const dayNumber = index + 1

            return (
              <Card
                key={day.date}
                className="w-[300px] shrink-0 border-2 border-transparent hover:border-primary/20 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Day {dayNumber}
                      </p>
                      <p className="text-lg font-semibold">
                        {format(date, 'EEEE')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{format(date, 'd')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(date, 'MMM')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Free day - no activities planned
                    </p>
                  ) : (
                    day.items.map((item) => {
                      const Icon = categoryIcons[item.category] || categoryIcons.default
                      const colorClass = categoryColors[item.category] || categoryColors.default

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                              colorClass
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate whitespace-normal line-clamp-2">
                              {item.title}
                            </p>
                            {item.start_time && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Clock className="w-3 h-3" />
                                <span>{item.start_time}</span>
                              </div>
                            )}
                            {item.location_name && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate whitespace-normal line-clamp-1">
                                  {item.location_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
