-- Add planning_status column to trips table for tracking automation progress
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS planning_status TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN trips.planning_status IS 'JSON string tracking the status of automated trip planning steps';
