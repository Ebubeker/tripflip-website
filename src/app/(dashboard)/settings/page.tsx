import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { PreferencesForm } from '@/components/settings/preferences-form'
import { DangerZone } from '@/components/settings/danger-zone'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your TripFlip account settings and preferences',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching preferences:', error)
  }

  // Create default preferences if they don't exist
  const defaultPreferences = {
    id: '',
    user_id: user.id,
    travel_style: [],
    interests: [],
    accommodation_type: [],
    budget_preference: 'moderate',
    daily_budget_min: null,
    daily_budget_max: null,
    preferred_airlines: [],
    seat_preference: 'any',
    meal_preferences: [],
    accessibility_needs: [],
    avoid_countries: [],
    favorite_destinations: [],
    travel_frequency: 'occasionally',
    trip_duration_preference: 'week',
    ai_suggestions_enabled: true,
    notifications_enabled: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your travel preferences and account settings
        </p>
      </div>

      <PreferencesForm preferences={preferences || defaultPreferences} />

      <DangerZone />
    </div>
  )
}
