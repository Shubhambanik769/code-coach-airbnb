
-- Add name column to trainers table and make it mandatory
ALTER TABLE public.trainers 
ADD COLUMN name TEXT;

-- Update existing trainers to have a name (using title as fallback initially)
UPDATE public.trainers 
SET name = title 
WHERE name IS NULL;

-- Make the name column NOT NULL after populating existing records
ALTER TABLE public.trainers 
ALTER COLUMN name SET NOT NULL;
