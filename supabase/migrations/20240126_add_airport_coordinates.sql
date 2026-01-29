-- Add airport coordinates columns to flights table
-- This allows displaying airport markers on the trip map

ALTER TABLE public.flights
ADD COLUMN IF NOT EXISTS departure_latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS departure_longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS arrival_latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS arrival_longitude DECIMAL(11,8);

COMMENT ON COLUMN public.flights.departure_latitude IS 'Departure airport latitude';
COMMENT ON COLUMN public.flights.departure_longitude IS 'Departure airport longitude';
COMMENT ON COLUMN public.flights.arrival_latitude IS 'Arrival airport latitude';
COMMENT ON COLUMN public.flights.arrival_longitude IS 'Arrival airport longitude';
