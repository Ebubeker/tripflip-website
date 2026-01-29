'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { TripCard } from './trip-card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Trip, TripDestination } from '@/types/database'

interface TripsListProps {
  trips: (Trip & {
    trip_destinations: Pick<TripDestination, 'id' | 'city' | 'country' | 'order_index'>[]
  })[]
}

export function TripsList({ trips }: TripsListProps) {
  const router = useRouter()
  const [tripToDelete, setTripToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!tripToDelete) return

    setIsDeleting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripToDelete)

      if (error) {
        toast.error('Failed to delete trip')
        console.error(error)
        return
      }

      toast.success('Trip deleted successfully')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
    } finally {
      setIsDeleting(false)
      setTripToDelete(null)
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onDelete={(id) => setTripToDelete(id)}
          />
        ))}
      </div>

      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trip? This action cannot be
              undone and will permanently delete all associated data including
              flights, accommodations, itinerary items, photos, and expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
