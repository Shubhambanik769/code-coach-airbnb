
-- Add foreign key constraint to link trainers to profiles
ALTER TABLE public.trainers 
ADD CONSTRAINT fk_trainers_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint to link reviews to profiles for student_id
ALTER TABLE public.reviews 
ADD CONSTRAINT fk_reviews_student_id 
FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
