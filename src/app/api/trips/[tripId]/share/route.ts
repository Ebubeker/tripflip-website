import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Generate share link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = createServiceClient()

    // Check if trip exists
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, share_token, is_public')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    // If already has share token, return it
    if (trip.share_token) {
      return NextResponse.json({
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${trip.share_token}`,
        shareToken: trip.share_token
      })
    }

    // Generate new share token
    const shareToken = nanoid(12)

    // Update trip with share token
    const { error: updateError } = await supabase
      .from('trips')
      .update({ 
        share_token: shareToken,
        is_public: true 
      })
      .eq('id', tripId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
    }

    return NextResponse.json({
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareToken}`,
      shareToken
    })

  } catch (error: any) {
    console.error('Share error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Get share info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = createServiceClient()

    const { data: trip, error } = await supabase
      .from('trips')
      .select('share_token, is_public')
      .eq('id', tripId)
      .single()

    if (error || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    if (!trip.share_token) {
      return NextResponse.json({ shared: false })
    }

    return NextResponse.json({
      shared: true,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${trip.share_token}`,
      shareToken: trip.share_token
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Revoke share link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('trips')
      .update({ 
        share_token: null,
        is_public: false 
      })
      .eq('id', tripId)

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke share link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
