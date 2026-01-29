-- TripFlip Database Schema
-- Migration: 001_initial_schema
-- Description: Creates all tables, indexes, RLS policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    date_of_birth DATE,
    nationality TEXT,
    passport_country TEXT,
    preferred_currency TEXT DEFAULT 'USD',
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';

-- ============================================
-- TABLE: user_preferences
-- ============================================
CREATE TABLE public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    travel_style TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    accommodation_type TEXT[] DEFAULT '{}',
    budget_preference TEXT DEFAULT 'moderate',
    daily_budget_min DECIMAL(10,2),
    daily_budget_max DECIMAL(10,2),
    preferred_airlines TEXT[] DEFAULT '{}',
    seat_preference TEXT DEFAULT 'any',
    meal_preferences TEXT[] DEFAULT '{}',
    accessibility_needs TEXT[] DEFAULT '{}',
    avoid_countries TEXT[] DEFAULT '{}',
    favorite_destinations TEXT[] DEFAULT '{}',
    travel_frequency TEXT DEFAULT 'occasionally',
    trip_duration_preference TEXT DEFAULT 'week',
    ai_suggestions_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'User travel preferences for personalization';

-- ============================================
-- TABLE: trips
-- ============================================
CREATE TABLE public.trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    trip_type TEXT DEFAULT 'leisure' CHECK (trip_type IN ('leisure', 'business', 'adventure', 'honeymoon', 'family', 'solo')),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'booked', 'ongoing', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    total_budget DECIMAL(12,2),
    spent_amount DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    travelers_count INTEGER DEFAULT 1,
    travelers JSONB DEFAULT '[]',
    is_public BOOLEAN DEFAULT false,
    share_token TEXT UNIQUE,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trips IS 'Main trips table supporting multi-destination trips';

-- ============================================
-- TABLE: trip_destinations
-- ============================================
CREATE TABLE public.trip_destinations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    arrival_date DATE,
    departure_date DATE,
    order_index INTEGER DEFAULT 0,
    accommodation_budget DECIMAL(10,2),
    activities_budget DECIMAL(10,2),
    food_budget DECIMAL(10,2),
    transport_budget DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trip_destinations IS 'Destinations within a trip for multi-city support';

-- ============================================
-- TABLE: flights
-- ============================================
CREATE TABLE public.flights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    flight_type TEXT DEFAULT 'outbound' CHECK (flight_type IN ('outbound', 'return', 'internal')),
    airline TEXT,
    flight_number TEXT,
    departure_airport TEXT NOT NULL,
    departure_city TEXT NOT NULL,
    departure_country TEXT,
    arrival_airport TEXT NOT NULL,
    arrival_city TEXT NOT NULL,
    arrival_country TEXT,
    departure_datetime TIMESTAMPTZ,
    arrival_datetime TIMESTAMPTZ,
    duration_minutes INTEGER,
    stops INTEGER DEFAULT 0,
    layover_info JSONB DEFAULT '[]',
    cabin_class TEXT DEFAULT 'economy' CHECK (cabin_class IN ('economy', 'premium_economy', 'business', 'first')),
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    booking_reference TEXT,
    booking_url TEXT,
    booking_status TEXT DEFAULT 'saved' CHECK (booking_status IN ('saved', 'booked', 'cancelled', 'completed')),
    seat_number TEXT,
    baggage_info JSONB,
    meal_included BOOLEAN DEFAULT false,
    external_id TEXT,
    provider TEXT,
    raw_data JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.flights IS 'Flight bookings and saved flights';

-- ============================================
-- TABLE: accommodations
-- ============================================
CREATE TABLE public.accommodations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'hotel' CHECK (type IN ('hotel', 'hostel', 'apartment', 'resort', 'villa', 'guesthouse', 'airbnb')),
    address TEXT,
    city TEXT NOT NULL,
    country TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    check_in_date DATE,
    check_in_time TIME,
    check_out_date DATE,
    check_out_time TIME,
    nights_count INTEGER,
    room_type TEXT,
    room_count INTEGER DEFAULT 1,
    guests_count INTEGER DEFAULT 1,
    price_per_night DECIMAL(10,2),
    total_price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    rating DECIMAL(3,2),
    review_count INTEGER,
    amenities TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    booking_reference TEXT,
    booking_url TEXT,
    booking_status TEXT DEFAULT 'saved' CHECK (booking_status IN ('saved', 'booked', 'cancelled', 'completed')),
    cancellation_policy TEXT,
    breakfast_included BOOLEAN DEFAULT false,
    external_id TEXT,
    provider TEXT,
    raw_data JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.accommodations IS 'Hotel and accommodation bookings';

