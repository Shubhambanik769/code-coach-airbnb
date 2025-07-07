
-- Fix the foreign key constraint to reference profiles table instead of auth.users
-- since the application uses profiles table for user management

-- Drop the incorrect foreign key constraint
ALTER TABLE public.trainers DROP CONSTRAINT IF EXISTS trainers_user_id_fkey;
ALTER TABLE public.trainers DROP CONSTRAINT IF EXISTS fk_trainers_user_id;

-- Add the correct foreign key constraint to reference profiles table
ALTER TABLE public.trainers 
ADD CONSTRAINT fk_trainers_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
