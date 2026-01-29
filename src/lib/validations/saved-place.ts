import { z } from 'zod'

export const savedPlaceSchema = z.object({
  // Basic info
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(500).optional().nullable(),
  category: z.enum([
    'attraction',
    'restaurant',
    'cafe',
    'bar',
    'museum',
    'park',
    'beach',
    'shopping',
    'entertainment',
    'landmark',
    'other',
  ]).optional(),

  // Location
  address: z.string().max(300).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Details
  rating: z.number().min(0).max(5).optional().nullable(),
  price_level: z.enum(['free', 'cheap', 'moderate', 'expensive', 'very_expensive']).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal('')),

  // User input
  personal_rating: z.number().min(1).max(5).optional().nullable(),
  personal_notes: z.string().max(500).optional().nullable(),
  is_visited: z.boolean().optional(),

  // Tags
  tags: z.array(z.string()).max(10).optional(),
})

// Default values for the form
export const savedPlaceDefaults = {
  category: 'attraction' as const,
  is_visited: false,
}

export type SavedPlaceFormData = z.infer<typeof savedPlaceSchema>

// Place category options
export const PLACE_CATEGORIES = [
  { value: 'attraction', label: 'Attraction', icon: 'landmark' },
  { value: 'restaurant', label: 'Restaurant', icon: 'utensils' },
  { value: 'cafe', label: 'Cafe', icon: 'coffee' },
  { value: 'bar', label: 'Bar', icon: 'wine' },
  { value: 'museum', label: 'Museum', icon: 'building-columns' },
  { value: 'park', label: 'Park', icon: 'trees' },
  { value: 'beach', label: 'Beach', icon: 'umbrella-beach' },
  { value: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { value: 'entertainment', label: 'Entertainment', icon: 'ticket' },
  { value: 'landmark', label: 'Landmark', icon: 'monument' },
  { value: 'other', label: 'Other', icon: 'map-pin' },
]

// Price level options
export const PRICE_LEVELS = [
  { value: 'free', label: 'Free', symbol: '' },
  { value: 'cheap', label: 'Cheap', symbol: '$' },
  { value: 'moderate', label: 'Moderate', symbol: '$$' },
  { value: 'expensive', label: 'Expensive', symbol: '$$$' },
  { value: 'very_expensive', label: 'Very Expensive', symbol: '$$$$' },
]
