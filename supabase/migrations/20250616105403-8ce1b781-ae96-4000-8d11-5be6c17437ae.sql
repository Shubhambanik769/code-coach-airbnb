
-- Update RLS policies for feedback_links to allow public read access for active links
-- This will allow non-logged-in users to access feedback links

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Trainers can view their feedback links" ON public.feedback_links;

-- Create new policy that allows public read access for active, non-expired links
CREATE POLICY "Public can view active feedback links" 
  ON public.feedback_links 
  FOR SELECT 
  USING (
    is_active = true 
    AND expires_at > now()
  );

-- Keep the existing insert policy for system/trainers
-- CREATE POLICY "System can create feedback links" 
--   ON public.feedback_links 
--   FOR INSERT 
--   WITH CHECK (true);

-- Update RLS policies for feedback_responses to ensure public can read when needed
-- Drop and recreate the select policy to be more permissive for public feedback viewing
DROP POLICY IF EXISTS "Trainers can view their feedback responses" ON public.feedback_responses;

-- Create policy that allows public to view feedback responses through valid feedback links
-- This is needed for the feedback form to check for duplicate submissions
CREATE POLICY "Public can view feedback responses through valid links" 
  ON public.feedback_responses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_links fl
      WHERE fl.id = feedback_responses.feedback_link_id 
      AND fl.is_active = true 
      AND fl.expires_at > now()
    )
  );

-- Policy for trainers to view their feedback responses (for dashboard)
CREATE POLICY "Trainers can view their feedback responses" 
  ON public.feedback_responses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_links fl
      JOIN public.bookings b ON fl.booking_id = b.id
      JOIN public.trainers t ON b.trainer_id = t.id
      WHERE fl.id = feedback_responses.feedback_link_id 
      AND t.user_id = auth.uid()
    )
  );
