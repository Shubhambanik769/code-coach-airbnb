-- Create function to notify trainer when feedback is received
CREATE OR REPLACE FUNCTION public.notify_trainer_feedback_received()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  trainer_user_id UUID;
  booking_data RECORD;
BEGIN
  -- Get booking and trainer info from the feedback
  SELECT b.*, t.user_id as trainer_user_id
  INTO booking_data
  FROM feedback_links fl
  JOIN bookings b ON fl.booking_id = b.id  
  JOIN trainers t ON b.trainer_id = t.id
  WHERE fl.id = NEW.feedback_link_id;
  
  -- Notify trainer about new feedback
  IF booking_data.trainer_user_id IS NOT NULL THEN
    PERFORM create_notification(
      booking_data.trainer_user_id,
      'review_received',
      'New Feedback Received',
      'You received new feedback for your training session "' || booking_data.training_topic || '"',
      jsonb_build_object(
        'booking_id', booking_data.id,
        'training_topic', booking_data.training_topic,
        'rating', NEW.rating,
        'feedback_id', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger to notify trainer when feedback is received
DROP TRIGGER IF EXISTS notify_trainer_on_feedback ON public.feedback_responses;
CREATE TRIGGER notify_trainer_on_feedback
  AFTER INSERT ON public.feedback_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_trainer_feedback_received();