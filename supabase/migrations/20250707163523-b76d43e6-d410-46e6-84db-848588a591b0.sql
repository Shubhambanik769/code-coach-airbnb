-- Add missing notification types to the enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'system_alert';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'trainer_application';

-- Update the notify_admin_of_activity function to use correct notification types
CREATE OR REPLACE FUNCTION public.notify_admin_of_activity()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Get all admin user IDs
  SELECT array_agg(id) INTO admin_ids
  FROM public.profiles 
  WHERE role = 'admin';
  
  -- Notify all admins based on the trigger context
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
    -- New user registration - use system_announcement instead of system_alert
    PERFORM create_notification(
      admin_id,
      'system_announcement',
      'New User Registration',
      'A new user has registered: ' || COALESCE(NEW.full_name, NEW.email),
      jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
    )
    FROM unnest(admin_ids) AS admin_id;
    
  ELSIF TG_TABLE_NAME = 'trainers' AND TG_OP = 'INSERT' THEN
    -- New trainer application - use system_announcement instead of trainer_application
    PERFORM create_notification(
      admin_id,
      'system_announcement',
      'New Trainer Application',
      'A new trainer application has been submitted: ' || NEW.name,
      jsonb_build_object('trainer_id', NEW.id, 'user_id', NEW.user_id)
    )
    FROM unnest(admin_ids) AS admin_id;
    
  ELSIF TG_TABLE_NAME = 'bookings' AND TG_OP = 'INSERT' THEN
    -- New booking created
    PERFORM create_notification(
      admin_id,
      'booking_created',
      'New Booking Created',
      'A new booking has been created for: ' || NEW.training_topic,
      jsonb_build_object('booking_id', NEW.id, 'topic', NEW.training_topic)
    )
    FROM unnest(admin_ids) AS admin_id;
    
  ELSIF TG_TABLE_NAME = 'bookings' AND TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Booking status change
    PERFORM create_notification(
      admin_id,
      'booking_status_changed',
      'Booking Status Changed',
      'Booking status changed from ' || OLD.status || ' to ' || NEW.status || ' for: ' || NEW.training_topic,
      jsonb_build_object('booking_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    )
    FROM unnest(admin_ids) AS admin_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$function$;