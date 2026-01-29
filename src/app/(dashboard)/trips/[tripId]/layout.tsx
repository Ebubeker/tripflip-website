import { redirect, notFound } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { TripHeader } from '@/components/trips/trip-header'
import { TripTabs } from '@/components/trips/trip-tabs'

interface TripLayoutProps {
  children: React.ReactNode
  params: Promise<{
    tripId: string
  }>
}

export default async function TripLayout({ children, params }: TripLayoutProps) {
  const supabase = await createClient()
  const { tripId } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: trip, error } = await supabase
    .from('trips')
    .select(`
      *,
      trip_destinations (
        id,
        city,
        country,
        country_code,
        arrival_date,
        departure_date,
        order_index
      )
    `)
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (error || !trip) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <TripHeader trip={trip} />
      <TripTabs tripId={tripId} />
      {children}
    </div>
  )
}
