
-- Create or replace function to update trainer ratings from feedback responses
CREATE OR REPLACE FUNCTION public.update_trainer_ratings_from_feedback()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  trainer_id_val UUID;
  avg_rating NUMERIC;
  avg_communication NUMERIC;
  avg_punctuality NUMERIC; 
  avg_skills NUMERIC;
  total_responses INTEGER;
  recommendation_count INTEGER;
  recommendation_rate NUMERIC;
BEGIN
  -- Get trainer_id from the booking linked to feedback
  SELECT b.trainer_id INTO trainer_id_val
  FROM public.feedback_links fl
  JOIN public.bookings b ON fl.booking_id = b.id
  WHERE fl.id = NEW.feedback_link_id;
  
  -- Calculate comprehensive statistics from both reviews and feedback responses
  WITH all_feedback AS (
    -- Get data from reviews table
    SELECT 
      rating,
      communication_rating,
      punctuality_rating,
      skills_rating,
      would_recommend
    FROM public.reviews r
    WHERE r.trainer_id = trainer_id_val
    
    UNION ALL
    
    -- Get data from feedback_responses table
    SELECT 
      fr.rating,
      fr.communication_rating,
      fr.punctuality_rating,
      fr.skills_rating,
      fr.would_recommend
    FROM public.feedback_responses fr
    JOIN public.feedback_links fl ON fr.feedback_link_id = fl.id
    JOIN public.bookings b ON fl.booking_id = b.id
    WHERE b.trainer_id = trainer_id_val
  )
  SELECT 
    ROUND(AVG(rating), 2),
    ROUND(AVG(communication_rating), 2),
    ROUND(AVG(punctuality_rating), 2),
    ROUND(AVG(skills_rating), 2),
    COUNT(*),
    COUNT(*) FILTER (WHERE would_recommend = true)
  INTO avg_rating, avg_communication, avg_punctuality, avg_skills, total_responses, recommendation_count
  FROM all_feedback;
  
  -- Calculate recommendation rate
  recommendation_rate := CASE 
    WHEN total_responses > 0 THEN ROUND((recommendation_count::NUMERIC / total_responses) * 100, 1)
    ELSE 0
  END;
  
  -- Update trainer's comprehensive ratings
  UPDATE public.trainers 
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = COALESCE(total_responses, 0),
    updated_at = now()
  WHERE id = trainer_id_val;
  
  RETURN NEW;
END;
$$;

-- Create trigger for feedback responses
DROP TRIGGER IF EXISTS trigger_update_trainer_ratings_feedback ON public.feedback_responses;
CREATE TRIGGER trigger_update_trainer_ratings_feedback
  AFTER INSERT OR UPDATE OR DELETE ON public.feedback_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_trainer_ratings_from_feedback();

-- Also update the existing reviews trigger to include feedback data
CREATE OR REPLACE FUNCTION public.update_trainer_ratings_from_reviews()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating NUMERIC;
  total_responses INTEGER;
  recommendation_count INTEGER;
BEGIN
  -- Calculate comprehensive statistics from both reviews and feedback responses
  WITH all_feedback AS (
    -- Get data from reviews table
    SELECT 
      rating,
      would_recommend
    FROM public.reviews r
    WHERE r.trainer_id = COALESCE(NEW.trainer_id, OLD.trainer_id)
    
    UNION ALL
    
    -- Get data from feedback_responses table
    SELECT 
      fr.rating,
      fr.would_recommend
    FROM public.feedback_responses fr
    JOIN public.feedback_links fl ON fr.feedback_link_id = fl.id
    JOIN public.bookings b ON fl.booking_id = b.id
    WHERE b.trainer_id = COALESCE(NEW.trainer_id, OLD.trainer_id)
  )
  SELECT 
    ROUND(AVG(rating), 2),
    COUNT(*),
    COUNT(*) FILTER (WHERE would_recommend = true)
  INTO avg_rating, total_responses, recommendation_count
  FROM all_feedback;
  
  -- Update trainer's ratings
  UPDATE public.trainers 
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = COALESCE(total_responses, 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.trainer_id, OLD.trainer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update existing reviews trigger
DROP TRIGGER IF EXISTS trigger_update_trainer_ratings_reviews ON public.reviews;
CREATE TRIGGER trigger_update_trainer_ratings_reviews
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_trainer_ratings_from_reviews();
