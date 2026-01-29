'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  accommodationSchema,
  type AccommodationFormData,
  ACCOMMODATION_TYPES,
  COMMON_AMENITIES,
} from '@/lib/validations/accommodation'

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

interface HotelEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accommodation: Accommodation
  tripId: string
  onSave: () => void
}

const BOOKING_STATUSES = [
  { value: 'suggested', label: 'Suggested' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function HotelEditModal({ open, onOpenChange, accommodation, tripId, onSave }: HotelEditModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<AccommodationFormData>({
    resolver: zodResolver(accommodationSchema),
    defaultValues: {
      name: accommodation.name,
      type: accommodation.type as AccommodationFormData['type'] || 'hotel',
      address: accommodation.address || '',
      city: accommodation.city,
      country: accommodation.country || '',
      latitude: accommodation.latitude || undefined,
      longitude: accommodation.longitude || undefined,
      check_in_date: accommodation.check_in_date || '',
      check_in_time: accommodation.check_in_time || '',
      check_out_date: accommodation.check_out_date || '',
      check_out_time: accommodation.check_out_time || '',
      nights_count: accommodation.nights_count || undefined,
      room_type: accommodation.room_type || '',
      room_count: accommodation.room_count || 1,
      guests_count: accommodation.guests_count || 1,
      price_per_night: accommodation.price_per_night || undefined,
      total_price: accommodation.total_price || undefined,
      currency: accommodation.currency || 'USD',
      rating: accommodation.rating || undefined,
      booking_reference: accommodation.booking_reference || '',
      booking_url: accommodation.booking_url || '',
      booking_status: accommodation.booking_status as AccommodationFormData['booking_status'] || 'pending',
      amenities: accommodation.amenities || [],
      breakfast_included: accommodation.breakfast_included || false,
      cancellation_policy: accommodation.cancellation_policy || '',
      notes: accommodation.notes || '',
    },
  })

  // Reset form when accommodation changes
  useEffect(() => {
    form.reset({
      name: accommodation.name,
      type: accommodation.type as AccommodationFormData['type'] || 'hotel',
      address: accommodation.address || '',
      city: accommodation.city,
      country: accommodation.country || '',
      latitude: accommodation.latitude || undefined,
      longitude: accommodation.longitude || undefined,
      check_in_date: accommodation.check_in_date || '',
      check_in_time: accommodation.check_in_time || '',
      check_out_date: accommodation.check_out_date || '',
      check_out_time: accommodation.check_out_time || '',
      nights_count: accommodation.nights_count || undefined,
      room_type: accommodation.room_type || '',
      room_count: accommodation.room_count || 1,
      guests_count: accommodation.guests_count || 1,
      price_per_night: accommodation.price_per_night || undefined,
      total_price: accommodation.total_price || undefined,
      currency: accommodation.currency || 'USD',
      rating: accommodation.rating || undefined,
      booking_reference: accommodation.booking_reference || '',
      booking_url: accommodation.booking_url || '',
      booking_status: accommodation.booking_status as AccommodationFormData['booking_status'] || 'pending',
      amenities: accommodation.amenities || [],
      breakfast_included: accommodation.breakfast_included || false,
      cancellation_policy: accommodation.cancellation_policy || '',
      notes: accommodation.notes || '',
    })
  }, [accommodation, form])

  const onSubmit = async (data: AccommodationFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/accommodations/${accommodation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          check_in_date: data.check_in_date || null,
          check_out_date: data.check_out_date || null,
          check_in_time: data.check_in_time || null,
          check_out_time: data.check_out_time || null,
          price_per_night: data.price_per_night || null,
          total_price: data.total_price || null,
          rating: data.rating || null,
          nights_count: data.nights_count || null,
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update accommodation')
      }

      toast.success('Accommodation updated')
      onOpenChange(false)
      onSave()
    } catch (error) {
      console.error('Error updating accommodation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update accommodation')
    } finally {
      setIsLoading(false)
    }
  }

  const watchedAmenities = form.watch('amenities') || []

  const toggleAmenity = (amenity: string) => {
    const current = watchedAmenities
    if (current.includes(amenity)) {
      form.setValue('amenities', current.filter((a) => a !== amenity))
    } else {
      form.setValue('amenities', [...current, amenity])
    }
  }

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Name and Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Hotel Name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={form.watch('type')}
            onValueChange={(v) => form.setValue('type', v as AccommodationFormData['type'])}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOMMODATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...form.register('city')}
            placeholder="Paris"
          />
          {form.formState.errors.city && (
            <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...form.register('country')}
            placeholder="France"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="123 Main Street"
        />
      </div>

      {/* Dates */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="check_in_date">Check-in Date</Label>
          <Input
            id="check_in_date"
            type="date"
            {...form.register('check_in_date')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="check_out_date">Check-out Date</Label>
          <Input
            id="check_out_date"
            type="date"
            {...form.register('check_out_date')}
          />
        </div>
      </div>

      {/* Room Info */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="room_type">Room Type</Label>
          <Input
            id="room_type"
            {...form.register('room_type')}
            placeholder="Double Room"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="room_count">Rooms</Label>
          <Input
            id="room_count"
            type="number"
            min={1}
            {...form.register('room_count', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guests_count">Guests</Label>
          <Input
            id="guests_count"
            type="number"
            min={1}
            {...form.register('guests_count', { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price_per_night">Price/Night</Label>
          <Input
            id="price_per_night"
            type="number"
            step="0.01"
            {...form.register('price_per_night', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            type="number"
            step="0.01"
            {...form.register('total_price', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={form.watch('currency')}
            onValueChange={(v) => form.setValue('currency', v)}
          >
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].map((curr) => (
                <SelectItem key={curr} value={curr}>{curr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status and Rating */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking_status">Status</Label>
          <Select
            value={form.watch('booking_status')}
            onValueChange={(v) => form.setValue('booking_status', v as AccommodationFormData['booking_status'])}
          >
            <SelectTrigger id="booking_status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min={0}
            max={5}
            {...form.register('rating', { valueAsNumber: true })}
            placeholder="4.5"
          />
        </div>
      </div>

      {/* Booking Reference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking_reference">Booking Reference</Label>
          <Input
            id="booking_reference"
            {...form.register('booking_reference')}
            placeholder="ABC123"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking_url">Booking URL</Label>
          <Input
            id="booking_url"
            {...form.register('booking_url')}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Breakfast included */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="breakfast_included">Breakfast Included</Label>
          <p className="text-sm text-muted-foreground">Daily breakfast service</p>
        </div>
        <Switch
          id="breakfast_included"
          checked={form.watch('breakfast_included')}
          onCheckedChange={(checked) => form.setValue('breakfast_included', checked)}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={watchedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label
                htmlFor={`amenity-${amenity}`}
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="space-y-2">
        <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
        <Textarea
          id="cancellation_policy"
          {...form.register('cancellation_policy')}
          placeholder="Free cancellation until..."
          rows={2}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Additional notes..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Accommodation</DialogTitle>
            <DialogDescription>
              Update accommodation details
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Accommodation</SheetTitle>
          <SheetDescription>
            Update accommodation details
          </SheetDescription>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  )
}
