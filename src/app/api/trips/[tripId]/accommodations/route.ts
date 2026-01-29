import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ tripId: string }>
}

// GET - List all accommodations for a trip
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

    // Fetch accommodations
    const { data: accommodations, error: accommodationsError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('trip_id', tripId)
      .order('check_in_date', { ascending: true })

    if (accommodationsError) {
      console.error('Error fetching accommodations:', accommodationsError)
      return NextResponse.json({ error: 'Failed to fetch accommodations' }, { status: 500 })
    }

    return NextResponse.json(accommodations)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/accommodations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new accommodation
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

    // Create accommodation
    const { data: accommodation, error: createError } = await supabase
      .from('accommodations')
      .insert({
        ...body,
        trip_id: tripId,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating accommodation:', createError)
      return NextResponse.json({ error: 'Failed to create accommodation' }, { status: 500 })
    }

    return NextResponse.json(accommodation, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/trips/[tripId]/accommodations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
