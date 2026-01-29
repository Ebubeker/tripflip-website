'use client'

import Link from 'next/link'
import { format, differenceInDays } from 'date-fns'
import {
  Calendar,
  MapPin,
  Plane,
  Hotel,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
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
import { Progress } from '@/components/ui/progress'
import type {
  Trip,
  TripDestination,
  Flight,
  Accommodation,
  ItineraryItem,
  Expense,
} from '@/types/database'

interface TripOverviewProps {
  trip: Trip & {
    trip_destinations: TripDestination[]
    flights: Pick<
      Flight,
      | 'id'
      | 'airline'
      | 'flight_number'
      | 'departure_city'
      | 'arrival_city'
      | 'departure_datetime'
      | 'arrival_datetime'
      | 'booking_status'
    >[]
    accommodations: Pick<
      Accommodation,
      | 'id'
      | 'name'
      | 'type'
      | 'city'
      | 'check_in_date'
      | 'check_out_date'
      | 'booking_status'
    >[]
    itinerary_items: Pick<ItineraryItem, 'id' | 'date' | 'title' | 'category' | 'status'>[]
    expenses: Pick<Expense, 'id' | 'category' | 'amount' | 'currency'>[]
  }
}

export function TripOverview({ trip }: TripOverviewProps) {
  const destinations = trip.trip_destinations?.sort(
    (a, b) => a.order_index - b.order_index
  )

  const tripDuration =
    trip.start_date && trip.end_date
      ? differenceInDays(new Date(trip.end_date), new Date(trip.start_date)) + 1
      : null

  const budgetProgress = trip.total_budget
    ? (trip.spent_amount / trip.total_budget) * 100
    : 0

  const confirmedFlights = trip.flights?.filter(
    (f) => f.booking_status === 'confirmed'
  ).length || 0

  const confirmedAccommodations = trip.accommodations?.filter(
    (a) => a.booking_status === 'confirmed'
  ).length || 0

  const completedActivities = trip.itinerary_items?.filter(
    (i) => i.status === 'completed'
  ).length || 0

  const totalExpenses = trip.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trip Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tripDuration ? `${tripDuration} days` : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">
              {trip.start_date
                ? format(new Date(trip.start_date), 'MMM d, yyyy')
                : 'Set dates to see duration'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{destinations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {destinations && destinations.length > 0
                ? destinations.map((d) => d.city).join(', ')
                : 'Add destinations'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flights Booked</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {confirmedFlights}/{trip.flights?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {confirmedFlights > 0 ? 'Confirmed' : 'No flights yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trip.total_budget
                ? `${Math.round(budgetProgress)}%`
                : `${trip.currency} ${totalExpenses.toLocaleString()}`}
            </div>
            {trip.total_budget && (
              <Progress value={budgetProgress} className="mt-2 h-2" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Destinations</CardTitle>
            <CardDescription>Your travel route</CardDescription>
          </CardHeader>
          <CardContent>
            {destinations && destinations.length > 0 ? (
              <div className="space-y-3">
                {destinations.map((destination, index) => (
                  <div key={destination.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {destination.city}, {destination.country}
                      </p>
                      {destination.arrival_date && destination.departure_date && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(destination.arrival_date), 'MMM d')} -{' '}
                          {format(new Date(destination.departure_date), 'MMM d')}
                        </p>
                      )}
                    </div>
                    {index < destinations.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No destinations added yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href={`/trips/${trip.id}/edit`}>Add destinations</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Itinerary</CardTitle>
              <CardDescription>Your planned activities</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trips/${trip.id}/itinerary`}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {trip.itinerary_items && trip.itinerary_items.length > 0 ? (
              <div className="space-y-3">
                {trip.itinerary_items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    {item.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(item.date), 'MMM d')} • {item.category}
                      </p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No activities planned yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href={`/trips/${trip.id}/itinerary`}>Add activities</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>Flights and accommodations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <span>Flights</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {confirmedFlights} confirmed
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trips/${trip.id}/flights`}>Manage</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-muted-foreground" />
                <span>Accommodations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {confirmedAccommodations} confirmed
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trips/${trip.id}/accommodations`}>Manage</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Budget</CardTitle>
              <CardDescription>Spending overview</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trips/${trip.id}/budget`}>View Details</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {trip.total_budget ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className="font-medium">
                    {trip.currency} {trip.spent_amount.toLocaleString()}
                  </span>
                </div>
                <Progress value={budgetProgress} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{Math.round(budgetProgress)}% used</span>
                  <span>
                    {trip.currency}{' '}
                    {(trip.total_budget - trip.spent_amount).toLocaleString()} remaining
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No budget set</p>
                <p className="text-sm">
                  Total tracked: {trip.currency} {totalExpenses.toLocaleString()}
                </p>
                <Button variant="link" asChild className="mt-2">
                  <Link href={`/trips/${trip.id}/edit`}>Set a budget</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {trip.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{trip.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {trip.tags && trip.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trip.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
