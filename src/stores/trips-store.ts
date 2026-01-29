import { create } from 'zustand'
import type { Trip, TripDestination } from '@/types/database'

export type TripWithDestinations = Trip & {
  trip_destinations: TripDestination[]
}

interface TripsState {
  trips: TripWithDestinations[]
  currentTrip: TripWithDestinations | null
  isLoading: boolean
  error: string | null

  // Actions
  setTrips: (trips: TripWithDestinations[]) => void
  addTrip: (trip: TripWithDestinations) => void
  updateTrip: (tripId: string, updates: Partial<Trip>) => void
  deleteTrip: (tripId: string) => void
  setCurrentTrip: (trip: TripWithDestinations | null) => void

  // Destination actions
  addDestination: (tripId: string, destination: TripDestination) => void
  updateDestination: (tripId: string, destinationId: string, updates: Partial<TripDestination>) => void
  removeDestination: (tripId: string, destinationId: string) => void
  reorderDestinations: (tripId: string, destinations: TripDestination[]) => void

  // UI state
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  setTrips: (trips) => set({ trips }),

  addTrip: (trip) =>
    set((state) => ({
      trips: [trip, ...state.trips],
    })),

  updateTrip: (tripId, updates) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId ? { ...trip, ...updates } : trip
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? { ...state.currentTrip, ...updates }
          : state.currentTrip,
    })),

  deleteTrip: (tripId) =>
    set((state) => ({
      trips: state.trips.filter((trip) => trip.id !== tripId),
      currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
    })),

  setCurrentTrip: (trip) => set({ currentTrip: trip }),

  addDestination: (tripId, destination) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_destinations: [...trip.trip_destinations, destination],
            }
          : trip
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              trip_destinations: [
                ...state.currentTrip.trip_destinations,
                destination,
              ],
            }
          : state.currentTrip,
    })),

  updateDestination: (tripId, destinationId, updates) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_destinations: trip.trip_destinations.map((dest) =>
                dest.id === destinationId ? { ...dest, ...updates } : dest
              ),
            }
          : trip
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              trip_destinations: state.currentTrip.trip_destinations.map(
                (dest) =>
                  dest.id === destinationId ? { ...dest, ...updates } : dest
              ),
            }
          : state.currentTrip,
    })),

  removeDestination: (tripId, destinationId) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_destinations: trip.trip_destinations.filter(
                (dest) => dest.id !== destinationId
              ),
            }
          : trip
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              trip_destinations: state.currentTrip.trip_destinations.filter(
                (dest) => dest.id !== destinationId
              ),
            }
          : state.currentTrip,
    })),

  reorderDestinations: (tripId, destinations) =>
    set((state) => ({
      trips: state.trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_destinations: destinations,
            }
          : trip
      ),
      currentTrip:
        state.currentTrip?.id === tripId
          ? {
              ...state.currentTrip,
              trip_destinations: destinations,
            }
          : state.currentTrip,
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))

// Selectors
export const selectTrips = (state: TripsState) => state.trips
export const selectCurrentTrip = (state: TripsState) => state.currentTrip
export const selectIsLoading = (state: TripsState) => state.isLoading
export const selectError = (state: TripsState) => state.error

export const selectTripById = (tripId: string) => (state: TripsState) =>
  state.trips.find((trip) => trip.id === tripId)

export const selectUpcomingTrips = (state: TripsState) =>
  state.trips.filter(
    (trip) =>
      trip.status === 'upcoming' ||
      (trip.status === 'planning' &&
        trip.start_date &&
        new Date(trip.start_date) > new Date())
  )

export const selectActiveTrips = (state: TripsState) =>
  state.trips.filter((trip) => trip.status === 'active')

export const selectCompletedTrips = (state: TripsState) =>
  state.trips.filter((trip) => trip.status === 'completed')
