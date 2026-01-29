'use client'

import { format, parseISO } from 'date-fns'
import { Plane, Hotel, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Flight {
  departure_city: string
  arrival_city: string
  departure_datetime: string | null
  price: number | null
  currency: string
}

interface Accommodation {
  name: string
  nights_count: number | null
  total_price: number | null
  currency: string
}

interface TripSummaryCardsProps {
  flight?: Flight | null
  accommodation?: Accommodation | null
  estimatedBudget?: number
  currency?: string
  className?: string
}

export function TripSummaryCards({
  flight,
  accommodation,
  estimatedBudget,
  currency = 'USD',
  className,
}: TripSummaryCardsProps) {
  const formatCurrency = (amount: number | null | undefined, curr: string | null | undefined) => {
    if (amount == null) return 'Price TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr || currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {/* Flight Card */}
      <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Flight</p>
              {flight ? (
                <>
                  <p className="font-semibold truncate">
                    {flight.departure_city} → {flight.arrival_city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.departure_datetime ? format(parseISO(flight.departure_datetime), 'MMM d') : 'Date TBD'} • {formatCurrency(flight.price, flight.currency)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No flight booked</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Card */}
      <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
              <Hotel className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Accommodation</p>
              {accommodation ? (
                <>
                  <p className="font-semibold truncate">{accommodation.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {accommodation.nights_count} nights • {formatCurrency(accommodation.total_price, accommodation.currency)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No hotel booked</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Card */}
      <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 shrink-0">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Estimated Budget</p>
              <p className="font-semibold">
                {estimatedBudget ? formatCurrency(estimatedBudget, currency) : 'Not set'}
              </p>
              <p className="text-sm text-muted-foreground">
                Total trip cost
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
