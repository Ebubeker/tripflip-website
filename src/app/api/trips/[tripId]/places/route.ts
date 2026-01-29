import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ tripId: string }>
}

// GET - List all saved places for a trip
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

    // Fetch saved places
    const { data: places, error: placesError } = await supabase
      .from('saved_places')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (placesError) {
      console.error('Error fetching places:', placesError)
      return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 })
    }

    return NextResponse.json(places)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/places:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new saved place
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

    // Create place
    const { data: place, error: createError } = await supabase
      .from('saved_places')
      .insert({
        ...body,
        trip_id: tripId,
        source: body.source || 'manual', // Mark as manually added
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating place:', createError)
      return NextResponse.json({ error: 'Failed to create place' }, { status: 500 })
    }

    return NextResponse.json(place, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/trips/[tripId]/places:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
