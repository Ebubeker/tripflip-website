import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateTables } from '@/types/database'

interface RouteParams {
  params: Promise<{ tripId: string; accommodationId: string }>
}

// GET - Get single accommodation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, accommodationId } = await params
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

    // Fetch accommodation
    const { data: accommodation, error: accommodationError } = await supabase
      .from('accommodations')
      .select('*')
      .eq('id', accommodationId)
      .eq('trip_id', tripId)
      .single()

    if (accommodationError || !accommodation) {
      return NextResponse.json({ error: 'Accommodation not found' }, { status: 404 })
    }

    return NextResponse.json(accommodation)
  } catch (error) {
    console.error('Error in GET /api/trips/[tripId]/accommodations/[accommodationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update accommodation
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, accommodationId } = await params
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

    // Update accommodation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: accommodation, error: updateError } = await (supabase as any)
      .from('accommodations')
      .update(body)
      .eq('id', accommodationId)
      .eq('trip_id', tripId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating accommodation:', updateError)
      return NextResponse.json({ error: 'Failed to update accommodation' }, { status: 500 })
    }

    if (!accommodation) {
      return NextResponse.json({ error: 'Accommodation not found' }, { status: 404 })
    }

    return NextResponse.json(accommodation)
  } catch (error) {
    console.error('Error in PATCH /api/trips/[tripId]/accommodations/[accommodationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete accommodation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tripId, accommodationId } = await params
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

    // Delete accommodation
    const { error: deleteError } = await supabase
      .from('accommodations')
      .delete()
      .eq('id', accommodationId)
      .eq('trip_id', tripId)

    if (deleteError) {
      console.error('Error deleting accommodation:', deleteError)
      return NextResponse.json({ error: 'Failed to delete accommodation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/trips/[tripId]/accommodations/[accommodationId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
