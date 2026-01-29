'use client'

import { useState } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import {
  Clock,
  MapPin,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Utensils,
  Camera,
  ShoppingBag,
  Landmark,
  PartyPopper,
  Bus,
  Bed,
  Plane,
  Coffee,
  Mountain,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ItineraryItem } from '@/types/database'

interface DayViewProps {
  items: ItineraryItem[]
  selectedDate: Date
  onEditItem?: (item: ItineraryItem) => void
  onDeleteItem?: (item: ItineraryItem) => void
  onToggleComplete?: (item: ItineraryItem) => void
  currency?: string
}

const CATEGORY_ICONS: Record<string, typeof Utensils> = {
  food: Utensils,
  sightseeing: Camera,
  shopping: ShoppingBag,
  culture: Landmark,
  entertainment: PartyPopper,
  transport: Bus,
  accommodation: Bed,
  flight: Plane,
  coffee: Coffee,
  nature: Mountain,
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700 border-orange-200',
  sightseeing: 'bg-blue-100 text-blue-700 border-blue-200',
  shopping: 'bg-pink-100 text-pink-700 border-pink-200',
  culture: 'bg-purple-100 text-purple-700 border-purple-200',
  entertainment: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  transport: 'bg-green-100 text-green-700 border-green-200',
  accommodation: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  flight: 'bg-sky-100 text-sky-700 border-sky-200',
  coffee: 'bg-amber-100 text-amber-700 border-amber-200',
  nature: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning', time: '6:00 - 12:00' },
  { value: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00' },
  { value: 'evening', label: 'Evening', time: '18:00 - 22:00' },
  { value: 'night', label: 'Night', time: '22:00 - 6:00' },
]

export function DayView({
  items,
  selectedDate,
  onEditItem,
  onDeleteItem,
  onToggleComplete,
  currency = 'USD',
}: DayViewProps) {
  // Filter items for the selected date
  const dayItems = items.filter((item) =>
    isSameDay(parseISO(item.date), selectedDate)
  )

  // Group items by time slot
  const itemsBySlot = TIME_SLOTS.reduce((acc, slot) => {
    acc[slot.value] = dayItems
      .filter((item) => item.time_slot === slot.value || (!item.time_slot && slot.value === 'morning'))
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    return acc
  }, {} as Record<string, ItineraryItem[]>)

  // Calculate total estimated cost
  const totalCost = dayItems.reduce((sum, item) => sum + (item.estimated_cost || 0), 0)
  const completedCount = dayItems.filter((item) => item.status === 'completed').length

  if (dayItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No activities planned for {format(selectedDate, 'EEEE, MMMM d')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Add activities to start planning your day
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Day Summary */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{completedCount}/{dayItems.length} done</span>
              {totalCost > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {totalCost.toFixed(0)} {currency}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Time Slots */}
      {TIME_SLOTS.map((slot) => {
        const slotItems = itemsBySlot[slot.value]
        if (slotItems.length === 0) return null

        return (
          <div key={slot.value} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {slot.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{slot.time}</span>
            </div>

            <div className="space-y-2">
              {slotItems.map((item) => (
                <ItineraryItemCard
                  key={item.id}
                  item={item}
                  currency={currency}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ItineraryItemCardProps {
  item: ItineraryItem
  currency: string
  onEdit?: (item: ItineraryItem) => void
  onDelete?: (item: ItineraryItem) => void
  onToggleComplete?: (item: ItineraryItem) => void
}

function ItineraryItemCard({
  item,
  currency,
  onEdit,
  onDelete,
  onToggleComplete,
}: ItineraryItemCardProps) {
  const CategoryIcon = CATEGORY_ICONS[item.category] || Camera
  const categoryColor = CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700 border-gray-200'
  const isCompleted = item.status === 'completed'

  return (
    <Card className={cn(isCompleted && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <button
            onClick={() => onToggleComplete?.(item)}
            className="mt-0.5 flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>

          {/* Category Icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border',
              categoryColor
            )}
          >
            <CategoryIcon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={cn('font-medium', isCompleted && 'line-through')}>
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(item)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(item)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              {(item.start_time || item.end_time) && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.start_time}
                  {item.end_time && ` - ${item.end_time}`}
                </span>
              )}

              {item.location_name && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location_name}
                </span>
              )}

              {item.estimated_cost && item.estimated_cost > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {item.estimated_cost.toFixed(0)} {currency}
                </span>
              )}

              {item.booking_required && !item.is_booked && (
                <Badge variant="destructive" className="text-xs">
                  Booking required
                </Badge>
              )}

              {item.booking_required && item.is_booked && (
                <Badge variant="default" className="text-xs">
                  Booked
                </Badge>
              )}

              {item.priority === 'high' && (
                <Badge variant="secondary" className="text-xs">
                  High priority
                </Badge>
              )}
            </div>

            {/* Tips */}
            {item.tips && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Tip: {item.tips}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { TIME_SLOTS, CATEGORY_ICONS, CATEGORY_COLORS }
