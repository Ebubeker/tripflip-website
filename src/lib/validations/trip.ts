import { z } from 'zod'

export const tripSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description is too long').optional(),
  trip_type: z.enum([
    'leisure',
    'business',
    'adventure',
    'cultural',
    'romantic',
    'family',
    'solo',
    'group',
  ]),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_budget: z.number().min(0).optional().nullable(),
  currency: z.string().min(3).max(3),
  travelers_count: z.number().min(1).max(50),
  travel_style: z.enum(['relaxed', 'moderate', 'active']).optional(),
  interests: z.array(z.string()).max(10).optional(),
  auto_plan: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
})

export const destinationSchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  country_code: z.string().max(3).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  arrival_date: z.string().optional(),
  departure_date: z.string().optional(),
  accommodation_budget: z.number().min(0).optional().nullable(),
  activities_budget: z.number().min(0).optional().nullable(),
  food_budget: z.number().min(0).optional().nullable(),
  transport_budget: z.number().min(0).optional().nullable(),
  notes: z.string().max(500).optional(),
})

export type TripFormData = z.infer<typeof tripSchema>
export type DestinationFormData = z.infer<typeof destinationSchema>

// Trip type options
export const TRIP_TYPES = [
  { value: 'leisure', label: 'Leisure', description: 'Relaxing vacation' },
  { value: 'business', label: 'Business', description: 'Work-related travel' },
  { value: 'adventure', label: 'Adventure', description: 'Outdoor activities' },
  { value: 'cultural', label: 'Cultural', description: 'Museums, history, art' },
  { value: 'romantic', label: 'Romantic', description: 'Couples getaway' },
  { value: 'family', label: 'Family', description: 'Family-friendly trip' },
  { value: 'solo', label: 'Solo', description: 'Traveling alone' },
  { value: 'group', label: 'Group', description: 'With friends or team' },
]

// Status options
export const TRIP_STATUSES = [
  { value: 'planning', label: 'Planning', description: 'Still organizing' },
  { value: 'upcoming', label: 'Upcoming', description: 'Trip is scheduled' },
  { value: 'active', label: 'Active', description: 'Currently traveling' },
  { value: 'completed', label: 'Completed', description: 'Trip finished' },
  { value: 'cancelled', label: 'Cancelled', description: 'Trip cancelled' },
]

// Travel style options
export const TRAVEL_STYLES = [
  { value: 'relaxed', label: 'Relaxed', description: 'Slow-paced, plenty of downtime' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced mix of activities and rest' },
  { value: 'active', label: 'Active', description: 'Packed schedule, lots of activities' },
]

// Interest options
export const TRAVEL_INTERESTS = [
  { value: 'culture', label: 'Culture & History', icon: 'landmark' },
  { value: 'food', label: 'Food & Dining', icon: 'utensils' },
  { value: 'nature', label: 'Nature & Outdoors', icon: 'trees' },
  { value: 'adventure', label: 'Adventure & Sports', icon: 'mountain' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { value: 'nightlife', label: 'Nightlife', icon: 'music' },
  { value: 'art', label: 'Art & Museums', icon: 'palette' },
  { value: 'relaxation', label: 'Relaxation & Wellness', icon: 'spa' },
  { value: 'photography', label: 'Photography', icon: 'camera' },
  { value: 'local', label: 'Local Experiences', icon: 'users' },
]
