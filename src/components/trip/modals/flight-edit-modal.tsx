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
import { toast } from 'sonner'
import { flightSchema, type FlightFormData, CABIN_CLASSES, BOOKING_STATUSES } from '@/lib/validations/flight'

interface Flight {
  id: string
  airline: string | null
  flight_number: string | null
  flight_type: string
  departure_airport: string
  departure_city: string
  departure_country: string | null
  arrival_airport: string
  arrival_city: string
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

interface FlightEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  flight: Flight
  tripId: string
  onSave: () => void
}

export function FlightEditModal({ open, onOpenChange, flight, tripId, onSave }: FlightEditModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      airline: flight.airline || '',
      flight_number: flight.flight_number || '',
      flight_type: flight.flight_type as 'one_way' | 'outbound' | 'return' | 'internal' || 'one_way',
      departure_airport: flight.departure_airport,
      departure_city: flight.departure_city,
      departure_country: flight.departure_country || '',
      arrival_airport: flight.arrival_airport,
      arrival_city: flight.arrival_city,
      arrival_country: flight.arrival_country || '',
      departure_datetime: flight.departure_datetime?.slice(0, 16) || '',
      arrival_datetime: flight.arrival_datetime?.slice(0, 16) || '',
      duration_minutes: flight.duration_minutes || undefined,
      stops: flight.stops || 0,
      cabin_class: flight.cabin_class as 'economy' | 'premium_economy' | 'business' | 'first' || 'economy',
      price: flight.price || undefined,
      currency: flight.currency || 'USD',
      booking_reference: flight.booking_reference || '',
      booking_url: flight.booking_url || '',
      booking_status: flight.booking_status as 'suggested' | 'pending' | 'confirmed' | 'cancelled' || 'pending',
      seat_number: flight.seat_number || '',
      meal_included: flight.meal_included || false,
      notes: flight.notes || '',
    },
  })

  // Reset form when flight changes
  useEffect(() => {
    form.reset({
      airline: flight.airline || '',
      flight_number: flight.flight_number || '',
      flight_type: flight.flight_type as 'one_way' | 'outbound' | 'return' | 'internal' || 'one_way',
      departure_airport: flight.departure_airport,
      departure_city: flight.departure_city,
      departure_country: flight.departure_country || '',
      arrival_airport: flight.arrival_airport,
      arrival_city: flight.arrival_city,
      arrival_country: flight.arrival_country || '',
      departure_datetime: flight.departure_datetime?.slice(0, 16) || '',
      arrival_datetime: flight.arrival_datetime?.slice(0, 16) || '',
      duration_minutes: flight.duration_minutes || undefined,
      stops: flight.stops || 0,
      cabin_class: flight.cabin_class as 'economy' | 'premium_economy' | 'business' | 'first' || 'economy',
      price: flight.price || undefined,
      currency: flight.currency || 'USD',
      booking_reference: flight.booking_reference || '',
      booking_url: flight.booking_url || '',
      booking_status: flight.booking_status as 'suggested' | 'pending' | 'confirmed' | 'cancelled' || 'pending',
      seat_number: flight.seat_number || '',
      meal_included: flight.meal_included || false,
      notes: flight.notes || '',
    })
  }, [flight, form])

  const onSubmit = async (data: FlightFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/flights/${flight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          departure_datetime: data.departure_datetime || null,
          arrival_datetime: data.arrival_datetime || null,
          price: data.price || null,
          duration_minutes: data.duration_minutes || null,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update flight')
      }

      toast.success('Flight updated')
      onOpenChange(false)
      onSave()
    } catch (error) {
      console.error('Error updating flight:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update flight')
    } finally {
      setIsLoading(false)
    }
  }

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Route Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departure_city">Departure City</Label>
          <Input
            id="departure_city"
            {...form.register('departure_city')}
            placeholder="New York"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="departure_airport">Airport Code</Label>
          <Input
            id="departure_airport"
            {...form.register('departure_airport')}
            placeholder="JFK"
            maxLength={5}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="arrival_city">Arrival City</Label>
          <Input
            id="arrival_city"
            {...form.register('arrival_city')}
            placeholder="London"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrival_airport">Airport Code</Label>
          <Input
            id="arrival_airport"
            {...form.register('arrival_airport')}
            placeholder="LHR"
            maxLength={5}
          />
        </div>
      </div>

      {/* Date/Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departure_datetime">Departure</Label>
          <Input
            id="departure_datetime"
            type="datetime-local"
            {...form.register('departure_datetime')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrival_datetime">Arrival</Label>
          <Input
            id="arrival_datetime"
            type="datetime-local"
            {...form.register('arrival_datetime')}
          />
        </div>
      </div>

      {/* Airline Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="airline">Airline</Label>
          <Input
            id="airline"
            {...form.register('airline')}
            placeholder="British Airways"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="flight_number">Flight Number</Label>
          <Input
            id="flight_number"
            {...form.register('flight_number')}
            placeholder="BA123"
          />
        </div>
      </div>

      {/* Price and Class */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...form.register('price', { valueAsNumber: true })}
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
        <div className="space-y-2">
          <Label htmlFor="cabin_class">Class</Label>
          <Select
            value={form.watch('cabin_class')}
            onValueChange={(v) => form.setValue('cabin_class', v as 'economy' | 'premium_economy' | 'business' | 'first')}
          >
            <SelectTrigger id="cabin_class">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CABIN_CLASSES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status and Stops */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="booking_status">Status</Label>
          <Select
            value={form.watch('booking_status')}
            onValueChange={(v) => form.setValue('booking_status', v as 'suggested' | 'pending' | 'confirmed' | 'cancelled')}
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
          <Label htmlFor="stops">Stops</Label>
          <Input
            id="stops"
            type="number"
            min={0}
            {...form.register('stops', { valueAsNumber: true })}
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
          <Label htmlFor="seat_number">Seat Number</Label>
          <Input
            id="seat_number"
            {...form.register('seat_number')}
            placeholder="12A"
          />
        </div>
      </div>

      {/* Meal included */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="meal_included">Meal Included</Label>
          <p className="text-sm text-muted-foreground">In-flight meal service</p>
        </div>
        <Switch
          id="meal_included"
          checked={form.watch('meal_included')}
          onCheckedChange={(checked) => form.setValue('meal_included', checked)}
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
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription>
              Update flight details
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
          <SheetTitle>Edit Flight</SheetTitle>
          <SheetDescription>
            Update flight details
          </SheetDescription>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  )
}
