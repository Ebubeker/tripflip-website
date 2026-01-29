# Whop Subscription Testing Guide

## Quick Testing Steps

### 1. Enable Test Mode in Whop

1. Go to [Whop Dashboard](https://dash.whop.com)
2. Look for **Test Mode** toggle (usually in top right corner)
3. Turn it **ON** (you'll see a banner saying "Test Mode Active")
4. All transactions will now be test transactions

### 2. Test Card Numbers

Use these test cards in Whop checkout:

**Success - Card Payment**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Success - With 3D Secure**
```
Card Number: 4000 0027 6000 3184
Expiry: Any future date
CVC: Any 3 digits
```

**Decline - Insufficient Funds**
```
Card Number: 4000 0000 0000 9995
```

**Decline - Stolen Card**
```
Card Number: 4000 0000 0000 9979
```

### 3. Run Your App Locally

```bash
# Start your dev server
npm run dev

# In another terminal, expose with ngrok (for webhooks)
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
```

### 4. Setup Webhook for Testing

1. Go to Whop Dashboard → Settings → Webhooks
2. Add your ngrok URL: `https://abc123.ngrok.io/api/webhooks/whop`
3. Select events:
   - ✅ `payment.succeeded`
   - ✅ `membership.deleted`
   - ✅ `membership.cancelled`
4. Save webhook

### 5. Test the Checkout Flow

**Step-by-step:**

1. **Open Pricing Page**
   - Go to `http://localhost:3000/#pricing`

2. **Click a Plan**
   - Click "Start Exploring" or "Go Unlimited"
   - Modal should open with checkout form

3. **Fill Checkout Form**
   ```
   Email: test@example.com
   Card: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   Name: Test User
   Country: United States
   Address: 123 Main St
   ZIP: 12345
   ```

4. **Submit Payment**
   - Click "Join" button
   - Wait for processing (should be quick in test mode)

5. **Verify Redirect**
   - Should redirect to `/dashboard?payment=success`

### 6. Verify Everything Worked

**Check Terminal Logs**
```bash
# You should see in your terminal:
✓ Payment succeeded webhook: { ... }
✓ Subscription activated for user: test@example.com
```

**Check Whop Dashboard**
1. Go to Whop Dashboard → Memberships
2. You should see the test membership
3. Check Webhooks → Logs to see webhook deliveries

**Check Database**
```sql
-- In Supabase SQL Editor:

-- If user exists in profiles table:
SELECT * FROM subscriptions WHERE whop_user_id LIKE '%';

-- If user doesn't exist yet:
SELECT * FROM pending_subscriptions WHERE email = 'test@example.com';
```

**Check Webhook Endpoint**
```bash
# In your terminal running the app, you should see:
POST /api/webhooks/whop 200 in XXXms
```

## Testing Different Scenarios

### Scenario 1: New User (No Account)

**Flow:**
1. Complete checkout with `newuser@example.com`
2. Check `pending_subscriptions` table - should have entry
3. User signs up with `newuser@example.com`
4. On signup, subscription moves to `subscriptions` table

**Verify:**
```sql
-- Before signup:
SELECT * FROM pending_subscriptions WHERE email = 'newuser@example.com';

-- After signup:
SELECT * FROM subscriptions WHERE user_id = 'user_id_here';
```

### Scenario 2: Existing User

**Flow:**
1. Sign up user first at `/register`
2. Complete checkout with same email
3. Check `subscriptions` table - should have entry immediately

**Verify:**
```sql
SELECT s.*, p.email
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
WHERE p.email = 'existing@example.com';
```

### Scenario 3: Subscription Cancellation

**Flow:**
1. Go to Whop Dashboard → Memberships
2. Find test membership
3. Click "Cancel"
4. Webhook should fire

**Verify:**
```sql
SELECT * FROM subscriptions
WHERE status = 'canceled' AND valid = false;
```

## Testing Monthly vs Yearly Plans

### Test Monthly Plan
```bash
# 1. Select "Monthly" toggle in pricing
# 2. Click plan button
# 3. Verify price shows $8/month (Explorer) or $20/month (Wanderer)
# 4. Complete checkout
# 5. Check subscription:
SELECT plan_id FROM subscriptions ORDER BY created_at DESC LIMIT 1;
# Should show your monthly plan ID
```

### Test Yearly Plan
```bash
# 1. Select "Yearly" toggle in pricing
# 2. Click plan button
# 3. Verify price shows $76.80/year (Explorer) or $192/year (Wanderer)
# 4. Complete checkout
# 5. Check subscription:
SELECT plan_id FROM subscriptions ORDER BY created_at DESC LIMIT 1;
# Should show your yearly plan ID
```

## Common Issues & Solutions

### Issue: Modal doesn't open
**Solution:**
- Check browser console for errors
- Verify plan IDs are set in `.env.local`
- Make sure they start with `NEXT_PUBLIC_`

### Issue: Checkout session fails to create
**Solution:**
- Check server logs: `npm run dev`
- Verify `WHOP_API_KEY` is set correctly
- Test API key in Whop dashboard
- Check you're using test mode API key

### Issue: Webhook not received
**Solution:**
```bash
# 1. Check ngrok is running
ngrok http 3000

# 2. Verify webhook URL in Whop dashboard
# Should be: https://your-ngrok-url.ngrok.io/api/webhooks/whop

# 3. Check Whop Dashboard → Webhooks → Logs
# Look for delivery attempts and errors

# 4. Test webhook manually:
curl -X POST http://localhost:3000/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -d '{"type":"payment.succeeded","data":{"user":{"email":"test@example.com"}}}'
```

### Issue: Subscription not in database
**Solution:**
- Check webhook logs in terminal
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check migrations were run: `npx supabase db push`
- Look for errors in webhook handler

### Issue: Test card declined
**Solution:**
- Make sure Test Mode is ON in Whop dashboard
- Use exact card number: `4242 4242 4242 4242`
- Try different expiry date (must be future)
- Check Whop status page for issues

## Cleanup Test Data

**After testing, clean up:**

```sql
-- Delete test subscriptions
DELETE FROM subscriptions WHERE whop_user_id LIKE '%test%';

-- Delete test pending subscriptions
DELETE FROM pending_subscriptions WHERE email LIKE '%test%';
```

**In Whop Dashboard:**
1. Go to Memberships
2. Find test memberships
3. Cancel them individually

## Production Testing Checklist

Before going live:

- [ ] Switch Whop to Production Mode
- [ ] Test with real card (small amount)
- [ ] Immediately refund test transaction
- [ ] Update webhook URL to production domain
- [ ] Remove ngrok webhook endpoint
- [ ] Verify production webhooks work
- [ ] Test full flow: checkout → webhook → database
- [ ] Test cancellation flow
- [ ] Monitor first few real transactions

## Testing Tools

### Whop Dashboard
- **Memberships**: View all test subscriptions
- **Webhooks → Logs**: See webhook deliveries
- **Developer**: Check API key, test mode status

### Supabase Dashboard
- **Table Editor**: View subscriptions and pending_subscriptions
- **SQL Editor**: Run custom queries
- **Database → Webhooks**: Monitor database webhooks

### Browser DevTools
- **Console**: Check for JavaScript errors
- **Network**: See API calls to `/api/checkout/create-session`
- **Application → Storage**: Check cookies/localStorage

### Terminal
- **npm run dev**: Server logs
- **ngrok http 3000**: Expose localhost
- **tail -f**: Follow webhook logs

## Quick Test Command

Run this complete test:

```bash
# 1. Start app
npm run dev

# 2. Open in browser
open http://localhost:3000/#pricing

# 3. Click plan → Use test card 4242 4242 4242 4242

# 4. Check subscription created:
psql $DATABASE_URL -c "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;"

# 5. If no direct DB access, check Supabase dashboard
```

## Support

- Whop Test Mode: https://docs.whop.com/developer/test-mode
- Test Cards: https://docs.whop.com/developer/testing
- Webhooks: https://docs.whop.com/webhooks
- Discord: https://discord.gg/whop
