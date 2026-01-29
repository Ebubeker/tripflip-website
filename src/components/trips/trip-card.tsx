'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  Calendar,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
  Copy,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

interface TripCardProps {
  trip: Trip & {
    trip_destinations: Pick<TripDestination, 'id' | 'city' | 'country' | 'order_index'>[]
  }
  onDelete?: (tripId: string) => void
}

const statusColors: Record<string, string> = {
  planning: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  upcoming: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  active: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  completed: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
  cancelled: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
}

const tripTypeLabels: Record<string, string> = {
  leisure: 'Leisure',
  business: 'Business',
  adventure: 'Adventure',
  cultural: 'Cultural',
  romantic: 'Romantic',
  family: 'Family',
  solo: 'Solo',
  group: 'Group',
}

export function TripCard({ trip, onDelete }: TripCardProps) {
  const destinations = trip.trip_destinations
    ?.sort((a, b) => a.order_index - b.order_index)
    .map((d) => d.city)
    .slice(0, 3)

  const hasMoreDestinations = (trip.trip_destinations?.length || 0) > 3

  const formatDateRange = () => {
    if (!trip.start_date) return 'Dates not set'
    const start = format(new Date(trip.start_date), 'MMM d')
    if (!trip.end_date) return start
    const end = format(new Date(trip.end_date), 'MMM d, yyyy')
    return `${start} - ${end}`
  }

  const budgetProgress = trip.total_budget
    ? Math.min((trip.spent_amount / trip.total_budget) * 100, 100)
    : 0

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      {trip.cover_image_url && (
        <div className="h-32 overflow-hidden">
          <img
            src={trip.cover_image_url}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/trips/${trip.id}`}
              className="hover:underline focus:underline"
            >
              <CardTitle className="text-lg truncate">{trip.title}</CardTitle>
            </Link>
            {trip.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {trip.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/trips/${trip.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/trips/${trip.id}?share=true`}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}`)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(trip.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="secondary"
            className={statusColors[trip.status] || statusColors.planning}
          >
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </Badge>
          {trip.trip_type && (
            <Badge variant="outline">
              {tripTypeLabels[trip.trip_type] || trip.trip_type}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange()}</span>
        </div>

        {destinations && destinations.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {destinations.join(' → ')}
              {hasMoreDestinations && ' ...'}
            </span>
          </div>
        )}

        {trip.total_budget && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">
                {trip.currency} {trip.spent_amount.toLocaleString()} /{' '}
                {trip.total_budget.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetProgress > 90
                    ? 'bg-red-500'
                    : budgetProgress > 75
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                }`}
                style={{ width: `${budgetProgress}%` }}
              />
            </div>
          </div>
        )}

        {trip.tags && trip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {trip.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {trip.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trip.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
