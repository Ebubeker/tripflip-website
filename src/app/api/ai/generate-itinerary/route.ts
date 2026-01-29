import { NextRequest, NextResponse } from 'next/server'
import { geminiProModel } from '@/lib/gemini'
import { ITINERARY_GENERATION_PROMPT } from '@/lib/ai/prompts'
import { differenceInDays, format, addDays, parseISO } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const {
      destinations,
      startDate,
      endDate,
      budget,
      currency = 'USD',
      travelStyle,
      interests,
    } = await request.json()

    if (!destinations || destinations.length === 0) {
      return NextResponse.json(
        { error: 'Destinations are required' },
        { status: 400 }
      )
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const tripDays = differenceInDays(end, start) + 1

    // Build trip info for the prompt
    const tripInfo = `
Destinations: ${destinations.join(' → ')}
Trip Duration: ${tripDays} days (${startDate} to ${endDate})
Budget: ${budget ? `${currency} ${budget}` : 'Not specified'}
Travel Style: ${travelStyle || 'Balanced'} (${
      travelStyle === 'relaxed'
        ? '2-3 activities per day, plenty of rest'
        : travelStyle === 'packed'
        ? '4-5+ activities per day, maximize experiences'
        : '3-4 activities per day, good balance'
    })
Interests: ${interests?.join(', ') || 'General sightseeing'}
`.trim()

    const prompt = ITINERARY_GENERATION_PROMPT.replace('{tripInfo}', tripInfo)

    // Generate itinerary using Gemini Pro
    const result = await geminiProModel.generateContent(prompt)
    const responseText = result.response.text()

    // Parse the JSON response
    let itinerary
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse itinerary JSON:', parseError)
      // Return a fallback structure if parsing fails
      itinerary = generateFallbackItinerary(destinations, start, tripDays, currency)
    }

    // Ensure dates are properly formatted
    if (itinerary.days) {
      itinerary.days = itinerary.days.map((day: { date?: string; items?: unknown[] }, index: number) => ({
        ...day,
        date: day.date || format(addDays(start, index), 'yyyy-MM-dd'),
        items: day.items || [],
      }))
    }

    return NextResponse.json({ itinerary })
  } catch (error) {
    console.error('Itinerary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    )
  }
}

function generateFallbackItinerary(
  destinations: string[],
  startDate: Date,
  tripDays: number,
  currency: string
) {
  const days = []

  for (let i = 0; i < Math.min(tripDays, 7); i++) {
    const dayDate = format(addDays(startDate, i), 'yyyy-MM-dd')
    const destination = destinations[Math.floor(i / Math.ceil(tripDays / destinations.length))] || destinations[0]

    days.push({
      date: dayDate,
      title: `Day ${i + 1} in ${destination}`,
      items: [
        {
          time_slot: 'morning',
          title: `Explore ${destination}`,
          description: 'Start your day exploring the local area',
          category: 'sightseeing',
          location_name: destination,
          estimated_cost: 0,
          start_time: '09:00',
          end_time: '12:00',
          tips: 'Start early to avoid crowds',
          booking_required: false,
        },
        {
          time_slot: 'afternoon',
          title: 'Local Lunch',
          description: 'Try local cuisine at a recommended restaurant',
          category: 'food',
          location_name: destination,
          estimated_cost: 30,
          start_time: '12:30',
          end_time: '14:00',
          tips: 'Ask locals for recommendations',
          booking_required: false,
        },
        {
          time_slot: 'afternoon',
          title: 'Cultural Experience',
          description: 'Visit a local museum or cultural site',
          category: 'culture',
          location_name: destination,
          estimated_cost: 20,
          start_time: '14:30',
          end_time: '17:30',
          tips: 'Check opening hours in advance',
          booking_required: true,
        },
        {
          time_slot: 'evening',
          title: 'Dinner & Evening Walk',
          description: 'Enjoy dinner and explore the evening atmosphere',
          category: 'food',
          location_name: destination,
          estimated_cost: 50,
          start_time: '19:00',
          end_time: '22:00',
          tips: 'Book popular restaurants in advance',
          booking_required: false,
        },
      ],
    })
  }

  return {
    days,
    general_tips: [
      'Book popular attractions in advance',
      'Keep copies of important documents',
      'Download offline maps for your destinations',
      'Learn a few basic phrases in the local language',
      'Check visa requirements well in advance',
    ],
    estimated_total_cost: tripDays * 100,
  }
}
