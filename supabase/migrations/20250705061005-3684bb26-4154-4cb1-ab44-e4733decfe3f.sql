-- Add enhanced profile fields for clients and trainers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Add additional trainer profile fields
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS linkedin_profile TEXT;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS github_profile TEXT;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS languages_spoken TEXT[];
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS education TEXT[];
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS achievements TEXT[];
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS teaching_methodology TEXT;

-- Create enhanced notifications for admin visibility
CREATE OR REPLACE FUNCTION public.notify_admin_of_activity()
RETURNS TRIGGER AS $$
DECLARE
  admin_ids UUID[];
BEGIN
  -- Get all admin user IDs
  SELECT array_agg(id) INTO admin_ids
  FROM public.profiles 
  WHERE role = 'admin';
  
  -- Notify all admins based on the trigger context
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
    -- New user registration
    PERFORM create_notification(
      admin_id,
      'system_alert',
      'New User Registration',
      'A new user has registered: ' || COALESCE(NEW.full_name, NEW.email),
      jsonb_build_object('user_id', NEW.id, 'email', NEW.email)
    )
    FROM unnest(admin_ids) AS admin_id;
    
  ELSIF TG_TABLE_NAME = 'trainers' AND TG_OP = 'INSERT' THEN
    -- New trainer application
    PERFORM create_notification(
      admin_id,
      'trainer_application',
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
$$ LANGUAGE plpgsql;

-- Create triggers for admin notifications
DROP TRIGGER IF EXISTS notify_admin_new_user ON public.profiles;
CREATE TRIGGER notify_admin_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_of_activity();

DROP TRIGGER IF EXISTS notify_admin_new_trainer ON public.trainers;
CREATE TRIGGER notify_admin_new_trainer
  AFTER INSERT ON public.trainers
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_of_activity();

DROP TRIGGER IF EXISTS notify_admin_booking_activity ON public.bookings;
CREATE TRIGGER notify_admin_booking_activity
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_of_activity();