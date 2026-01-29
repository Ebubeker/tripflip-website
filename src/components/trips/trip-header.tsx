'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Trip, TripDestination } from '@/types/database'

interface TripHeaderProps {
  trip: Trip & {
    trip_destinations: Pick<
      TripDestination,
      'id' | 'city' | 'country' | 'country_code' | 'arrival_date' | 'departure_date' | 'order_index'
    >[]
  }
}

const statusColors: Record<string, string> = {
  planning: 'bg-blue-500/10 text-blue-500',
  upcoming: 'bg-yellow-500/10 text-yellow-500',
  active: 'bg-green-500/10 text-green-500',
  completed: 'bg-gray-500/10 text-gray-500',
  cancelled: 'bg-red-500/10 text-red-500',
}

export function TripHeader({ trip }: TripHeaderProps) {
  const destinations = trip.trip_destinations?.sort(
    (a, b) => a.order_index - b.order_index
  )

  const formatDateRange = () => {
    if (!trip.start_date) return null
    const start = format(new Date(trip.start_date), 'MMM d')
    if (!trip.end_date) return start
    const end = format(new Date(trip.end_date), 'MMM d, yyyy')
    return `${start} - ${end}`
  }

  const dateRange = formatDateRange()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trips">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to trips</span>
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate sm:text-3xl">
              {trip.title}
            </h1>
            <Badge
              variant="secondary"
              className={statusColors[trip.status] || statusColors.planning}
            >
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </Badge>
          </div>
          {trip.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2">
              {trip.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/trips/${trip.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Trip
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share Trip
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {dateRange && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{dateRange}</span>
          </div>
        )}

        {destinations && destinations.length > 0 && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>
              {destinations.map((d) => d.city).join(' → ')}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          <span>
            {trip.travelers_count} {trip.travelers_count === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>

        {trip.total_budget && (
          <div className="flex items-center gap-1.5">
            <span className="font-medium">
              {trip.currency} {trip.spent_amount.toLocaleString()} /{' '}
              {trip.total_budget.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
