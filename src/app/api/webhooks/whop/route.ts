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

    console.log('=== WHOP WEBHOOK RECEIVED ===')
    console.log('Timestamp:', new Date().toISOString())

    // Verify webhook signature using Whop SDK
    let webhookData: any
    try {
      webhookData = whop.webhooks.unwrap(requestBodyText, {
        headers: headersObject,
      })
      console.log('✓ Webhook signature verified')
      console.log('Webhook type:', webhookData.type)
      console.log('Full webhook data:', JSON.stringify(webhookData, null, 2))
    } catch (error) {
      console.error('✗ Invalid webhook signature:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Handle payment.succeeded event
    if (webhookData.type === 'payment.succeeded') {
      const payment = webhookData.data
      console.log('=== PAYMENT SUCCEEDED EVENT ===')
      console.log('Full payment object:', JSON.stringify(payment, null, 2))

      // Extract user email - try different possible locations
      const userEmail = payment.user?.email || payment.email || payment.metadata?.email
      const planId = payment.plan?.id || payment.plan_id
      const planName = payment.metadata?.plan_name || payment.plan?.name || 'Unknown Plan'
      const userId = payment.user?.id || payment.user_id

      console.log('Extracted data:')
      console.log('- Email:', userEmail)
      console.log('- Plan ID:', planId)
      console.log('- Plan Name:', planName)
      console.log('- User ID:', userId)

      if (!userEmail) {
        console.error('✗ NO EMAIL FOUND IN WEBHOOK')
        console.error('Checked locations:')
        console.error('- payment.user?.email:', payment.user?.email)
        console.error('- payment.email:', payment.email)
        console.error('- payment.metadata?.email:', payment.metadata?.email)
        console.error('Full payment data keys:', Object.keys(payment))
        return NextResponse.json({ received: true, warning: 'no_email' })
      }

      // Find user by email
      console.log('Checking if user exists in profiles table...')
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError)
      }
      console.log('Profile found:', profile ? 'Yes' : 'No')

      if (!profile) {
        // User hasn't signed up yet - save to pending subscriptions
        console.log('Saving to pending_subscriptions table...')
        const pendingData = {
          email: userEmail,
          whop_user_id: userId || 'unknown',
          whop_membership_id: payment.id || payment.membership_id,
          plan_id: planId,
          plan_name: planName,
          status: 'active',
          valid: true,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
        console.log('Data to insert:', JSON.stringify(pendingData, null, 2))

        const { data: pendingSub, error: pendingError } = await (supabase as any)
          .from('pending_subscriptions')
          .upsert(pendingData)
          .select()

        if (pendingError) {
          console.error('✗ ERROR saving to pending_subscriptions:', pendingError)
          throw new Error(`Failed to save pending subscription: ${pendingError.message}`)
        }

        console.log('✓ Payment saved to pending_subscriptions:', userEmail)
        console.log('Saved data:', JSON.stringify(pendingSub, null, 2))
        return NextResponse.json({ received: true, action: 'pending' })
      }

      // User exists - create/update subscription
      console.log('User exists, saving to subscriptions table...')
      const subscriptionData = {
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
      }
      console.log('Data to insert:', JSON.stringify(subscriptionData, null, 2))

      const { data: subscription, error: subscriptionError } = await (supabase as any)
        .from('subscriptions')
        .upsert(subscriptionData)
        .select()

      if (subscriptionError) {
        console.error('✗ ERROR saving to subscriptions:', subscriptionError)
        throw new Error(`Failed to save subscription: ${subscriptionError.message}`)
      }

      console.log('✓ Subscription activated for user:', userEmail)
      console.log('Saved data:', JSON.stringify(subscription, null, 2))
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
