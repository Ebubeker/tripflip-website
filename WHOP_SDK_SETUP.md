# Whop SDK Integration - Complete Setup Guide

## Overview

This implementation uses the official Whop SDK (`@whop/sdk` and `@whop/checkout`) for embedded checkout. Users complete payment directly on your website without redirects.

## Architecture

```
User clicks button → API creates session → Modal opens → WhopCheckoutEmbed → Payment → Webhook → Database
```

## Prerequisites

1. Whop account at [whop.com](https://whop.com)
2. Supabase project with service role key
3. Node.js project with Next.js

## Step 1: Install Packages

```bash
npm install @whop/sdk @whop/checkout
```

## Step 2: Create Whop Products

You need to create **4 products** in Whop dashboard (2 plans × 2 billing periods):

### Explorer Plan
1. **Monthly Plan**:
   - Name: TripFlip Explorer (Monthly)
   - Price: $8/month (early bird) or $10/month (regular)
   - Type: Subscription, Monthly
   - Copy plan ID → `plan_explorer_monthly_xxxxx`

2. **Yearly Plan**:
   - Name: TripFlip Explorer (Yearly)
   - Price: $76.80/year (early bird) or $96/year (regular)
   - Type: Subscription, Yearly
   - Copy plan ID → `plan_explorer_yearly_xxxxx`

### Wanderer Plan
3. **Monthly Plan**:
   - Name: TripFlip Wanderer (Monthly)
   - Price: $20/month (early bird) or $25/month (regular)
   - Type: Subscription, Monthly
   - Copy plan ID → `plan_wanderer_monthly_xxxxx`

4. **Yearly Plan**:
   - Name: TripFlip Wanderer (Yearly)
   - Price: $192/year (early bird) or $240/year (regular)
   - Type: Subscription, Yearly
   - Copy plan ID → `plan_wanderer_yearly_xxxxx`

## Step 3: Get API Key

1. Go to Whop Dashboard → Settings → Developer
2. Copy your **API Key** (starts with `whop_`)
   - The company is automatically inferred from this key

## Step 4: Environment Variables

Add to `.env.local`:

```env
# Whop Configuration
WHOP_API_KEY=whop_xxxxxxxxxxxxx

# Plan IDs - Monthly
NEXT_PUBLIC_WHOP_EXPLORER_MONTHLY_PLAN_ID=plan_explorer_monthly_xxxxx
NEXT_PUBLIC_WHOP_WANDERER_MONTHLY_PLAN_ID=plan_wanderer_monthly_xxxxx

# Plan IDs - Yearly
NEXT_PUBLIC_WHOP_EXPLORER_YEARLY_PLAN_ID=plan_explorer_yearly_xxxxx
NEXT_PUBLIC_WHOP_WANDERER_YEARLY_PLAN_ID=plan_wanderer_yearly_xxxxx

# Already exists - make sure it's set
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 5: Setup Webhooks

1. Whop Dashboard → Settings → Webhooks → Add Endpoint
2. **URL**: `https://yourdomain.com/api/webhooks/whop`
3. **Events**: Select these:
   - ✅ `payment.succeeded`
   - ✅ `membership.deleted`
   - ✅ `membership.cancelled`
4. Save webhook endpoint

### For Local Development

Use ngrok to expose localhost:

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Copy the ngrok URL and add /api/webhooks/whop
# Example: https://abc123.ngrok.io/api/webhooks/whop
```

## Step 6: Run Database Migrations

In Supabase SQL Editor, run both migrations:

```sql
-- Run these in order:
-- 1. supabase/migrations/20240127_add_waitlist.sql
-- 2. supabase/migrations/20240128_add_subscriptions.sql
```

Or via CLI:
```bash
npx supabase db push
```

## Step 7: Test the Integration

### Test Checkout Flow

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/#pricing`
3. Click "Start Exploring" or "Go Unlimited"
4. Modal opens with embedded checkout
5. Use Whop test mode with test card: `4242 4242 4242 4242`
6. Complete checkout
7. Should redirect to `/dashboard?payment=success`

### Verify Webhook

1. Check terminal for webhook logs
2. Check Whop Dashboard → Webhooks → Logs
3. Verify subscription saved to Supabase:
   ```sql
   SELECT * FROM subscriptions;
   -- or if user hasn't signed up:
   SELECT * FROM pending_subscriptions;
   ```

## How It Works

### 1. User Clicks Pricing Button

```tsx
// pricing-section.tsx
const handleCheckout = (tier) => {
  const planId = isYearly ? tier.whopPlanId.yearly : tier.whopPlanId.monthly
  // Opens modal with plan ID
}
```

### 2. API Creates Checkout Session

```typescript
// /api/checkout/create-session
const checkoutConfig = await whop.checkoutConfigurations.create({
  plan_id: planId,
  metadata: { plan_name, source: 'tripflip_landing' },
})
return { sessionId: checkoutConfig.id }
// Note: Company is inferred from API key
```

### 3. Modal Renders Whop Component

```tsx
// whop-checkout-modal.tsx
<WhopCheckoutEmbed
  sessionId={sessionId}
  returnUrl="/dashboard?payment=success"
  onComplete={(paymentId) => {
    window.location.href = '/dashboard?payment=success'
  }}
/>
```

### 4. Webhook Saves Subscription

```typescript
// /api/webhooks/whop
webhookData = whop.webhooks.unwrap(requestBody, { headers })
if (webhookData.type === 'payment.succeeded') {
  // Save to subscriptions or pending_subscriptions table
}
```

## Files Created/Modified

### New Files
- `src/app/api/checkout/create-session/route.ts` - Creates Whop sessions
- `src/components/landing/whop-checkout-modal.tsx` - Embedded checkout modal
- `src/app/api/webhooks/whop/route.ts` - Webhook handler with SDK
- `supabase/migrations/20240128_add_subscriptions.sql` - Database schema

### Modified Files
- `src/lib/landing-data.ts` - Separate monthly/yearly plan IDs
- `src/components/landing/pricing-section.tsx` - SDK integration

## Troubleshooting

### Modal doesn't open
- Check console for errors
- Verify plan IDs are set in `.env.local`
- Ensure they start with `NEXT_PUBLIC_` (client-side accessible)

### Checkout doesn't load
- Check `/api/checkout/create-session` response
- Verify `WHOP_API_KEY` and `WHOP_COMPANY_ID` are correct
- Check browser console for CORS errors

### Webhook not receiving events
- Verify webhook URL is correct and accessible
- Check Whop Dashboard → Webhooks → Logs for errors
- Ensure you selected the right events
- For local dev, make sure ngrok is running

### Subscription not saving
- Check server logs for webhook errors
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check database tables exist (run migrations)
- Look for type errors in webhook handler

## Production Checklist

Before going live:

- [ ] Switch Whop from test mode to production mode
- [ ] Update webhook URL to production domain
- [ ] Remove ngrok webhook if used for testing
- [ ] Test full checkout flow with real card
- [ ] Verify webhooks are working in production
- [ ] Test subscription cancellation flow
- [ ] Set up monitoring/alerts for failed webhooks
- [ ] Test "user pays before signup" flow
- [ ] Verify pending subscriptions are moved on signup

## Key Differences from Previous Implementation

### Old (iframe approach)
- Direct iframe embed
- Manual URL construction
- No SDK verification

### New (SDK approach)
- ✅ Official `@whop/sdk` and `@whop/checkout`
- ✅ Server-side session creation
- ✅ Proper webhook signature verification
- ✅ Better type safety
- ✅ Follows Whop best practices

## Support

- Whop SDK Docs: https://docs.whop.com/sdk
- Whop Checkout Docs: https://docs.whop.com/developer/guides/accept-payments
- Whop Discord: https://discord.gg/whop
- GitHub Issues: Report TripFlip issues

## Summary

Everything is configured to use the official Whop SDK! The checkout is embedded directly in your website as a modal component. Just add your credentials to `.env.local`, create the products in Whop, and test the flow.
