export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          nationality: string | null
          passport_country: string | null
          preferred_currency: string
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_country?: string | null
          preferred_currency?: string
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          nationality?: string | null
          passport_country?: string | null
          preferred_currency?: string
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          travel_style: string[]
          interests: string[]
          accommodation_type: string[]
          budget_preference: string
          daily_budget_min: number | null
          daily_budget_max: number | null
          preferred_airlines: string[]
          seat_preference: string
          meal_preferences: string[]
          accessibility_needs: string[]
          avoid_countries: string[]
          favorite_destinations: string[]
          travel_frequency: string
          trip_duration_preference: string
          ai_suggestions_enabled: boolean
          notifications_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          travel_style?: string[]
          interests?: string[]
          accommodation_type?: string[]
          budget_preference?: string
          daily_budget_min?: number | null
          daily_budget_max?: number | null
          preferred_airlines?: string[]
          seat_preference?: string
          meal_preferences?: string[]
          accessibility_needs?: string[]
          avoid_countries?: string[]
          favorite_destinations?: string[]
          travel_frequency?: string
          trip_duration_preference?: string
          ai_suggestions_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          travel_style?: string[]
          interests?: string[]
          accommodation_type?: string[]
          budget_preference?: string
          daily_budget_min?: number | null
          daily_budget_max?: number | null
          preferred_airlines?: string[]
          seat_preference?: string
          meal_preferences?: string[]
          accessibility_needs?: string[]
          avoid_countries?: string[]
          favorite_destinations?: string[]
          travel_frequency?: string
          trip_duration_preference?: string
          ai_suggestions_enabled?: boolean
          notifications_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_image_url: string | null
          trip_type: string
          status: string
          start_date: string | null
          end_date: string | null
          total_budget: number | null
          spent_amount: number
          currency: string
          travelers_count: number
          travelers: Json
          travel_style: string | null
          interests: string[]
          is_public: boolean
          share_token: string | null
          notes: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_image_url?: string | null
          trip_type?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          total_budget?: number | null
          spent_amount?: number
          currency?: string
          travelers_count?: number
          travelers?: Json
          travel_style?: string | null
          interests?: string[]
          is_public?: boolean
          share_token?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_image_url?: string | null
          trip_type?: string
          status?: string
          start_date?: string | null
          end_date?: string | null
          total_budget?: number | null
          spent_amount?: number
          currency?: string
          travelers_count?: number
          travelers?: Json
          travel_style?: string | null
          interests?: string[]
          is_public?: boolean
          share_token?: string | null
          notes?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      trip_destinations: {
        Row: {
          id: string
          trip_id: string
          city: string
          country: string
          country_code: string | null
          latitude: number | null
          longitude: number | null
          arrival_date: string | null
          departure_date: string | null
          order_index: number
          accommodation_budget: number | null
          activities_budget: number | null
          food_budget: number | null
          transport_budget: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city: string
          country: string
          country_code?: string | null
          latitude?: number | null
          longitude?: number | null
          arrival_date?: string | null
          departure_date?: string | null
          order_index?: number
          accommodation_budget?: number | null
          activities_budget?: number | null
          food_budget?: number | null
          transport_budget?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          city?: string
          country?: string
          country_code?: string | null
          latitude?: number | null
          longitude?: number | null
          arrival_date?: string | null
          departure_date?: string | null
          order_index?: number
          accommodation_budget?: number | null
          activities_budget?: number | null
          food_budget?: number | null
          transport_budget?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      flights: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          flight_type: string
          airline: string | null
          flight_number: string | null
          departure_airport: string
          departure_city: string
          departure_country: string | null
          arrival_airport: string
          arrival_city: string
          arrival_country: string | null
          departure_datetime: string | null
          arrival_datetime: string | null
          duration_minutes: number | null
          stops: number
          layover_info: Json
          cabin_class: string
          price: number | null
          currency: string
          booking_reference: string | null
          booking_url: string | null
          booking_status: string
          seat_number: string | null
          baggage_info: Json | null
          meal_included: boolean
          external_id: string | null
          provider: string | null
          raw_data: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          flight_type?: string
          airline?: string | null
          flight_number?: string | null
          departure_airport: string
          departure_city: string
          departure_country?: string | null
          arrival_airport: string
          arrival_city: string
          arrival_country?: string | null
          departure_datetime?: string | null
          arrival_datetime?: string | null
          duration_minutes?: number | null
          stops?: number
          layover_info?: Json
          cabin_class?: string
          price?: number | null
          currency?: string
          booking_reference?: string | null
          booking_url?: string | null
          booking_status?: string
          seat_number?: string | null
          baggage_info?: Json | null
          meal_included?: boolean
          external_id?: string | null
          provider?: string | null
          raw_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          flight_type?: string
          airline?: string | null
          flight_number?: string | null
          departure_airport?: string
          departure_city?: string
          departure_country?: string | null
          arrival_airport?: string
          arrival_city?: string
          arrival_country?: string | null
          departure_datetime?: string | null
          arrival_datetime?: string | null
          duration_minutes?: number | null
          stops?: number
          layover_info?: Json
          cabin_class?: string
          price?: number | null
          currency?: string
          booking_reference?: string | null
          booking_url?: string | null
          booking_status?: string
          seat_number?: string | null
          baggage_info?: Json | null
          meal_included?: boolean
          external_id?: string | null
          provider?: string | null
          raw_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accommodations: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          name: string
          type: string
          address: string | null
          city: string
          country: string | null
          latitude: number | null
          longitude: number | null
          check_in_date: string | null
          check_in_time: string | null
          check_out_date: string | null
          check_out_time: string | null
          nights_count: number | null
          room_type: string | null
          room_count: number
          guests_count: number
          price_per_night: number | null
          total_price: number | null
          currency: string
          rating: number | null
          review_count: number | null
          amenities: string[]
          photos: string[]
          booking_reference: string | null
          booking_url: string | null
          booking_status: string
          cancellation_policy: string | null
          breakfast_included: boolean
          external_id: string | null
          provider: string | null
          raw_data: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          name: string
          type?: string
          address?: string | null
          city: string
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          check_in_date?: string | null
          check_in_time?: string | null
          check_out_date?: string | null
          check_out_time?: string | null
          nights_count?: number | null
          room_type?: string | null
          room_count?: number
          guests_count?: number
          price_per_night?: number | null
          total_price?: number | null
          currency?: string
          rating?: number | null
          review_count?: number | null
          amenities?: string[]
          photos?: string[]
          booking_reference?: string | null
          booking_url?: string | null
          booking_status?: string
          cancellation_policy?: string | null
          breakfast_included?: boolean
          external_id?: string | null
          provider?: string | null
          raw_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          name?: string
          type?: string
          address?: string | null
          city?: string
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          check_in_date?: string | null
          check_in_time?: string | null
          check_out_date?: string | null
          check_out_time?: string | null
          nights_count?: number | null
          room_type?: string | null
          room_count?: number
          guests_count?: number
          price_per_night?: number | null
          total_price?: number | null
          currency?: string
          rating?: number | null
          review_count?: number | null
          amenities?: string[]
          photos?: string[]
          booking_reference?: string | null
          booking_url?: string | null
          booking_status?: string
          cancellation_policy?: string | null
          breakfast_included?: boolean
          external_id?: string | null
          provider?: string | null
          raw_data?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      itinerary_items: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          date: string
          time_slot: string | null
          start_time: string | null
          end_time: string | null
          title: string
          description: string | null
          category: string
          location_name: string | null
          location_address: string | null
          latitude: number | null
          longitude: number | null
          estimated_cost: number | null
          actual_cost: number | null
          currency: string
          booking_required: boolean
          booking_url: string | null
          booking_reference: string | null
          is_booked: boolean
          priority: string
          status: string
          rating: number | null
          photos: string[]
          tips: string | null
          order_index: number
          linked_flight_id: string | null
          linked_accommodation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          date: string
          time_slot?: string | null
          start_time?: string | null
          end_time?: string | null
          title: string
          description?: string | null
          category?: string
          location_name?: string | null
          location_address?: string | null
          latitude?: number | null
          longitude?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          currency?: string
          booking_required?: boolean
          booking_url?: string | null
          booking_reference?: string | null
          is_booked?: boolean
          priority?: string
          status?: string
          rating?: number | null
          photos?: string[]
          tips?: string | null
          order_index?: number
          linked_flight_id?: string | null
          linked_accommodation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          date?: string
          time_slot?: string | null
          start_time?: string | null
          end_time?: string | null
          title?: string
          description?: string | null
          category?: string
          location_name?: string | null
          location_address?: string | null
          latitude?: number | null
          longitude?: number | null
          estimated_cost?: number | null
          actual_cost?: number | null
          currency?: string
          booking_required?: boolean
          booking_url?: string | null
          booking_reference?: string | null
          is_booked?: boolean
          priority?: string
          status?: string
          rating?: number | null
          photos?: string[]
          tips?: string | null
          order_index?: number
          linked_flight_id?: string | null
          linked_accommodation_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_places: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          destination_id: string | null
          name: string
          description: string | null
          category: string | null
          address: string | null
          city: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          rating: number | null
          review_count: number | null
          price_level: string | null
          opening_hours: Json | null
          phone: string | null
          website: string | null
          photos: string[]
          tags: string[]
          external_id: string | null
          provider: string | null
          is_visited: boolean
          personal_rating: number | null
          personal_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          destination_id?: string | null
          name: string
          description?: string | null
          category?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          review_count?: number | null
          price_level?: string | null
          opening_hours?: Json | null
          phone?: string | null
          website?: string | null
          photos?: string[]
          tags?: string[]
          external_id?: string | null
          provider?: string | null
          is_visited?: boolean
          personal_rating?: number | null
          personal_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          destination_id?: string | null
          name?: string
          description?: string | null
          category?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          review_count?: number | null
          price_level?: string | null
          opening_hours?: Json | null
          phone?: string | null
          website?: string | null
          photos?: string[]
          tags?: string[]
          external_id?: string | null
          provider?: string | null
          is_visited?: boolean
          personal_rating?: number | null
          personal_notes?: string | null
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          destination_id: string | null
          itinerary_item_id: string | null
          category: string
          description: string
          amount: number
          currency: string
          amount_in_base_currency: number | null
          exchange_rate: number | null
          date: string | null
          payment_method: string | null
          receipt_url: string | null
          is_reimbursable: boolean
          is_shared: boolean
          shared_with: Json
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          destination_id?: string | null
          itinerary_item_id?: string | null
          category: string
          description: string
          amount: number
          currency?: string
          amount_in_base_currency?: number | null
          exchange_rate?: number | null
          date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          is_reimbursable?: boolean
          is_shared?: boolean
          shared_with?: Json
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          destination_id?: string | null
          itinerary_item_id?: string | null
          category?: string
          description?: string
          amount?: number
          currency?: string
          amount_in_base_currency?: number | null
          exchange_rate?: number | null
          date?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          is_reimbursable?: boolean
          is_shared?: boolean
          shared_with?: Json
          notes?: string | null
          created_at?: string
        }
      }
      trip_albums: {
        Row: {
          id: string
          trip_id: string
          name: string
          description: string | null
          cover_photo_url: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          name: string
          description?: string | null
          cover_photo_url?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          name?: string
          description?: string | null
          cover_photo_url?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      album_photos: {
        Row: {
          id: string
          album_id: string
          trip_id: string
          destination_id: string | null
          itinerary_item_id: string | null
          url: string
          thumbnail_url: string | null
          caption: string | null
          location_name: string | null
          latitude: number | null
          longitude: number | null
          taken_at: string | null
          order_index: number
          is_favorite: boolean
          is_cover: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          trip_id: string
          destination_id?: string | null
          itinerary_item_id?: string | null
          url: string
          thumbnail_url?: string | null
          caption?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          taken_at?: string | null
          order_index?: number
          is_favorite?: boolean
          is_cover?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          trip_id?: string
          destination_id?: string | null
          itinerary_item_id?: string | null
          url?: string
          thumbnail_url?: string | null
          caption?: string | null
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          taken_at?: string | null
          order_index?: number
          is_favorite?: boolean
          is_cover?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          title: string | null
          context_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          title?: string | null
          context_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          title?: string | null
          context_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          metadata: Json | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          metadata?: Json | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          metadata?: Json | null
          tokens_used?: number | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          trip_id: string | null
          type: string
          title: string
          message: string
          action_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trip_id?: string | null
          type: string
          title: string
          message: string
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trip_id?: string | null
          type?: string
          title?: string
          message?: string
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          source: string
          created_at: string
          subscribed: boolean
        }
        Insert: {
          id?: string
          email: string
          source?: string
          created_at?: string
          subscribed?: boolean
        }
        Update: {
          id?: string
          email?: string
          source?: string
          created_at?: string
          subscribed?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type UserPreferences = Tables<'user_preferences'>
export type Trip = Tables<'trips'>
export type TripDestination = Tables<'trip_destinations'>
export type Flight = Tables<'flights'>
export type Accommodation = Tables<'accommodations'>
export type ItineraryItem = Tables<'itinerary_items'>
export type SavedPlace = Tables<'saved_places'>
export type Expense = Tables<'expenses'>
export type TripAlbum = Tables<'trip_albums'>
export type AlbumPhoto = Tables<'album_photos'>
export type AIConversation = Tables<'ai_conversations'>
export type AIMessage = Tables<'ai_messages'>
export type Notification = Tables<'notifications'>
export type Waitlist = Tables<'waitlist'>
