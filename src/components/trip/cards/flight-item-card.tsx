'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Plane, Pencil, Trash2, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/trip/modals/delete-confirmation-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Flight {
  id: string
  airline: string | null
  flight_number: string | null
  flight_type: string
  departure_city: string
  departure_airport: string
  departure_country: string | null
  arrival_city: string
  arrival_airport: string
  arrival_country: string | null
  departure_datetime: string | null
  arrival_datetime: string | null
  duration_minutes: number | null
  stops: number
  cabin_class: string
  price: number | null
  currency: string
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  seat_number: string | null
  meal_included: boolean
  notes: string | null
}

interface FlightItemCardProps {
  flight: Flight
  tripId: string
  onEdit: (flight: Flight) => void
  onDelete: () => void
}

export function FlightItemCard({ flight, tripId, onEdit, onDelete }: FlightItemCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const formatCurrency = (amount: number | null, currency: string) => {
    if (amount == null) return 'Price TBD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
      case 'suggested':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Suggested</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/flights/${flight.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete flight')
      }

      toast.success('Flight deleted')
      setIsDeleteModalOpen(false)
      onDelete()
    } catch (error) {
      console.error('Error deleting flight:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete flight')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Flight info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Route */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{flight.departure_city}</span>
                  <span className="text-xs text-muted-foreground">({flight.departure_airport})</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">{flight.arrival_city}</span>
                  <span className="text-xs text-muted-foreground">({flight.arrival_airport})</span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  {/* Date/Time */}
                  {flight.departure_datetime && (
                    <span>{format(parseISO(flight.departure_datetime), 'EEE, MMM d · h:mm a')}</span>
                  )}

                  {/* Duration */}
                  {flight.duration_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(flight.duration_minutes)}
                    </span>
                  )}

                  {/* Stops */}
                  {flight.stops > 0 && (
                    <span className="text-yellow-600">{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                  )}
                  {flight.stops === 0 && (
                    <span className="text-green-600">Direct</span>
                  )}

                  {/* Airline */}
                  {flight.airline && (
                    <span>{flight.airline}{flight.flight_number ? ` ${flight.flight_number}` : ''}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Price and actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {getStatusBadge(flight.booking_status)}
                <span className="font-semibold text-lg">
                  {formatCurrency(flight.price, flight.currency)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(flight)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit flight</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete flight</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        itemType="Flight"
        itemName={`${flight.departure_city} → ${flight.arrival_city}`}
      />
    </>
  )
}
