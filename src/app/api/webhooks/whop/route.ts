import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Whop from '@whop/sdk'

const whop = new Whop({
  apiKey: process.env.WHOP_API_KEY!,
  ...(process.env.NODE_ENV !== 'production' && {
    baseURL: 'https://sandbox-api.whop.com/api/v1',
  }),
})

export async function POST(request: Request) {
  try {
    const requestBodyText = await request.text()
    const headersList = await headers()
    const headersObject = Object.fromEntries(headersList)

    // Verify webhook signature using Whop SDK
    let webhookData: any
    try {
      webhookData = whop.webhooks.unwrap(requestBodyText, {
        headers: headersObject,
      })
    } catch (error) {
      console.error('Invalid webhook signature:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Handle payment.succeeded event
    if (webhookData.type === 'payment.succeeded') {
      const payment = webhookData.data
      console.log('Payment succeeded webhook:', JSON.stringify(payment, null, 2))

      // Extract user email - try different possible locations
      const userEmail = payment.user?.email || payment.email || payment.metadata?.email
      const planId = payment.plan?.id || payment.plan_id
      const planName = payment.metadata?.plan_name || payment.plan?.name || 'Unknown Plan'
      const userId = payment.user?.id || payment.user_id

      if (!userEmail) {
        console.error('No user email in payment webhook, full data:', payment)
        return NextResponse.json({ received: true, warning: 'no_email' })
      }

      // Find user by email
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (!profile) {
        // User hasn't signed up yet - save to pending subscriptions
        await (supabase as any)
          .from('pending_subscriptions')
          .upsert({
            email: userEmail,
            whop_user_id: userId || 'unknown',
            whop_membership_id: payment.id || payment.membership_id,
            plan_id: planId,
            plan_name: planName,
            status: 'active',
            valid: true,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })

        console.log('Payment saved to pending subscriptions:', userEmail)
        return NextResponse.json({ received: true, action: 'pending' })
      }

      // User exists - create/update subscription
      await (supabase as any)
        .from('subscriptions')
        .upsert({
          user_id: profile.id,
          whop_user_id: userId || 'unknown',
          whop_membership_id: payment.id || payment.membership_id,
          plan_id: planId,
          plan_name: planName,
          status: 'active',
          valid: true,
          cancel_at_period_end: false,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })

      console.log('Subscription activated for user:', userEmail)
      return NextResponse.json({ received: true, action: 'activated' })
    }

    // Handle membership events
    if (webhookData.type === 'membership.deleted' || webhookData.type === 'membership.cancelled') {
      const membership = webhookData.data
      const userEmail = membership.user?.email || membership.email

      if (!userEmail) {
        console.error('No user email in membership webhook')
        return NextResponse.json({ received: true, warning: 'no_email' })
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (profile) {
        await (supabase as any)
          .from('subscriptions')
          .update({
            status: 'canceled',
            valid: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', profile.id)

        console.log('Subscription canceled for user:', userEmail)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Whop webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
