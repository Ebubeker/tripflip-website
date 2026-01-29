-- Add travel_style and interests columns to trips table
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS travel_style TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN trips.travel_style IS 'Travel pace preference: relaxed, moderate, or active';
COMMENT ON COLUMN trips.interests IS 'Array of travel interests: culture, food, nature, adventure, etc.';
