'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format, addDays, eachDayOfInterval, parseISO, startOfDay } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { DayView, AddActivityForm } from '@/components/itinerary'
import { createClient, createUntypedClient } from '@/lib/supabase/client'
import type { ItineraryItem } from '@/types/database'

export default function ItineraryPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const supabase = createClient()

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [trip, setTrip] = useState<{
    start_date: string | null
    end_date: string | null
    currency: string
  } | null>(null)

  // Fetch trip and itinerary items
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('start_date, end_date, currency')
          .eq('id', tripId)
          .single() as { data: { start_date: string | null; end_date: string | null; currency: string } | null; error: Error | null }

        if (tripError) throw tripError
        setTrip(tripData)

        // Set initial selected date to trip start date or today
        if (tripData?.start_date) {
          const startDate = parseISO(tripData.start_date)
          const today = new Date()
          // If today is within trip dates, select today, otherwise select start date
          if (tripData.end_date) {
            const endDate = parseISO(tripData.end_date)
            if (today >= startDate && today <= endDate) {
              setSelectedDate(today)
            } else {
              setSelectedDate(startDate)
            }
          } else {
            setSelectedDate(startDate)
          }
        }

        // Fetch itinerary items (exclude suggested)
        const { data: itemsData, error: itemsError } = await supabase
          .from('itinerary_items')
          .select('*')
          .eq('trip_id', tripId)
          .neq('status', 'suggested')
          .order('date', { ascending: true })
          .order('order_index', { ascending: true })

        if (itemsError) throw itemsError
        setItems(itemsData || [])
      } catch (error) {
        console.error('Error fetching itinerary:', error)
        toast.error('Failed to load itinerary')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tripId, supabase])

  // Calculate trip dates
  const tripStartDate = trip?.start_date ? parseISO(trip.start_date) : new Date()
  const tripEndDate = trip?.end_date ? parseISO(trip.end_date) : addDays(new Date(), 7)
  const currency = trip?.currency || 'USD'

  // Generate array of trip days
  const tripDays = eachDayOfInterval({ start: tripStartDate, end: tripEndDate })

  const handleAddActivity = async (data: {
    title: string
    description?: string
    date: Date
    time_slot: string
    start_time?: string
    end_time?: string
    category: string
    location_name?: string
    location_address?: string
    estimated_cost?: number
    booking_required: boolean
    booking_url?: string
    priority: 'low' | 'medium' | 'high'
    tips?: string
  }) => {
    setIsAdding(true)

    try {
      const newItem = {
        trip_id: tripId,
        date: format(data.date, 'yyyy-MM-dd'),
        time_slot: data.time_slot,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        title: data.title,
        description: data.description || null,
        category: data.category,
        location_name: data.location_name || null,
        location_address: data.location_address || null,
        estimated_cost: data.estimated_cost || null,
        currency,
        booking_required: data.booking_required,
        booking_url: data.booking_url || null,
        priority: data.priority,
        status: 'planned',
        tips: data.tips || null,
        order_index: items.length,
      }

      const untypedSupabase = createUntypedClient()
      const { data: insertedItem, error } = await untypedSupabase
        .from('itinerary_items')
        .insert(newItem)
        .select()
        .single()

      if (error) throw error

      setItems([...items, insertedItem as ItineraryItem])
      setIsAddDialogOpen(false)
      toast.success('Activity added!')
    } catch (error) {
      console.error('Add activity error:', error)
      toast.error('Failed to add activity')
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditItem = (item: ItineraryItem) => {
    // TODO: Implement edit dialog
    toast.info('Edit functionality coming soon')
  }

  const handleDeleteItem = async (item: ItineraryItem) => {
    try {
      const { error } = await supabase
        .from('itinerary_items')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      setItems(items.filter((i) => i.id !== item.id))
      toast.success('Activity removed')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete activity')
    }
  }

  const handleToggleComplete = async (item: ItineraryItem) => {
    const newStatus = item.status === 'completed' ? 'planned' : 'completed'

    try {
      const untypedSupabase = createUntypedClient()
      const { error } = await untypedSupabase
        .from('itinerary_items')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error

      setItems(
        items.map((i) =>
          i.id === item.id ? { ...i, status: newStatus } : i
        )
      )
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Failed to update status')
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = tripDays.findIndex(
      (day) => startOfDay(day).getTime() === startOfDay(selectedDate).getTime()
    )

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDate(tripDays[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < tripDays.length - 1) {
      setSelectedDate(tripDays[currentIndex + 1])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Itinerary</h2>
          <p className="text-sm text-muted-foreground">
            Plan your day-by-day activities
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Activity</DialogTitle>
              <DialogDescription>
                Add a new activity to your itinerary
              </DialogDescription>
            </DialogHeader>
            <AddActivityForm
              onSubmit={handleAddActivity}
              isLoading={isAdding}
              defaultDate={selectedDate}
              currency={currency}
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('prev')}
              disabled={startOfDay(selectedDate).getTime() === startOfDay(tripStartDate).getTime()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="w-full">
                <div className="flex gap-2 px-4 py-2">
                  {tripDays.map((day) => {
                    const isSelected = startOfDay(day).getTime() === startOfDay(selectedDate).getTime()
                    const dayItems = items.filter(
                      (item) => item.date === format(day, 'yyyy-MM-dd')
                    )
                    const hasItems = dayItems.length > 0

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          'flex flex-col items-center rounded-lg px-4 py-2 transition-colors min-w-[70px]',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted',
                          hasItems && !isSelected && 'bg-primary/10'
                        )}
                      >
                        <span className="text-xs uppercase">
                          {format(day, 'EEE')}
                        </span>
                        <span className="text-lg font-semibold">
                          {format(day, 'd')}
                        </span>
                        <span className="text-xs">
                          {format(day, 'MMM')}
                        </span>
                        {hasItems && (
                          <span className={cn(
                            'mt-1 h-1.5 w-1.5 rounded-full',
                            isSelected ? 'bg-primary-foreground' : 'bg-primary'
                          )} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('next')}
              disabled={startOfDay(selectedDate).getTime() === startOfDay(tripEndDate).getTime()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Day View */}
      <DayView
        items={items}
        selectedDate={selectedDate}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        onToggleComplete={handleToggleComplete}
        currency={currency}
      />
    </div>
  )
}
