import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateTables } from '@/types/database'

interface RouteParams {
  params: Promise<{ tripId: string; placeId: string }>
}

// GET - Get single place
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, placeId } = await params
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

    // Fetch place
    const { data: place, error: placeError } = await supabase
      .from('saved_places')
      .select('*')
      .eq('id', placeId)
      .eq('trip_id', tripId)
      .single()

    if (placeError || !place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 })
    }

    return NextResponse.json(place)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/places/[placeId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update place
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, placeId } = await params
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

    // Update place
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: place, error: updateError } = await (supabase as any)
      .from('saved_places')
      .update(body)
      .eq('id', placeId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating place:', updateError)
      return NextResponse.json({ error: 'Failed to update place' }, { status: 500 })
    }

    if (!place) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 })
    }

    return NextResponse.json(place)
  } catch (error) {
    console.error('Error in PATCH /api/trips/[tripId]/places/[placeId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete place
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, placeId } = await params
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

    // Delete place
    const { error: deleteError } = await supabase
      .from('saved_places')
      .delete()
      .eq('id', placeId)
      .eq('trip_id', tripId)

    if (deleteError) {
      console.error('Error deleting place:', deleteError)
      return NextResponse.json({ error: 'Failed to delete place' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/trips/[tripId]/places/[placeId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
