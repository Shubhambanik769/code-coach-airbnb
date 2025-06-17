
-- Enable public read access for trainer profiles
-- This allows anyone (authenticated or not) to view trainer profile information

-- First, let's create a policy for public read access to profiles for trainers
CREATE POLICY "Public read access for trainer profiles" ON public.profiles
FOR SELECT 
USING (
  id IN (
    SELECT user_id 
    FROM public.trainers 
    WHERE status = 'approved'
  )
);

-- Also ensure trainers table has public read access for approved trainers
DROP POLICY IF EXISTS "Public read access for approved trainers" ON public.trainers;
CREATE POLICY "Public read access for approved trainers" ON public.trainers
FOR SELECT 
USING (status = 'approved');

-- Allow public read access to reviews for approved trainers
DROP POLICY IF EXISTS "Public read access to trainer reviews" ON public.reviews;
CREATE POLICY "Public read access to trainer reviews" ON public.reviews
FOR SELECT 
USING (
  trainer_id IN (
    SELECT id 
    FROM public.trainers 
    WHERE status = 'approved'
  )
);

-- Allow public read access to feedback responses for approved trainers
DROP POLICY IF EXISTS "Public read access to trainer feedback" ON public.feedback_responses;
CREATE POLICY "Public read access to trainer feedback" ON public.feedback_responses
FOR SELECT 
USING (
  feedback_link_id IN (
    SELECT fl.id 
    FROM public.feedback_links fl
    JOIN public.bookings b ON fl.booking_id = b.id
    JOIN public.trainers t ON b.trainer_id = t.id
    WHERE t.status = 'approved'
  )
);

-- Allow public read access to feedback links for approved trainers
DROP POLICY IF EXISTS "Public read access to feedback links" ON public.feedback_links;
CREATE POLICY "Public read access to feedback links" ON public.feedback_links
FOR SELECT 
USING (
  booking_id IN (
    SELECT b.id 
    FROM public.bookings b
    JOIN public.trainers t ON b.trainer_id = t.id
    WHERE t.status = 'approved'
  )
);