-- ============================================
-- TABLE: itinerary_items
-- ============================================
CREATE TABLE public.itinerary_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time_slot TEXT,
    start_time TIME,
    end_time TIME,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'activity' CHECK (category IN ('activity', 'transport', 'meal', 'accommodation', 'flight', 'rest', 'other')),
    location_name TEXT,
    location_address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    booking_required BOOLEAN DEFAULT false,
    booking_url TEXT,
    booking_reference TEXT,
    is_booked BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('must-do', 'high', 'medium', 'low', 'optional')),
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'confirmed', 'completed', 'skipped', 'cancelled')),
    rating DECIMAL(3,2),
    photos TEXT[] DEFAULT '{}',
    tips TEXT,
    order_index INTEGER DEFAULT 0,
    linked_flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL,
    linked_accommodation_id UUID REFERENCES public.accommodations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.itinerary_items IS 'Day-by-day itinerary activities';

-- ============================================
-- TABLE: saved_places
-- ============================================
CREATE TABLE public.saved_places (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    rating DECIMAL(3,2),
    review_count INTEGER,
    price_level TEXT CHECK (price_level IN ('free', 'cheap', 'moderate', 'expensive', 'very_expensive')),
    opening_hours JSONB,
    phone TEXT,
    website TEXT,
    photos TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    external_id TEXT,
    provider TEXT,
    is_visited BOOLEAN DEFAULT false,
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
    personal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.saved_places IS 'User saved places and points of interest';

-- ============================================
-- TABLE: expenses
-- ============================================
CREATE TABLE public.expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    itinerary_item_id UUID REFERENCES public.itinerary_items(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('flight', 'accommodation', 'food', 'transport', 'activity', 'shopping', 'other')),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    amount_in_base_currency DECIMAL(10,2),
    exchange_rate DECIMAL(10,6),
    date DATE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'travel_card', 'other')),
    receipt_url TEXT,
    is_reimbursable BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    shared_with JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.expenses IS 'Trip expense tracking';

-- ============================================
-- TABLE: trip_albums
-- ============================================
CREATE TABLE public.trip_albums (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_photo_url TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trip_albums IS 'Photo albums for trips';

-- ============================================
-- TABLE: album_photos
-- ============================================
CREATE TABLE public.album_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    album_id UUID REFERENCES public.trip_albums(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.trip_destinations(id) ON DELETE SET NULL,
    itinerary_item_id UUID REFERENCES public.itinerary_items(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    location_name TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    taken_at TIMESTAMPTZ,
    order_index INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    is_cover BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.album_photos IS 'Photos within trip albums';

-- ============================================
-- TABLE: ai_conversations
-- ============================================
CREATE TABLE public.ai_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    title TEXT,
    context_type TEXT DEFAULT 'general' CHECK (context_type IN ('general', 'trip_planning', 'itinerary', 'budget', 'destination')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ai_conversations IS 'AI assistant conversation threads';

-- ============================================
-- TABLE: ai_messages
-- ============================================
CREATE TABLE public.ai_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ai_messages IS 'Messages within AI conversations';

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('trip_reminder', 'price_alert', 'booking_confirmation', 'ai_suggestion', 'share_invite', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'User notifications';

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_email ON public.profiles(email);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trips_dates ON public.trips(start_date, end_date);
CREATE INDEX idx_trips_share_token ON public.trips(share_token);

CREATE INDEX idx_trip_destinations_trip_id ON public.trip_destinations(trip_id);
CREATE INDEX idx_trip_destinations_order ON public.trip_destinations(trip_id, order_index);

CREATE INDEX idx_flights_trip_id ON public.flights(trip_id);
CREATE INDEX idx_flights_destination_id ON public.flights(destination_id);
CREATE INDEX idx_flights_dates ON public.flights(departure_datetime);

CREATE INDEX idx_accommodations_trip_id ON public.accommodations(trip_id);
CREATE INDEX idx_accommodations_destination_id ON public.accommodations(destination_id);
CREATE INDEX idx_accommodations_dates ON public.accommodations(check_in_date, check_out_date);

CREATE INDEX idx_itinerary_items_trip_id ON public.itinerary_items(trip_id);
CREATE INDEX idx_itinerary_items_date ON public.itinerary_items(date);
CREATE INDEX idx_itinerary_items_destination ON public.itinerary_items(destination_id);

CREATE INDEX idx_saved_places_user_id ON public.saved_places(user_id);
CREATE INDEX idx_saved_places_trip_id ON public.saved_places(trip_id);

CREATE INDEX idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_date ON public.expenses(date);

CREATE INDEX idx_trip_albums_trip_id ON public.trip_albums(trip_id);

CREATE INDEX idx_album_photos_album_id ON public.album_photos(album_id);
CREATE INDEX idx_album_photos_trip_id ON public.album_photos(trip_id);

CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_trip_id ON public.ai_conversations(trip_id);

CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Trips policies
CREATE POLICY "Users can view own trips"
    ON public.trips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view public trips"
    ON public.trips FOR SELECT
    USING (is_public = true);

CREATE POLICY "Users can insert own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
    ON public.trips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
    ON public.trips FOR DELETE
    USING (auth.uid() = user_id);

-- Trip destinations policies
CREATE POLICY "Users can manage trip destinations"
    ON public.trip_destinations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = trip_destinations.trip_id
        AND trips.user_id = auth.uid()
    ));

CREATE POLICY "Public trip destinations are viewable"
    ON public.trip_destinations FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = trip_destinations.trip_id
        AND trips.is_public = true
    ));

-- Flights policies
CREATE POLICY "Users can manage flights"
    ON public.flights FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = flights.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Accommodations policies
CREATE POLICY "Users can manage accommodations"
    ON public.accommodations FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = accommodations.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Itinerary items policies
CREATE POLICY "Users can manage itinerary"
    ON public.itinerary_items FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = itinerary_items.trip_id
        AND trips.user_id = auth.uid()
    ));

