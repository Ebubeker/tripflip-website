'use client'

import { useState } from 'react'
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

interface FlightAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tripId: string
  onSave: () => void
}

export function FlightAddModal({ open, onOpenChange, tripId, onSave }: FlightAddModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FlightFormData>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      airline: '',
      flight_number: '',
      flight_type: 'one_way',
      departure_airport: '',
      departure_city: '',
      departure_country: '',
      arrival_airport: '',
      arrival_city: '',
      arrival_country: '',
      departure_datetime: '',
      arrival_datetime: '',
      duration_minutes: undefined,
      stops: 0,
      cabin_class: 'economy',
      price: undefined,
      currency: 'USD',
      booking_reference: '',
      booking_url: '',
      booking_status: 'pending',
      seat_number: '',
      meal_included: false,
      notes: '',
    },
  })

  const onSubmit = async (data: FlightFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}/flights`, {
        method: 'POST',
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
        throw new Error(result.error || 'Failed to add flight')
      }

      toast.success('Flight added')
      form.reset()
      onOpenChange(false)
      onSave()
    } catch (error) {
      console.error('Error adding flight:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add flight')
    } finally {
      setIsLoading(false)
    }
  }

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
      {/* Route Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="departure_city">Departure City *</Label>
          <Input
            id="departure_city"
            {...form.register('departure_city')}
            placeholder="New York"
          />
          {form.formState.errors.departure_city && (
            <p className="text-sm text-destructive">{form.formState.errors.departure_city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="departure_airport">Airport Code *</Label>
          <Input
            id="departure_airport"
            {...form.register('departure_airport')}
            placeholder="JFK"
            maxLength={5}
          />
          {form.formState.errors.departure_airport && (
            <p className="text-sm text-destructive">{form.formState.errors.departure_airport.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="arrival_city">Arrival City *</Label>
          <Input
            id="arrival_city"
            {...form.register('arrival_city')}
            placeholder="London"
          />
          {form.formState.errors.arrival_city && (
            <p className="text-sm text-destructive">{form.formState.errors.arrival_city.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="arrival_airport">Airport Code *</Label>
          <Input
            id="arrival_airport"
            {...form.register('arrival_airport')}
            placeholder="LHR"
            maxLength={5}
          />
          {form.formState.errors.arrival_airport && (
            <p className="text-sm text-destructive">{form.formState.errors.arrival_airport.message}</p>
          )}
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
              Adding...
            </>
          ) : (
            'Add Flight'
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
            <DialogTitle>Add Flight</DialogTitle>
            <DialogDescription>
              Add a new flight to your trip
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
          <SheetTitle>Add Flight</SheetTitle>
          <SheetDescription>
            Add a new flight to your trip
          </SheetDescription>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  )
}
