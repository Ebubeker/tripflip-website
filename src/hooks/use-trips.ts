'use client'

import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { createClient } from '@/lib/supabase/client'
import { useTripsStore, type TripWithDestinations } from '@/stores/trips-store'
import type { Trip, TripDestination } from '@/types/database'

export function useTrips() {
  const {
    trips,
    isLoading,
    error,
    setTrips,
    addTrip,
    updateTrip,
    deleteTrip,
    setLoading,
    setError,
    clearError,
  } = useTripsStore()

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('trips')
        .select(`
          *,
          trip_destinations (*)
        `)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTrips(data as TripWithDestinations[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trips'
      setError(message)
      console.error('Error fetching trips:', err)
    } finally {
      setLoading(false)
    }
  }, [setTrips, setLoading, setError, clearError])

  const createTrip = useCallback(
    async (
      tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'spent_amount'>,
      destinations: Omit<TripDestination, 'id' | 'trip_id' | 'created_at'>[]
    ) => {
      setLoading(true)

      try {
        const supabase = createClient()

        // Create trip
        const { data: trip, error: tripError } = (await supabase
          .from('trips')
          .insert(tripData as never)
          .select()
          .single()) as { data: { id: string } | null; error: unknown }

        if (tripError || !trip) throw tripError

        // Create destinations
        if (destinations.length > 0) {
          const destinationsWithTripId = destinations.map((dest) => ({
            ...dest,
            trip_id: trip.id,
          }))

          const { error: destError } = await supabase
            .from('trip_destinations')
            .insert(destinationsWithTripId as never)

          if (destError) {
            console.error('Error creating destinations:', destError)
          }
        }

        // Fetch the complete trip with destinations
        const { data: completeTrip, error: fetchError } = await supabase
          .from('trips')
          .select(`
            *,
            trip_destinations (*)
          `)
          .eq('id', trip.id)
          .single()

        if (fetchError) throw fetchError

        addTrip(completeTrip as TripWithDestinations)
        toast.success('Trip created successfully!')

        return completeTrip
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create trip'
        setError(message)
        toast.error(message)
        console.error('Error creating trip:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [addTrip, setLoading, setError]
  )

  const editTrip = useCallback(
    async (tripId: string, updates: Partial<Trip>) => {
      try {
        const supabase = createClient()

        const { error: updateError } = await supabase
          .from('trips')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          } as never)
          .eq('id', tripId)

        if (updateError) throw updateError

        updateTrip(tripId, updates)
        toast.success('Trip updated successfully!')

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update trip'
        toast.error(message)
        console.error('Error updating trip:', err)
        return false
      }
    },
    [updateTrip]
  )

  const removeTrip = useCallback(
    async (tripId: string) => {
      try {
        const supabase = createClient()

        const { error: deleteError } = await supabase
          .from('trips')
          .delete()
          .eq('id', tripId)

        if (deleteError) throw deleteError

        deleteTrip(tripId)
        toast.success('Trip deleted successfully!')

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete trip'
        toast.error(message)
        console.error('Error deleting trip:', err)
        return false
      }
    },
    [deleteTrip]
  )

  return {
    trips,
    isLoading,
    error,
    fetchTrips,
    createTrip,
    editTrip,
    removeTrip,
  }
}

export function useTripById(tripId: string) {
  const { currentTrip, setCurrentTrip, setLoading, setError, clearError } =
    useTripsStore()

  const fetchTrip = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('trips')
        .select(`
          *,
          trip_destinations (*),
          flights (*),
          accommodations (*),
          itinerary_items (*),
          expenses (*)
        `)
        .eq('id', tripId)
        .single()

      if (fetchError) throw fetchError

      setCurrentTrip(data as TripWithDestinations)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trip'
      setError(message)
      console.error('Error fetching trip:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [tripId, setCurrentTrip, setLoading, setError, clearError])

  useEffect(() => {
    if (tripId) {
      fetchTrip()
    }

    return () => {
      setCurrentTrip(null)
    }
  }, [tripId, fetchTrip, setCurrentTrip])

  return {
    trip: currentTrip,
    fetchTrip,
  }
}
