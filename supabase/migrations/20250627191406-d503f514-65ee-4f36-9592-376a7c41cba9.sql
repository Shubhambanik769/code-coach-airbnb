
-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM (
  'booking_confirmed',
  'booking_cancelled', 
  'booking_completed',
  'training_request_created',
  'training_application_received',
  'training_application_accepted',
  'training_application_rejected',
  'trainer_approved',
  'trainer_rejected',
  'payment_received',
  'review_received',
  'system_announcement'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}' NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications (is_read) WHERE is_read = FALSE;

-- Function to create notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify booking participants
CREATE OR REPLACE FUNCTION public.notify_booking_participants()
RETURNS TRIGGER AS $$
DECLARE
  trainer_user_id UUID;
  client_user_id UUID;
BEGIN
  -- Get trainer and client user IDs
  SELECT t.user_id INTO trainer_user_id 
  FROM trainers t 
  WHERE t.id = NEW.trainer_id;
  
  SELECT p.id INTO client_user_id 
  FROM profiles p 
  WHERE p.id = NEW.student_id;

  -- Notify based on status change
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Notify trainer
    PERFORM create_notification(
      trainer_user_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your training session "' || NEW.training_topic || '" has been confirmed.',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
    
    -- Notify client
    PERFORM create_notification(
      client_user_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your training session "' || NEW.training_topic || '" has been confirmed.',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
    
  ELSIF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    -- Notify trainer
    PERFORM create_notification(
      trainer_user_id,
      'booking_cancelled',
      'Booking Cancelled',
      'Your training session "' || NEW.training_topic || '" has been cancelled.',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
    
    -- Notify client
    PERFORM create_notification(
      client_user_id,
      'booking_cancelled',
      'Booking Cancelled',
      'Your training session "' || NEW.training_topic || '" has been cancelled.',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
    
  ELSIF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Notify trainer
    PERFORM create_notification(
      trainer_user_id,
      'booking_completed',
      'Training Completed',
      'Your training session "' || NEW.training_topic || '" has been completed.',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
    
    -- Notify client
    PERFORM create_notification(
      client_user_id,
      'booking_completed',
      'Training Completed',
      'Your training session "' || NEW.training_topic || '" has been completed. Please leave a review!',
      jsonb_build_object('booking_id', NEW.id, 'training_topic', NEW.training_topic)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify training request events
CREATE OR REPLACE FUNCTION public.notify_training_request_events()
RETURNS TRIGGER AS $$
DECLARE
  client_user_id UUID;
BEGIN
  -- Get client user ID
  SELECT client_id INTO client_user_id FROM training_requests WHERE id = NEW.request_id;
  
  -- Notify client about new application
  PERFORM create_notification(
    client_user_id,
    'training_application_received',
    'New Training Application',
    'You received a new application for your training request.',
    jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify application status changes
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

  -- Notify trainer about status change
  IF NEW.status = 'selected' AND (OLD.status IS NULL OR OLD.status != 'selected') THEN
    PERFORM create_notification(
      trainer_user_id,
      'training_application_accepted',
      'Application Accepted!',
      'Congratulations! Your application for "' || request_title || '" has been accepted.',
      jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
    );
    
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    PERFORM create_notification(
      trainer_user_id,
      'training_application_rejected',
      'Application Update',
      'Your application for "' || request_title || '" was not selected this time.',
      jsonb_build_object('request_id', NEW.request_id, 'application_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify trainer status changes
CREATE OR REPLACE FUNCTION public.notify_trainer_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM create_notification(
      NEW.user_id,
      'trainer_approved',
      'Trainer Application Approved!',
      'Congratulations! Your trainer application has been approved. You can now start receiving training requests.',
      jsonb_build_object('trainer_id', NEW.id)
    );
    
  ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    PERFORM create_notification(
      NEW.user_id,
      'trainer_rejected',
      'Trainer Application Update',
      'Your trainer application requires additional review. Please contact support for more information.',
      jsonb_build_object('trainer_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER booking_status_notification
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_participants();

CREATE TRIGGER training_application_notification
  AFTER INSERT ON public.training_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_training_request_events();

CREATE TRIGGER application_status_notification
  AFTER UPDATE ON public.training_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

CREATE TRIGGER trainer_status_notification
  AFTER UPDATE ON public.trainers
  FOR EACH ROW
  EXECUTE FUNCTION notify_trainer_status_change();

-- Function to mark notifications as read
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

-- Function to get unread notification count
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
