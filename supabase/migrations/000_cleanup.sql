-- TripFlip Database Cleanup
-- Migration: 000_cleanup
-- Description: Drops all existing objects before fresh install
-- Run this BEFORE 001_initial_schema.sql

-- ============================================
-- DROP TABLES FIRST (CASCADE removes policies automatically)
-- ============================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.album_photos CASCADE;
DROP TABLE IF EXISTS public.trip_albums CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.saved_places CASCADE;
DROP TABLE IF EXISTS public.itinerary_items CASCADE;
DROP TABLE IF EXISTS public.accommodations CASCADE;
DROP TABLE IF EXISTS public.flights CASCADE;
DROP TABLE IF EXISTS public.trip_destinations CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- DROP TRIGGER ON auth.users (wrapped in DO block)
-- ============================================
DO $$
BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
    WHEN undefined_object THEN
        NULL;
END $$;

-- ============================================
-- DROP FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_trip_spent() CASCADE;
DROP FUNCTION IF EXISTS public.generate_share_token() CASCADE;

-- ============================================
-- CLEANUP COMPLETE
-- ============================================
-- Now you can run 001_initial_schema.sql
