-- Fix database functions that still reference old BMC column names

-- Update the auto_create_trainer_payout function
CREATE OR REPLACE FUNCTION public.auto_create_trainer_payout()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only create payout when status changes to completed and payment is confirmed
  IF NEW.status = 'completed' AND NEW.payment_status = 'confirmed' AND 
     (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Update booking with calculated amounts
    UPDATE public.bookings SET
      platform_commission_amount = (NEW.total_amount * NEW.platform_commission_rate / 100),
      trainer_payout_amount = NEW.total_amount - (NEW.total_amount * NEW.platform_commission_rate / 100)
    WHERE id = NEW.id;
    
    -- Create trainer payout record
    PERFORM create_trainer_payout(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update notification functions to use new column names
CREATE OR REPLACE FUNCTION public.notify_booking_participants()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  trainer_user_id UUID;
  client_user_id UUID;
BEGIN
  -- Get trainer user ID
  SELECT t.user_id INTO trainer_user_id 
  FROM trainers t 
  WHERE t.id = NEW.trainer_id;
  
  -- Get client user ID (student_id is already the user ID from profiles)
  SELECT NEW.student_id INTO client_user_id;

  -- Debug logging
  RAISE LOG 'Booking status change: % -> %, trainer_user_id: %, client_user_id: %', 
    COALESCE(OLD.status, 'NULL'), NEW.status, trainer_user_id, client_user_id;

  -- Notify based on status change
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Notify trainer
    IF trainer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        trainer_user_id,
        'booking_confirmed',
        'Booking Confirmed',
        'Your training session "' || NEW.training_topic || '" has been confirmed.',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
    
    -- Notify client
    IF client_user_id IS NOT NULL THEN
      PERFORM create_notification(
        client_user_id,
        'booking_confirmed',
        'Booking Confirmed',
        'Your training session "' || NEW.training_topic || '" has been confirmed.',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
    
  ELSIF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Notify trainer
    IF trainer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        trainer_user_id,
        'booking_cancelled',
        'Booking Cancelled',
        'Your training session "' || NEW.training_topic || '" has been cancelled.',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
    
    -- Notify client
    IF client_user_id IS NOT NULL THEN
      PERFORM create_notification(
        client_user_id,
        'booking_cancelled',
        'Booking Cancelled',
        'Your training session "' || NEW.training_topic || '" has been cancelled.',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
    
  ELSIF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Notify trainer
    IF trainer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        trainer_user_id,
        'booking_completed',
        'Training Completed',
        'Your training session "' || NEW.training_topic || '" has been completed.',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
    
    -- Notify client
    IF client_user_id IS NOT NULL THEN
      PERFORM create_notification(
        client_user_id,
        'booking_completed',
        'Training Completed',
        'Your training session "' || NEW.training_topic || '" has been completed. Please leave a review!',
        jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;