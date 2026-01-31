import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format, parseISO, differenceInDays } from 'date-fns'

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Generate ICS calendar file
function generateICS(trip: any, itinerary: any[], flights: any[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripFlip//Trip Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${trip.title}`,
  ]

  // Add flights as events
  for (const flight of flights) {
    if (flight.departure_datetime) {
      const startDate = new Date(flight.departure_datetime)
      const endDate = flight.arrival_datetime ? new Date(flight.arrival_datetime) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000)
      
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:flight-${flight.id}@tripflip.com`)
      lines.push(`DTSTART:${formatICSDate(startDate)}`)
      lines.push(`DTEND:${formatICSDate(endDate)}`)
      lines.push(`SUMMARY:✈️ ${flight.flight_type === 'outbound' ? 'Departure' : 'Return'}: ${flight.departure_airport} → ${flight.arrival_airport}`)
      lines.push(`DESCRIPTION:${flight.airline} ${flight.flight_number}`)
      lines.push(`LOCATION:${flight.departure_airport}`)
      lines.push('END:VEVENT')
    }
  }

  // Add itinerary items as events
  for (const item of itinerary) {
    if (item.date) {
      const itemDate = parseISO(item.date)
      let startTime = item.start_time || '09:00'
      const [hours, minutes] = startTime.split(':').map(Number)
      
      const startDate = new Date(itemDate)
      startDate.setHours(hours || 9, minutes || 0, 0, 0)
      
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000) // 2 hour default duration

      lines.push('BEGIN:VEVENT')
      lines.push(`UID:activity-${item.id}@tripflip.com`)
      lines.push(`DTSTART:${formatICSDate(startDate)}`)
      lines.push(`DTEND:${formatICSDate(endDate)}`)
      lines.push(`SUMMARY:${item.title}`)
      if (item.description) {
        lines.push(`DESCRIPTION:${item.description.replace(/\n/g, '\\n')}`)
      }
      if (item.location_name) {
        lines.push(`LOCATION:${item.location_name}`)
      }
      lines.push('END:VEVENT')
    }
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

// Generate HTML for PDF
function generatePDFHTML(trip: any, destinations: any[], flights: any[], accommodations: any[], itinerary: any[]): string {
  const startDate = parseISO(trip.start_date)
  const endDate = parseISO(trip.end_date)
  const nights = differenceInDays(endDate, startDate)
  const destination = destinations[0]?.city || 'Your Trip'

  // Group itinerary by date
  const itineraryByDate: Record<string, any[]> = {}
  for (const item of itinerary) {
    if (!itineraryByDate[item.date]) itineraryByDate[item.date] = []
    itineraryByDate[item.date].push(item)
  }

  const flightsCost = flights.reduce((sum, f) => sum + (f.price || 0), 0)
  const hotelsCost = accommodations.reduce((sum, a) => sum + (a.total_price || 0), 0)

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${trip.title} - TripFlip Itinerary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #3B82F6; }
    .header h1 { font-size: 32px; color: #1a1a1a; margin-bottom: 8px; }
    .header .subtitle { font-size: 18px; color: #666; }
    .header .dates { font-size: 14px; color: #888; margin-top: 8px; }
    
    .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 12px; }
    .stat { text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #3B82F6; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    
    .section { margin: 40px 0; }
    .section-title { font-size: 20px; font-weight: bold; color: #1a1a1a; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
    
    .flight-card { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .flight-type { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .flight-type.outbound { background: #dbeafe; color: #1d4ed8; }
    .flight-type.return { background: #dcfce7; color: #16a34a; }
    .flight-route { font-size: 24px; font-weight: bold; }
    .flight-details { color: #666; font-size: 14px; margin-top: 8px; }
    
    .hotel-card { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .hotel-name { font-size: 18px; font-weight: bold; }
    .hotel-dates { color: #666; font-size: 14px; margin-top: 4px; }
    .hotel-price { font-size: 18px; font-weight: bold; color: #3B82F6; margin-top: 8px; }
    
    .day { margin-bottom: 30px; page-break-inside: avoid; }
    .day-header { background: #3B82F6; color: white; padding: 12px 20px; border-radius: 12px 12px 0 0; }
    .day-header h3 { font-size: 16px; font-weight: 600; }
    .day-content { border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 20px; }
    
    .activity { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .activity:last-child { border-bottom: none; }
    .activity-time { width: 60px; font-size: 14px; color: #666; font-weight: 500; }
    .activity-content { flex: 1; }
    .activity-title { font-weight: 600; }
    .activity-desc { font-size: 14px; color: #666; margin-top: 4px; }
    .activity-meta { font-size: 12px; color: #888; margin-top: 4px; }
    
    .budget { background: #f8f9fa; border-radius: 12px; padding: 24px; }
    .budget-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .budget-row:last-child { border-bottom: none; }
    .budget-row.total { font-size: 20px; font-weight: bold; color: #3B82F6; }
    
    .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; }
    
    @media print {
      .container { padding: 20px; }
      .day { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${trip.title}</h1>
      <p class="subtitle">${destination}${destinations[0]?.country ? `, ${destinations[0].country}` : ''}</p>
      <p class="dates">${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}</p>
    </div>
    
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${nights}</div>
        <div class="stat-label">Nights</div>
      </div>
      <div class="stat">
        <div class="stat-value">${trip.travelers_count}</div>
        <div class="stat-label">Travelers</div>
      </div>
      <div class="stat">
        <div class="stat-value">${itinerary.length}</div>
        <div class="stat-label">Activities</div>
      </div>
      <div class="stat">
        <div class="stat-value">$${(trip.total_budget || 0).toLocaleString()}</div>
        <div class="stat-label">Total Cost</div>
      </div>
    </div>
    
    ${flights.length > 0 ? `
    <div class="section">
      <h2 class="section-title">✈️ Flights</h2>
      ${flights.map(f => `
        <div class="flight-card">
          <span class="flight-type ${f.flight_type}">${f.flight_type === 'outbound' ? 'Departure' : 'Return'}</span>
          <div class="flight-route">${f.departure_airport} → ${f.arrival_airport}</div>
          <div class="flight-details">
            ${f.airline} ${f.flight_number || ''}
            ${f.departure_datetime ? ` • ${format(parseISO(f.departure_datetime), 'MMM d, HH:mm')}` : ''}
            • $${(f.price || 0).toLocaleString()}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${accommodations.length > 0 ? `
    <div class="section">
      <h2 class="section-title">🏨 Accommodation</h2>
      ${accommodations.map(h => `
        <div class="hotel-card">
          <div class="hotel-name">${h.name}</div>
          <div class="hotel-dates">${h.city} • ${h.nights_count} nights</div>
          <div class="hotel-price">$${(h.total_price || 0).toLocaleString()}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="section">
      <h2 class="section-title">📅 Day by Day Itinerary</h2>
      ${Object.entries(itineraryByDate).map(([date, items], dayIndex) => `
        <div class="day">
          <div class="day-header">
            <h3>Day ${dayIndex + 1} - ${format(parseISO(date), 'EEEE, MMMM d')}</h3>
          </div>
          <div class="day-content">
            ${(items as any[]).map(item => `
              <div class="activity">
                <div class="activity-time">${item.start_time || '--:--'}</div>
                <div class="activity-content">
                  <div class="activity-title">${item.title}</div>
                  ${item.description ? `<div class="activity-desc">${item.description}</div>` : ''}
                  <div class="activity-meta">
                    ${item.category}
                    ${item.estimated_cost > 0 ? ` • $${item.estimated_cost}` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="section">
      <h2 class="section-title">💰 Budget Summary</h2>
      <div class="budget">
        <div class="budget-row">
          <span>Flights</span>
          <span>$${flightsCost.toLocaleString()}</span>
        </div>
        <div class="budget-row">
          <span>Accommodation</span>
          <span>$${hotelsCost.toLocaleString()}</span>
        </div>
        <div class="budget-row">
          <span>Activities & Other</span>
          <span>$${((trip.total_budget || 0) - flightsCost - hotelsCost).toLocaleString()}</span>
        </div>
        <div class="budget-row total">
          <span>Total</span>
          <span>$${(trip.total_budget || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>Generated by TripFlip • ${format(new Date(), 'MMMM d, yyyy')}</p>
      <p>tripflip.com</p>
    </div>
  </div>
</body>
</html>
  `
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params
    const { searchParams } = new URL(request.url)
    const exportFormat = searchParams.get('format') || 'html'
    
    const supabase = createServiceClient()

    // Fetch trip and related data
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .single()

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }

    const [destinationsRes, flightsRes, accommodationsRes, itineraryRes] = await Promise.all([
      supabase.from('trip_destinations').select('*').eq('trip_id', tripId).order('order_index'),
      supabase.from('flights').select('*').eq('trip_id', tripId).order('departure_datetime'),
      supabase.from('accommodations').select('*').eq('trip_id', tripId),
      supabase.from('itinerary_items').select('*').eq('trip_id', tripId).order('date').order('start_time'),
    ])

    const destinations = destinationsRes.data || []
    const flights = flightsRes.data || []
    const accommodations = accommodationsRes.data || []
    const itinerary = itineraryRes.data || []

    if (exportFormat === 'ics' || exportFormat === 'calendar') {
      const icsContent = generateICS(trip, itinerary, flights)
      return new NextResponse(icsContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${trip.title.replace(/[^a-z0-9]/gi, '_')}.ics"`,
        },
      })
    }

    // Default: HTML (can be printed as PDF)
    const htmlContent = generatePDFHTML(trip, destinations, flights, accommodations, itinerary)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })

  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
