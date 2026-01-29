import { z } from 'zod'

export const accommodationSchema = z.object({
  // Basic info
  name: z.string().min(1, 'Name is required').max(200),
  type: z.enum(['hotel', 'hostel', 'apartment', 'resort', 'villa', 'guesthouse', 'airbnb', 'other']).optional(),

  // Location
  address: z.string().max(300).optional().nullable(),
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().max(100).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Dates
  check_in_date: z.string().optional().nullable(),
  check_in_time: z.string().max(10).optional().nullable(),
  check_out_date: z.string().optional().nullable(),
  check_out_time: z.string().max(10).optional().nullable(),
  nights_count: z.number().min(1).optional().nullable(),

  // Room info
  room_type: z.string().max(100).optional().nullable(),
  room_count: z.number().min(1).optional(),
  guests_count: z.number().min(1).optional(),

  // Pricing
  price_per_night: z.number().min(0).optional().nullable(),
  total_price: z.number().min(0).optional().nullable(),
  currency: z.string().min(3).max(3).optional(),

  // Ratings
  rating: z.number().min(0).max(5).optional().nullable(),

  // Booking info
  booking_reference: z.string().max(50).optional().nullable(),
  booking_url: z.string().url().optional().nullable().or(z.literal('')),
  booking_status: z.enum(['suggested', 'pending', 'confirmed', 'cancelled']).optional(),

  // Features
  amenities: z.array(z.string()).optional(),
  breakfast_included: z.boolean().optional(),
  cancellation_policy: z.string().max(500).optional().nullable(),

  // Additional
  notes: z.string().max(500).optional().nullable(),
})

// Default values for the form
export const accommodationDefaults = {
  type: 'hotel' as const,
  room_count: 1,
  guests_count: 1,
  currency: 'USD',
  booking_status: 'pending' as const,
  breakfast_included: false,
}

export type AccommodationFormData = z.infer<typeof accommodationSchema>

// Accommodation type options
export const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'resort', label: 'Resort' },
  { value: 'villa', label: 'Villa' },
  { value: 'guesthouse', label: 'Guesthouse' },
  { value: 'airbnb', label: 'Airbnb' },
  { value: 'other', label: 'Other' },
]

// Common amenities
export const COMMON_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Pool',
  'Gym',
  'Parking',
  'Restaurant',
  'Room Service',
  'Spa',
  'Bar',
  'Laundry',
  'Kitchen',
  'Pet Friendly',
]
