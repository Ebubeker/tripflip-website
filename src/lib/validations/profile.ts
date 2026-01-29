import { z } from 'zod'

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  nationality: z.string().max(100).optional().or(z.literal('')),
  passport_country: z.string().max(100).optional().or(z.literal('')),
  preferred_currency: z.string().min(1, 'Please select a currency'),
  preferred_language: z.string().min(1, 'Please select a language'),
})

export const preferencesSchema = z.object({
  travel_style: z.array(z.string()),
  interests: z.array(z.string()),
  accommodation_type: z.array(z.string()),
  budget_preference: z.enum(['budget', 'moderate', 'luxury', 'ultra-luxury']),
  seat_preference: z.enum(['window', 'aisle', 'middle', 'any']),
  meal_preferences: z.array(z.string()),
  travel_frequency: z.enum(['rarely', 'occasionally', 'frequently', 'constantly']),
  trip_duration_preference: z.enum(['weekend', 'week', 'two-weeks', 'month', 'extended']),
  ai_suggestions_enabled: z.boolean(),
  notifications_enabled: z.boolean(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type PreferencesFormData = z.infer<typeof preferencesSchema>

// Options for select fields
export const TRAVEL_STYLES = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'budget', label: 'Budget' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'eco-friendly', label: 'Eco-Friendly' },
]

export const INTERESTS = [
  { value: 'beaches', label: 'Beaches' },
  { value: 'mountains', label: 'Mountains' },
  { value: 'cities', label: 'Cities' },
  { value: 'food', label: 'Food & Cuisine' },
  { value: 'history', label: 'History' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'nature', label: 'Nature' },
  { value: 'art', label: 'Art & Museums' },
  { value: 'sports', label: 'Sports' },
  { value: 'photography', label: 'Photography' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'wellness', label: 'Wellness & Spa' },
]

export const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotels' },
  { value: 'hostel', label: 'Hostels' },
  { value: 'apartment', label: 'Apartments' },
  { value: 'resort', label: 'Resorts' },
  { value: 'villa', label: 'Villas' },
  { value: 'boutique', label: 'Boutique Hotels' },
  { value: 'airbnb', label: 'Airbnb' },
]

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', description: 'Under $50/day' },
  { value: 'moderate', label: 'Moderate', description: '$50-150/day' },
  { value: 'luxury', label: 'Luxury', description: '$150-500/day' },
  { value: 'ultra-luxury', label: 'Ultra Luxury', description: '$500+/day' },
]

export const SEAT_PREFERENCES = [
  { value: 'window', label: 'Window' },
  { value: 'aisle', label: 'Aisle' },
  { value: 'middle', label: 'Middle' },
  { value: 'any', label: 'No Preference' },
]

export const MEAL_PREFERENCES = [
  { value: 'none', label: 'No Restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'gluten-free', label: 'Gluten-Free' },
]

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
]

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
]
