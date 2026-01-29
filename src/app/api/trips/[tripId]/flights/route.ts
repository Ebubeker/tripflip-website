import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ tripId: string }>
}

// POST - Add new flight to trip
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const tripData = trip as { user_id: string }
    if (tripData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    // Insert flight
    const { data: flight, error: insertError } = await supabase
      .from('flights')
      .insert({
        trip_id: tripId,
        ...body,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating flight:', insertError)
      return NextResponse.json({ error: 'Failed to create flight' }, { status: 500 })
    }

    return NextResponse.json(flight, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/trips/[tripId]/flights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - List all flights for a trip
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId } = await params
    const supabase = await createClient()

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('user_id')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const tripData = trip as { user_id: string }
    if (tripData.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch flights
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .eq('trip_id', tripId)
      .order('departure_datetime', { ascending: true })

    if (flightsError) {
      console.error('Error fetching flights:', flightsError)
      return NextResponse.json({ error: 'Failed to fetch flights' }, { status: 500 })
    }

    return NextResponse.json(flights)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/flights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
