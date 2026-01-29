# Whop Integration - Quick Start

## What Changed

✅ **Pricing cards now have buttons at the bottom** (using flexbox)
✅ **Early Bird discount changed from 30% to 20%**
✅ **Badge now says "Early Bird: 20% off all plans!"**
✅ **Whop payment integration added**
✅ **Webhook handler created** to sync subscriptions

## Environment Variables You Need

Add these to your `.env.local`:

```env
# Whop Configuration
NEXT_PUBLIC_WHOP_EXPLORER_PLAN_ID=plan_xxxxxxxxxxxxx
NEXT_PUBLIC_WHOP_WANDERER_PLAN_ID=plan_xxxxxxxxxxxxx
WHOP_API_KEY=whop_xxxxxxxxxxxxx
WHOP_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Already exists - make sure it's set
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Steps (Quick Version)

### 1. Create Whop Account
Go to [https://dash.whop.com](https://dash.whop.com) and sign up

### 2. Create Products
Create 2 products with these prices:
- **Explorer**: $8/month or $76.80/year
- **Wanderer**: $20/month or $192/year

Copy the Plan IDs (look like `plan_xxxxxxxxxxxxx`)

### 3. Get API Keys
Dashboard → Settings → Developer:
- Copy API Key
- Generate Webhook Secret

### 4. Add to .env.local
Paste the values from steps 2 & 3

### 5. Setup Webhook
Dashboard → Settings → Webhooks → Add Endpoint:
- **URL**: `https://yourdomain.com/api/webhooks/whop`
- **Events**: Select all membership and payment events
- For local testing, use ngrok:
  ```bash
  ngrok http 3000
  # Use: https://your-id.ngrok.io/api/webhooks/whop
  ```

### 6. Run Database Migrations
In Supabase SQL Editor, run:
```bash
# Run both migrations
supabase/migrations/20240127_add_waitlist.sql
supabase/migrations/20240128_add_subscriptions.sql
```

Or via CLI:
```bash
npx supabase db push
```

### 7. Test It
1. Go to `/#pricing`
2. Click "Start Exploring" or "Go Unlimited"
3. Should redirect to Whop checkout
4. Use test card: `4242 4242 4242 4242` (in test mode)

## New Files Created

- `src/components/landing/pricing-section.tsx` - Updated with flexbox and Whop checkout
- `src/lib/landing-data.ts` - Updated with 20% discount and plan IDs
- `src/app/api/webhooks/whop/route.ts` - Webhook handler for Whop events
- `supabase/migrations/20240128_add_subscriptions.sql` - Database schema for subscriptions
- `WHOP_SETUP.md` - Complete setup guide with troubleshooting
- `WHOP_QUICK_START.md` - This file

## How It Works

1. **User clicks pricing button** → Redirects to Whop checkout
2. **User completes payment** → Whop sends webhook to `/api/webhooks/whop`
3. **Webhook handler** → Saves subscription to database
4. **User signs up/logs in** → App checks subscription status
5. **Access granted** → User can use paid features

## Testing Locally

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Copy the ngrok URL and add /api/webhooks/whop to Whop webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/whop
```

## Need Help?

See `WHOP_SETUP.md` for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Production deployment checklist
- How to check subscription status in your app

## Summary

Everything is set up and ready to go! Just add the environment variables, create the Whop products, and test the checkout flow. The buttons now appear at the bottom of the pricing cards, and the discount is 20% (early bird).
