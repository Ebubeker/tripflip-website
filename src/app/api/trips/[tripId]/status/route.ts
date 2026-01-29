import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface PlanningStatus {
  flights: 'pending' | 'in_progress' | 'completed' | 'error'
  itinerary: 'pending' | 'in_progress' | 'completed' | 'error'
  hotels: 'pending' | 'in_progress' | 'completed' | 'error'
  places: 'pending' | 'in_progress' | 'completed' | 'error'
  details: 'pending' | 'in_progress' | 'completed' | 'error'
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = createServerClient()

    const { data: trip, error } = await supabase
      .from('trips')
      .select('status, planning_status, title, description')
      .eq('id', tripId)
      .single()

    if (error || !trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    let progress: PlanningStatus = {
      flights: 'pending',
      itinerary: 'pending',
      hotels: 'pending',
      places: 'pending',
      details: 'pending',
    }

    if (trip.planning_status) {
      try {
        progress = JSON.parse(trip.planning_status)
      } catch {
        // Keep default status
      }
    }

    // Determine overall status
    const allCompleted = Object.values(progress).every(
      (s) => s === 'completed' || s === 'error'
    )
    const hasError = Object.values(progress).some((s) => s === 'error')

    return NextResponse.json({
      status: trip.status === 'planning' && allCompleted ? 'completed' : trip.status,
      progress,
      isComplete: allCompleted,
      hasError,
      title: trip.title,
      description: trip.description,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
