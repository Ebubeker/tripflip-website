# Whop Embedded Checkout - Implementation Guide

## What is Embedded Checkout?

Instead of redirecting users to Whop's checkout page, the checkout form opens in a **modal/popup on your website**. Users complete payment without leaving TripFlip, providing a better user experience.

## How It Works

1. User clicks "Start Exploring" or "Go Unlimited"
2. A beautiful modal appears with the Whop checkout embedded
3. User completes payment in the modal
4. On success, they're redirected to `/dashboard?payment=success`
5. Modal closes automatically

## Implementation Details

### Components Created

**1. `whop-checkout-modal.tsx`** - Modal component
- Animated backdrop with blur effect
- Embedded Whop checkout iframe
- Secure payment badge
- Listens for checkout completion events

**2. Updated `pricing-section.tsx`**
- Opens modal instead of redirecting
- Passes plan ID and billing period to modal
- Manages modal state

## Whop Checkout URL Parameters

```typescript
const checkoutUrl = new URL('https://whop.com/checkout')
checkoutUrl.searchParams.set('plan', planId)                    // Your plan ID
checkoutUrl.searchParams.set('billing_period', 'month'|'year')  // Billing cycle
checkoutUrl.searchParams.set('embedded', 'true')                // Enable embedded mode
checkoutUrl.searchParams.set('success_url', '/dashboard?payment=success')
checkoutUrl.searchParams.set('cancel_url', '/#pricing')
```

## Event Handling

The modal listens for postMessage events from Whop:

```typescript
// Checkout completed successfully
event.data.type === 'checkout.completed'
→ Redirect to /dashboard?payment=success

// User closed checkout
event.data.type === 'checkout.closed'
→ Close modal
```

## Styling

The modal features:
- **Backdrop**: Black with 60% opacity and blur
- **Modal**: White with rounded corners, max-width 4xl
- **Header**: Cream background matching your design
- **Footer**: Secure payment badge + Cancel button
- **Animations**: Smooth fade and scale transitions with Framer Motion

## Security

- Origin verification: Only accepts messages from `*.whop.com`
- HTTPS required for iframe embedding
- Webhook verification for backend processing

## Setup in Whop Dashboard

### Enable Embedded Checkout

1. Go to Whop Dashboard → Settings → Checkout
2. Enable "Embedded Checkout" option
3. Add your domain to allowed origins:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

### Configure Redirect URLs

In your product settings:
- **Success URL**: `https://yourdomain.com/dashboard?payment=success`
- **Cancel URL**: `https://yourdomain.com/#pricing`

## Testing

### Local Development
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/#pricing`
3. Click "Start Exploring" or "Go Unlimited"
4. Modal should open with checkout form
5. Use test card: `4242 4242 4242 4242`

### Test Checklist
- [ ] Modal opens when clicking pricing buttons
- [ ] Checkout form loads inside modal
- [ ] Can close modal with X button or Cancel
- [ ] Test card works in Whop test mode
- [ ] Redirects to success page after payment
- [ ] Webhook fires and saves subscription

## Customization

### Change Modal Size
Edit `whop-checkout-modal.tsx`:
```tsx
// Current: max-w-4xl max-h-[90vh]
className="relative w-full max-w-4xl max-h-[90vh] ..."

// Make larger:
className="relative w-full max-w-6xl max-h-[95vh] ..."
```

### Change iframe Height
```tsx
// Current: h-[600px]
<div className="w-full h-[600px] overflow-hidden">

// Make taller:
<div className="w-full h-[700px] overflow-hidden">
```

### Customize Colors
Match your brand by editing the modal colors:
```tsx
// Header/Footer background
className="... bg-[#f5f1eb]"

// Change to any color
className="... bg-gray-50"
```

## Troubleshooting

### Modal doesn't open
- Check console for errors
- Verify `NEXT_PUBLIC_WHOP_EXPLORER_PLAN_ID` is set
- Ensure plan IDs are valid

### Checkout form doesn't load
- Check Whop dashboard: Is embedded checkout enabled?
- Verify your domain is in allowed origins
- Check browser console for CORS errors

### Can't complete checkout
- Ensure test mode is enabled in Whop
- Use test card: `4242 4242 4242 4242`
- Check Whop dashboard logs for errors

### Success redirect not working
- Verify success_url is set correctly
- Check browser console for postMessage events
- Ensure origin verification is working

## Production Deployment

Before going live:

1. **Update allowed origins** in Whop dashboard to your production domain
2. **Switch to production mode** in Whop (disable test mode)
3. **Test full flow** with real card (then refund)
4. **Monitor webhooks** in Whop dashboard
5. **Set up error tracking** (Sentry, LogRocket, etc.)

## Benefits of Embedded Checkout

✅ **Better UX**: Users stay on your site
✅ **Higher conversion**: Less friction than redirects
✅ **Brand consistency**: Looks like part of your app
✅ **Mobile friendly**: Works great on all devices
✅ **Fast**: No page reload required

## Alternative: Redirect Checkout

If you prefer redirecting to Whop's hosted checkout page instead:

```typescript
// In pricing-section.tsx, replace handleCheckout with:
const handleCheckout = (tier: typeof PRICING_TIERS[0]) => {
  if (!tier.whopPlanId) {
    window.location.href = '/plan'
    return
  }

  const whopUrl = new URL('https://whop.com/checkout')
  whopUrl.searchParams.set('plan', tier.whopPlanId)
  whopUrl.searchParams.set('billing_period', isYearly ? 'year' : 'month')

  window.location.href = whopUrl.toString()
}
```

## Support

- Whop Embedded Checkout Docs: https://docs.whop.com/developer/guides/accept-payments
- Whop Discord: https://discord.gg/whop
- Need help? Check the main `WHOP_SETUP.md` guide
