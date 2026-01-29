'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createUntypedClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface TripEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: {
    id: string
    title: string
    description?: string | null
    start_date: string
    end_date: string
    travelers_count: number
    total_budget?: number | null
    currency: string
  }
  onSave?: () => void
}

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD']

export function TripEditModal({ open, onOpenChange, trip, onSave }: TripEditModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState(trip.title)
  const [description, setDescription] = useState(trip.description || '')
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(trip.start_date))
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(trip.end_date))
  const [travelers, setTravelers] = useState(trip.travelers_count)
  const [budget, setBudget] = useState(trip.total_budget?.toString() || '')
  const [currency, setCurrency] = useState(trip.currency)

  // Reset form when trip changes
  useEffect(() => {
    setTitle(trip.title)
    setDescription(trip.description || '')
    setStartDate(new Date(trip.start_date))
    setEndDate(new Date(trip.end_date))
    setTravelers(trip.travelers_count)
    setBudget(trip.total_budget?.toString() || '')
    setCurrency(trip.currency)
  }, [trip])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a trip title')
      return
    }

    if (!startDate || !endDate) {
      toast.error('Please select trip dates')
      return
    }

    if (startDate > endDate) {
      toast.error('End date must be after start date')
      return
    }

    setIsLoading(true)
    const supabase = createUntypedClient()

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          travelers_count: travelers,
          total_budget: budget ? parseFloat(budget) : null,
          currency,
        })
        .eq('id', trip.id)

      if (error) throw error

      toast.success('Trip updated successfully')
      onOpenChange(false)
      onSave?.()
    } catch (error) {
      console.error('Error updating trip:', error)
      toast.error('Failed to update trip')
    } finally {
      setIsLoading(false)
    }
  }

  const FormContent = (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Trip Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Amazing Trip"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your trip..."
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => startDate ? date < startDate : false}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="travelers">Travelers</Label>
          <Select value={String(travelers)} onValueChange={(v) => setTravelers(Number(v))}>
            <SelectTrigger id="travelers">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} traveler{num !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
              className="flex-1"
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1"
        >
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
    </div>
  )

  // Use Dialog on desktop, Sheet on mobile
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Trip Details</DialogTitle>
            <DialogDescription>
              Update your trip information
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
          <SheetTitle>Edit Trip Details</SheetTitle>
          <SheetDescription>
            Update your trip information
          </SheetDescription>
        </SheetHeader>
        {FormContent}
      </SheetContent>
    </Sheet>
  )
}
