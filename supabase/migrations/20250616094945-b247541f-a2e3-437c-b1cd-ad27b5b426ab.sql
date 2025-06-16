
-- Create feedback_links table to store shareable feedback links
CREATE TABLE public.feedback_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create feedback_responses table to store individual feedback responses
CREATE TABLE public.feedback_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_link_id UUID NOT NULL REFERENCES public.feedback_links(id) ON DELETE CASCADE,
  respondent_name TEXT NOT NULL,
  respondent_email TEXT NOT NULL,
  organization_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_comment TEXT,
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  skills_rating INTEGER CHECK (skills_rating >= 1 AND skills_rating <= 5),
  would_recommend BOOLEAN DEFAULT true,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for feedback_links
ALTER TABLE public.feedback_links ENABLE ROW LEVEL SECURITY;

-- Policy for trainers to view their feedback links
CREATE POLICY "Trainers can view their feedback links" 
  ON public.feedback_links 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = feedback_links.booking_id 
      AND bookings.trainer_id IN (
        SELECT id FROM public.trainers WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for creating feedback links (only system/trainers)
CREATE POLICY "System can create feedback links" 
  ON public.feedback_links 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for feedback_responses
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;

-- Policy for public feedback submission (anyone with valid link can submit)
CREATE POLICY "Anyone can submit feedback with valid link" 
  ON public.feedback_responses 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_links 
      WHERE feedback_links.id = feedback_responses.feedback_link_id 
      AND feedback_links.is_active = true 
      AND feedback_links.expires_at > now()
    )
  );

-- Policy for trainers to view feedback responses for their sessions
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

-- Function to generate feedback link token
CREATE OR REPLACE FUNCTION generate_feedback_token() 
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql;

-- Function to create feedback link when session is completed
CREATE OR REPLACE FUNCTION create_feedback_link_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create feedback link when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO public.feedback_links (booking_id, token)
    VALUES (NEW.id, generate_feedback_token());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic feedback link generation
CREATE TRIGGER create_feedback_link_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_link_on_completion();

-- Function to calculate average ratings for trainers
CREATE OR REPLACE FUNCTION update_trainer_ratings()
RETURNS TRIGGER AS $$
DECLARE
  trainer_id_val UUID;
  avg_rating NUMERIC;
  total_responses INTEGER;
BEGIN
  -- Get trainer_id from the booking
  SELECT b.trainer_id INTO trainer_id_val
  FROM public.feedback_links fl
  JOIN public.bookings b ON fl.booking_id = b.id
  WHERE fl.id = NEW.feedback_link_id;
  
  -- Calculate average rating and total responses for this trainer
  SELECT 
    ROUND(AVG(fr.rating), 2),
    COUNT(*)
  INTO avg_rating, total_responses
  FROM public.feedback_responses fr
  JOIN public.feedback_links fl ON fr.feedback_link_id = fl.id
  JOIN public.bookings b ON fl.booking_id = b.id
  WHERE b.trainer_id = trainer_id_val;
  
  -- Update trainer's rating and review count
  UPDATE public.trainers 
  SET 
    rating = avg_rating,
    total_reviews = total_responses,
    updated_at = now()
  WHERE id = trainer_id_val;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update trainer ratings when new feedback is submitted
CREATE TRIGGER update_trainer_ratings_trigger
  AFTER INSERT ON public.feedback_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_trainer_ratings();
