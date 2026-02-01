# Webhook Troubleshooting Guide

## Problem: Email not being saved to pending_subscriptions

The webhook handler has been enhanced with detailed logging to help diagnose the issue.

## Step 1: Check if Webhook is Being Called

### View Live Logs
1. Start the dev server: `npm run dev`
2. Look for these log messages when a payment is made:
   ```
   === WHOP WEBHOOK RECEIVED ===
   Timestamp: ...
   ✓ Webhook signature verified
   Webhook type: payment.succeeded
   ```

If you **DON'T** see these messages, the webhook isn't reaching your server.

### Solutions if webhook not received:
1. **For local development**: You MUST use ngrok
   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   ngrok http 3000
   ```
   Then update Whop webhook URL to: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/whop`

2. **Check Whop Dashboard**:
   - Go to Settings → Webhooks
   - Click on your webhook endpoint
   - Check "Recent Deliveries" or "Logs"
   - Look for errors (401, 404, 500, etc.)

## Step 2: Check Email Extraction

Look for this log section:
```
Extracted data:
- Email: [should show email here]
- Plan ID: ...
- Plan Name: ...
```

### If Email shows `undefined`:
The webhook payload structure is different than expected. Check the full payload:
```
Full payment object: { ... }
```

Common locations for email in Whop webhooks:
- `payment.user.email` (most common)
- `payment.email`
- `payment.metadata.email`
- `payment.customer.email`
- `payment.billing_details.email`

## Step 3: Check Database Save

Look for these log messages:
```
Checking if user exists in profiles table...
Profile found: No
Saving to pending_subscriptions table...
Data to insert: { ... }
✓ Payment saved to pending_subscriptions: [email]
```

### If you see an ERROR message:
```
✗ ERROR saving to pending_subscriptions: [error details]
```

Common errors and solutions:

#### Error: "relation 'pending_subscriptions' does not exist"
**Solution**: Run the migration
```bash
# In Supabase SQL Editor, run:
supabase/migrations/20240128_add_subscriptions.sql

# Or via CLI:
npx supabase db push
```

#### Error: "permission denied for table pending_subscriptions"
**Solution**: Check RLS policies in Supabase
1. Go to Supabase Dashboard → Authentication → Policies
2. Ensure service role has access to pending_subscriptions
3. Or temporarily disable RLS:
   ```sql
   ALTER TABLE pending_subscriptions DISABLE ROW LEVEL SECURITY;
   ```

#### Error: "duplicate key value violates unique constraint"
**Solution**: Email already exists in pending_subscriptions
```sql
-- Check existing entry
SELECT * FROM pending_subscriptions WHERE email = '[the-email]';

-- Delete if needed
DELETE FROM pending_subscriptions WHERE email = '[the-email]';
```

#### Error: "null value in column violates not-null constraint"
**Solution**: Missing required field
- Check which field is null in the logs
- The webhook might not be providing all expected data

## Step 4: Manual Webhook Test

Test the webhook handler directly to verify it works:

```bash
curl -X POST http://localhost:3000/api/webhooks/whop \
  -H "Content-Type: application/json" \
  -H "X-Whop-Signature: test" \
  -d '{
    "type": "payment.succeeded",
    "data": {
      "id": "pay_test_123",
      "user": {
        "id": "user_test_123",
        "email": "test@example.com"
      },
      "plan_id": "plan_test_123",
      "metadata": {
        "plan_name": "Test Plan"
      }
    }
  }'
```

**Note**: This will fail signature verification, but you'll see the error in logs.

## Step 5: Check Whop Webhook Payload Structure

Whop might send data in a different structure. Common variations:

### Variation 1: Nested user object
```json
{
  "type": "payment.succeeded",
  "data": {
    "user": {
      "email": "user@example.com"
    }
  }
}
```

### Variation 2: Direct email field
```json
{
  "type": "payment.succeeded",
  "data": {
    "email": "user@example.com"
  }
}
```

### Variation 3: Customer object
```json
{
  "type": "payment.succeeded",
  "data": {
    "customer": {
      "email": "user@example.com"
    }
  }
}
```

## Step 6: Verify Table Exists

```sql
-- In Supabase SQL Editor
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'pending_subscriptions'
);

-- Should return: true
```

If it returns `false`, run the migration:
```sql
-- Run the contents of supabase/migrations/20240128_add_subscriptions.sql
```

## Step 7: Check Supabase Service Role Key

Verify your `.env.local` has the correct service role key:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Test it works:
```bash
# In Supabase Dashboard → Settings → API
# Copy the service_role key (NOT anon key)
# Paste into .env.local
```

## Common Webhook Event Types

Whop sends different event types:
- `payment.succeeded` - New payment completed
- `payment.updated` - Payment info updated
- `membership.created` - Membership created
- `membership.deleted` - Membership deleted
- `membership.cancelled` - Membership cancelled

Make sure Whop is sending `payment.succeeded` events.

## Quick Checklist

When a payment is made, check:
- [ ] Webhook received (see logs: "=== WHOP WEBHOOK RECEIVED ===")
- [ ] Signature verified (see logs: "✓ Webhook signature verified")
- [ ] Event type is payment.succeeded
- [ ] Email extracted successfully (not undefined)
- [ ] Profile check completed
- [ ] Data inserted into pending_subscriptions
- [ ] No error messages in logs

## Still Having Issues?

1. **Check the full webhook logs** - they now show complete payload
2. **Verify Whop webhook configuration**:
   - URL is correct
   - Events include `payment.succeeded`
   - Webhook is enabled
3. **Check Whop webhook delivery logs** in Whop Dashboard
4. **Test with Whop's test mode** and test card: 4242 4242 4242 4242

## Contact Support

If webhook is received but email is undefined:
1. Copy the "Full payment object" from logs
2. Share it (remove sensitive data)
3. We can update the email extraction logic to match Whop's actual structure
