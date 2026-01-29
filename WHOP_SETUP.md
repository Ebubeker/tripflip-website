# Whop Payment Integration Setup Guide

This guide will walk you through setting up Whop payments for TripFlip.

## Prerequisites

1. A Whop account (sign up at [whop.com](https://whop.com))
2. Your TripFlip app running locally or deployed

## Step 1: Create a Whop Company

1. Go to [https://dash.whop.com](https://dash.whop.com)
2. Click "Create Company" if you haven't already
3. Fill in your company details (TripFlip, description, logo, etc.)

## Step 2: Create Products (Plans)

You need to create 2 products in Whop (Free plan doesn't need payment):

### Explorer Plan

1. In Whop dashboard, go to "Products" → "Create Product"
2. Fill in:
   - **Name**: TripFlip Explorer
   - **Description**: 5 trips per month with advanced AI planning, hotel booking, and budget tracking
   - **Price**:
     - Monthly: $8/month (20% early bird discount from $10)
     - Yearly: $76.80/year (20% early bird discount from $96)
   - **Type**: Subscription
   - **Access Period**: Monthly or Yearly
3. Click "Create Product"
4. **Copy the Plan ID** (looks like `plan_xxxxxxxxxxxxx`)

### Wanderer Plan

1. Create another product:
   - **Name**: TripFlip Wanderer
   - **Description**: Unlimited trips with priority AI, all booking integrations, and priority support
   - **Price**:
     - Monthly: $20/month (20% early bird discount from $25)
     - Yearly: $192/year (20% early bird discount from $240)
   - **Type**: Subscription
   - **Access Period**: Monthly or Yearly
2. Click "Create Product"
3. **Copy the Plan ID** (looks like `plan_xxxxxxxxxxxxx`)

## Step 3: Get Your API Keys

1. In Whop dashboard, go to "Settings" → "Developer"
2. Copy your **API Key** (keep this secret!)
3. Generate a **Webhook Secret** if you haven't already

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Whop Configuration
NEXT_PUBLIC_WHOP_EXPLORER_PLAN_ID=plan_xxxxxxxxxxxxx  # Explorer plan ID from Step 2
NEXT_PUBLIC_WHOP_WANDERER_PLAN_ID=plan_xxxxxxxxxxxxx  # Wanderer plan ID from Step 2
WHOP_API_KEY=whop_xxxxxxxxxxxxx                        # Your Whop API key (keep secret!)
WHOP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx                # Your webhook secret
```

## Step 5: Setup Webhooks

1. In Whop dashboard, go to "Settings" → "Webhooks"
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - **Development**: Use ngrok or similar to expose localhost
     ```bash
     ngrok http 3000
     # Then use: https://your-ngrok-url.ngrok.io/api/webhooks/whop
     ```
   - **Production**: `https://yourdomain.com/api/webhooks/whop`
4. Select these events:
   - ✅ `membership.created`
   - ✅ `membership.updated`
   - ✅ `membership.deleted`
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`
5. Click "Create Webhook"

## Step 6: Create Database Tables for Subscriptions

Run this SQL in your Supabase SQL Editor:

```sql
-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  whop_user_id TEXT NOT NULL,
  whop_membership_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  valid BOOLEAN DEFAULT true,
  cancel_at_period_end BOOLEAN DEFAULT false,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending subscriptions (for users who paid before signing up)
CREATE TABLE IF NOT EXISTS pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  whop_user_id TEXT NOT NULL,
  whop_membership_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  valid BOOLEAN DEFAULT true,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_whop_membership_id ON subscriptions(whop_membership_id);
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_email ON pending_subscriptions(email);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage pending subscriptions"
  ON pending_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE subscriptions IS 'User subscription status from Whop';
COMMENT ON TABLE pending_subscriptions IS 'Subscriptions purchased before user signup';
```

## Step 7: Test the Integration

### Test Free Plan
1. Go to your pricing page
2. Click "Get Started" on the Free plan
3. Should redirect to `/plan` (no payment needed)

### Test Paid Plans
1. Click "Start Exploring" or "Go Unlimited"
2. Should redirect to Whop checkout
3. Use Whop test mode with test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify webhook received in Whop dashboard
6. Check your database - subscription should be created

## Step 8: Handle User Authentication Flow

When a user completes checkout:
1. They're redirected to `/dashboard?payment=success`
2. Show a success message
3. If they don't have an account, prompt them to sign up
4. On signup, check `pending_subscriptions` table for their email
5. Move subscription from `pending_subscriptions` to `subscriptions`

## Step 9: Check Subscription Status

Create a helper function to check if user has active subscription:

```typescript
// src/lib/subscription.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserSubscription(userId: string) {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('valid', true)
    .single()

  return subscription
}

export function hasActiveSubscription(subscription: any) {
  if (!subscription) return false

  return (
    subscription.valid &&
    subscription.status === 'active' &&
    new Date(subscription.current_period_end) > new Date()
  )
}
```

## Troubleshooting

### Webhooks not working
- Check webhook URL is correct and accessible
- Verify webhook secret matches `.env.local`
- Check Whop dashboard → Webhooks → Logs for errors

### Checkout not working
- Verify plan IDs are correct in `.env.local`
- Check browser console for errors
- Ensure Whop company/products are published

### Database errors
- Verify migration was run successfully
- Check RLS policies are set up correctly
- Ensure service role key is set in `.env.local`

## Production Checklist

- [ ] Update webhook URL to production domain
- [ ] Use production Whop API keys (not test mode)
- [ ] Set proper redirect URLs for success/cancel
- [ ] Test full checkout flow in production
- [ ] Monitor webhook logs in Whop dashboard
- [ ] Set up email notifications for failed payments

## Support

- Whop Documentation: https://docs.whop.com
- Whop Discord: https://discord.gg/whop
- TripFlip Support: [Your support email]
