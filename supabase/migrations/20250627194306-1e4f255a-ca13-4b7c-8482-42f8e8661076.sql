
-- Fix the notifications table to reference profiles instead of auth.users
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update the booking notification function to properly get user IDs
CREATE OR REPLACE FUNCTION public.notify_booking_participants()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Update the application notification function
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  trainer_user_id UUID;
  client_user_id UUID;
  request_title TEXT;
BEGIN
  -- Get trainer user ID
  SELECT t.user_id INTO trainer_user_id 
  FROM trainers t 
  WHERE t.id = NEW.trainer_id;
  
  -- Get client user ID and request title
  SELECT tr.client_id, tr.title INTO client_user_id, request_title
  FROM training_requests tr 
  WHERE tr.id = NEW.request_id;

  -- Debug logging
  RAISE LOG 'Application status change: % -> %, trainer_user_id: %, client_user_id: %', 
    COALESCE(OLD.status, 'NULL'), NEW.status, trainer_user_id, client_user_id;

  -- Notify trainer about status change
  IF NEW.status = 'selected' AND (OLD.status IS NULL OR OLD.status != 'selected') THEN
    IF trainer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        trainer_user_id,
        'training_application_accepted',
        'Application Accepted!',
        'Congratulations! Your application for "' || request_title || '" has been accepted.',
        jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
      );
    END IF;
    
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    IF trainer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        trainer_user_id,
        'training_application_rejected',
        'Application Update',
        'Your application for "' || request_title || '" was not selected this time.',
        jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update training request notification function
CREATE OR REPLACE FUNCTION public.notify_training_request_events()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id UUID;
BEGIN
  -- Get client user ID
  SELECT client_id INTO client_user_id FROM training_requests WHERE id = NEW.request_id;
  
  -- Debug logging
  RAISE LOG 'New training application: request_id: %, client_user_id: %', NEW.request_id, client_user_id;
  
  -- Notify client about new application
  IF client_user_id IS NOT NULL THEN
    PERFORM create_notification(
      client_user_id,
      'training_application_received',
      'New Training Application',
      'You received a new application for your training request.',
      jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix RLS policies to work with profiles
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Update the notification count function
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM public.notifications 
    WHERE user_id = auth.uid() AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update mark as read function
CREATE OR REPLACE FUNCTION public.mark_notifications_read(notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = ANY(notification_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
