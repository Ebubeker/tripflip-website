-- Waitlist signups table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscribed BOOLEAN DEFAULT true
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);

-- RLS policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Allow anonymous waitlist signups" ON waitlist;
DROP POLICY IF EXISTS "Allow public waitlist signups" ON waitlist;
DROP POLICY IF EXISTS "Service role can manage waitlist" ON waitlist;

-- Allow anyone (including anonymous) to insert into waitlist
-- Using 'public' role which includes both anon and authenticated
CREATE POLICY "Allow public waitlist signups"
  ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow service role full access for admin operations
CREATE POLICY "Service role can manage waitlist"
  ON waitlist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant insert permission explicitly to anon role
GRANT INSERT ON waitlist TO anon;
GRANT INSERT ON waitlist TO authenticated;

COMMENT ON TABLE waitlist IS 'Email signups for the waitlist/newsletter';
COMMENT ON COLUMN waitlist.source IS 'Where the signup originated from';
COMMENT ON COLUMN waitlist.subscribed IS 'Whether the user is still subscribed';
