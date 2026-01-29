import { NextResponse } from 'next/server'
import Whop from '@whop/sdk'

const whop = new Whop({
  apiKey: process.env.WHOP_API_KEY!,
  ...(process.env.NODE_ENV !== 'production' && {
    baseURL: 'https://sandbox-api.whop.com/api/v1',
  }),
})

export async function POST(request: Request) {
  try {
    const { planId, planName } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Create checkout configuration using Whop SDK
    // The company is inferred from the API key
    const checkoutConfig = await whop.checkoutConfigurations.create({
      plan_id: planId, // This is your Whop plan ID from the dashboard
      metadata: {
        plan_name: planName,
        source: 'tripflip_landing',
      },
    })

    return NextResponse.json({
      sessionId: checkoutConfig.id,
    })
  } catch (error: any) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
