import { NextRequest, NextResponse } from 'next/server'
import { geminiModel } from '@/lib/gemini'
import { TRAVEL_ASSISTANT_SYSTEM_PROMPT, buildTripContext } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const { message, tripContext, history } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build the prompt with context
    let contextPrompt = TRAVEL_ASSISTANT_SYSTEM_PROMPT

    if (tripContext?.destinations?.length > 0) {
      contextPrompt += `\n\nCurrent Trip Context:\n${buildTripContext({
        destinations: tripContext.destinations,
        startDate: tripContext.startDate,
        endDate: tripContext.endDate,
        budget: tripContext.budget,
        currency: tripContext.currency,
      })}`
    }

    // Build conversation history
    const conversationParts: { role: 'user' | 'model'; parts: { text: string }[] }[] = []

    if (history && Array.isArray(history)) {
      for (const msg of history) {
        conversationParts.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      }
    }

    // Start chat with history
    const chat = geminiModel.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: contextPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I am TripFlip AI, your travel planning assistant. I\'m ready to help you plan your trip with personalized recommendations, itineraries, budget advice, and travel tips. How can I assist you today?' }],
        },
        ...conversationParts,
      ],
    })

    // Send the message
    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
