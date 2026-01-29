'use client'

import { useState } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { Hotel, Pencil, Trash2, MapPin, Star, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationModal } from '@/components/trip/modals/delete-confirmation-modal'
import { toast } from 'sonner'

interface Accommodation {
  id: string
  name: string
  type: string
  address: string | null
  city: string
  country: string | null
  latitude: number | null
  longitude: number | null
  check_in_date: string | null
  check_in_time: string | null
  check_out_date: string | null
  check_out_time: string | null
  nights_count: number | null
  room_type: string | null
  room_count: number
  guests_count: number
  price_per_night: number | null
  total_price: number | null
  currency: string
  rating: number | null
  booking_reference: string | null
  booking_url: string | null
  booking_status: string
  amenities: string[] | null
  breakfast_included: boolean
  cancellation_policy: string | null
  notes: string | null
}

interface HotelItemCardProps {
  accommodation: Accommodation
  tripId: string
  onEdit: (accommodation: Accommodation) => void
  onDelete: () => void
}

export function HotelItemCard({ accommodation, tripId, onEdit, onDelete }: HotelItemCardProps) {
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

  const calculateNights = () => {
    if (accommodation.nights_count) return accommodation.nights_count
    if (accommodation.check_in_date && accommodation.check_out_date) {
      return differenceInDays(
        parseISO(accommodation.check_out_date),
        parseISO(accommodation.check_in_date)
      )
    }
    return null
  }

  const nights = calculateNights()

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

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      hotel: 'Hotel',
      hostel: 'Hostel',
      apartment: 'Apartment',
      resort: 'Resort',
      villa: 'Villa',
      guesthouse: 'Guesthouse',
      airbnb: 'Airbnb',
      other: 'Other',
    }
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/accommodations/${accommodation.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete accommodation')
      }

      toast.success('Accommodation deleted')
      setIsDeleteModalOpen(false)
      onDelete()
    } catch (error) {
      console.error('Error deleting accommodation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete accommodation')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="border hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Hotel info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                <Hotel className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Name and type */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{accommodation.name}</span>
                  {getTypeBadge(accommodation.type)}
                  {accommodation.rating && (
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star className="w-3 h-3 fill-current" />
                      {accommodation.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {accommodation.city}
                    {accommodation.country && `, ${accommodation.country}`}
                  </span>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                  {/* Dates */}
                  {accommodation.check_in_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(accommodation.check_in_date), 'MMM d')}
                      {accommodation.check_out_date && (
                        <> - {format(parseISO(accommodation.check_out_date), 'MMM d')}</>
                      )}
                    </span>
                  )}

                  {/* Nights */}
                  {nights && (
                    <span>{nights} night{nights > 1 ? 's' : ''}</span>
                  )}

                  {/* Room type */}
                  {accommodation.room_type && (
                    <span>{accommodation.room_type}</span>
                  )}

                  {/* Breakfast */}
                  {accommodation.breakfast_included && (
                    <span className="text-green-600">Breakfast included</span>
                  )}
                </div>

                {/* Amenities */}
                {accommodation.amenities && accommodation.amenities.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {accommodation.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {accommodation.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{accommodation.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Price and actions */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {getStatusBadge(accommodation.booking_status)}
                <div className="text-right">
                  <span className="font-semibold text-lg block">
                    {formatCurrency(accommodation.total_price, accommodation.currency)}
                  </span>
                  {accommodation.price_per_night && nights && nights > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(accommodation.price_per_night, accommodation.currency)}/night
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(accommodation)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit accommodation</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete accommodation</span>
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
        itemType="Accommodation"
        itemName={accommodation.name}
      />
    </>
  )
}
