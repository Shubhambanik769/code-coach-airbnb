
-- First, let's check if there's an incorrect foreign key constraint on trainers table
-- and fix the trainers table structure to properly reference auth.users

-- Drop the problematic foreign key constraint if it exists
ALTER TABLE public.trainers DROP CONSTRAINT IF EXISTS fk_trainers_user_id;

-- Add the correct foreign key constraint to reference auth.users
ALTER TABLE public.trainers 
ADD CONSTRAINT trainers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ensure the trainers table has proper structure
-- Add any missing columns that might be needed
ALTER TABLE public.trainers 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN title SET NOT NULL;

-- Make sure the name column exists and is properly set
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trainers' 
                   AND column_name = 'name' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.trainers ADD COLUMN name TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
