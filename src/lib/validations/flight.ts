import { z } from 'zod'

export const flightSchema = z.object({
  // Basic flight info
  airline: z.string().max(100).optional().nullable(),
  flight_number: z.string().max(20).optional().nullable(),
  flight_type: z.enum(['one_way', 'outbound', 'return', 'internal']).optional(),

  // Departure info
  departure_airport: z.string().min(1, 'Departure airport is required').max(10),
  departure_city: z.string().min(1, 'Departure city is required').max(100),
  departure_country: z.string().max(100).optional().nullable(),
  departure_datetime: z.string().optional().nullable(),

  // Arrival info
  arrival_airport: z.string().min(1, 'Arrival airport is required').max(10),
  arrival_city: z.string().min(1, 'Arrival city is required').max(100),
  arrival_country: z.string().max(100).optional().nullable(),
  arrival_datetime: z.string().optional().nullable(),

  // Flight details
  duration_minutes: z.number().min(0).optional().nullable(),
  stops: z.number().min(0).optional(),
  cabin_class: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),

  // Pricing
  price: z.number().min(0).optional().nullable(),
  currency: z.string().min(3).max(3).optional(),

  // Booking info
  booking_reference: z.string().max(50).optional().nullable(),
  booking_url: z.string().url().optional().nullable().or(z.literal('')),
  booking_status: z.enum(['suggested', 'pending', 'confirmed', 'cancelled']).optional(),

  // Additional
  seat_number: z.string().max(10).optional().nullable(),
  meal_included: z.boolean().optional(),
  notes: z.string().max(500).optional().nullable(),
})

// Default values for the form
export const flightDefaults = {
  flight_type: 'one_way' as const,
  stops: 0,
  cabin_class: 'economy' as const,
  currency: 'USD',
  booking_status: 'pending' as const,
  meal_included: false,
}

export type FlightFormData = z.infer<typeof flightSchema>

// Cabin class options
export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium_economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
]

// Flight type options
export const FLIGHT_TYPES = [
  { value: 'one_way', label: 'One Way' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'return', label: 'Return' },
  { value: 'internal', label: 'Internal' },
]

// Booking status options
export const BOOKING_STATUSES = [
  { value: 'suggested', label: 'Suggested', color: 'bg-blue-100 text-blue-700' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
]
