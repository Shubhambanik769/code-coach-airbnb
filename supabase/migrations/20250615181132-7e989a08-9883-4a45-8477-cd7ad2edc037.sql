
-- Add missing foreign key constraints to establish proper relationships

-- Add foreign key for bookings.student_id to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_student_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_student_id_fkey 
        FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for bookings.trainer_id to trainers.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookings_trainer_id_fkey' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT bookings_trainer_id_fkey 
        FOREIGN KEY (trainer_id) REFERENCES public.trainers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key for trainers.user_id to profiles.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'trainers_user_id_fkey' 
        AND table_name = 'trainers'
    ) THEN
        ALTER TABLE public.trainers 
        ADD CONSTRAINT trainers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;
