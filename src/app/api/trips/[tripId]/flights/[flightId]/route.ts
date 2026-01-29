import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateTables } from '@/types/database'

interface RouteParams {
  params: Promise<{ tripId: string; flightId: string }>
}

// GET - Get single flight
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, flightId } = await params
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

    // Fetch flight
    const { data: flight, error: flightError } = await supabase
      .from('flights')
      .select('*')
      .eq('id', flightId)
      .eq('trip_id', tripId)
      .single()

    if (flightError || !flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
    }

    return NextResponse.json(flight)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/flights/[flightId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update flight
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, flightId } = await params
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

    // Update flight
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: flight, error: updateError } = await (supabase as any)
      .from('flights')
      .update(body)
      .eq('id', flightId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating flight:', updateError)
      return NextResponse.json({ error: 'Failed to update flight' }, { status: 500 })
    }

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 })
    }

    return NextResponse.json(flight)
  } catch (error) {
    console.error('Error in PATCH /api/trips/[tripId]/flights/[flightId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete flight
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, flightId } = await params
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

    // Delete flight
    const { error: deleteError } = await supabase
      .from('flights')
      .delete()
      .eq('id', flightId)
      .eq('trip_id', tripId)

    if (deleteError) {
      console.error('Error deleting flight:', deleteError)
      return NextResponse.json({ error: 'Failed to delete flight' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/trips/[tripId]/flights/[flightId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