CREATE POLICY "Public itinerary is viewable"
    ON public.itinerary_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = itinerary_items.trip_id
        AND trips.is_public = true
    ));

-- Saved places policies
CREATE POLICY "Users can manage saved places"
    ON public.saved_places FOR ALL
    USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can manage expenses"
    ON public.expenses FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    ));

-- Trip albums policies
CREATE POLICY "Users can manage albums"
    ON public.trip_albums FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = trip_albums.trip_id
        AND trips.user_id = auth.uid()
    ));

CREATE POLICY "Public albums are viewable"
    ON public.trip_albums FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = trip_albums.trip_id
        AND trips.is_public = true
    ));

-- Album photos policies
CREATE POLICY "Users can manage photos"
    ON public.album_photos FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = album_photos.trip_id
        AND trips.user_id = auth.uid()
    ));

CREATE POLICY "Public photos are viewable"
    ON public.album_photos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.trips
        WHERE trips.id = album_photos.trip_id
        AND trips.is_public = true
    ));

-- AI conversations policies
CREATE POLICY "Users can manage conversations"
    ON public.ai_conversations FOR ALL
    USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can manage messages"
    ON public.ai_messages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.ai_conversations
        WHERE ai_conversations.id = ai_messages.conversation_id
        AND ai_conversations.user_id = auth.uid()
    ));

-- Notifications policies
CREATE POLICY "Users can manage notifications"
    ON public.notifications FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_flights_updated_at
    BEFORE UPDATE ON public.flights
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_accommodations_updated_at
    BEFORE UPDATE ON public.accommodations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_itinerary_items_updated_at
    BEFORE UPDATE ON public.itinerary_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to update trip spent amount
CREATE OR REPLACE FUNCTION public.update_trip_spent()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.trips
    SET spent_amount = (
        SELECT COALESCE(SUM(
            CASE
                WHEN amount_in_base_currency IS NOT NULL THEN amount_in_base_currency
                ELSE amount
            END
        ), 0)
        FROM public.expenses
        WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id)
    )
    WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for expense changes
CREATE TRIGGER on_expense_change
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_trip_spent();

-- Function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_public = true AND NEW.share_token IS NULL THEN
        NEW.share_token := encode(gen_random_bytes(16), 'hex');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for share token generation
CREATE TRIGGER before_trip_update_share_token
    BEFORE INSERT OR UPDATE ON public.trips
    FOR EACH ROW EXECUTE FUNCTION public.generate_share_token();

-- ============================================
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ============================================
-- Note: Execute these in the Supabase SQL editor or dashboard
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('trip-photos', 'trip-photos', true);
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('receipts', 'receipts', false);
