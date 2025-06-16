
-- Allow public insertion of feedback responses
-- This enables non-authenticated users to submit feedback

CREATE POLICY "Public can insert feedback responses through valid links" 
  ON public.feedback_responses 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_links fl
      WHERE fl.id = feedback_responses.feedback_link_id 
      AND fl.is_active = true 
      AND fl.expires_at > now()
    )
  );
