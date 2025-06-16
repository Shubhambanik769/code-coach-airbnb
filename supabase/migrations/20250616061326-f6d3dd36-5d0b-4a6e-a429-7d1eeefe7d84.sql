
-- Create trainer availability table for calendar management
CREATE TABLE public.trainer_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id, date, start_time)
);

-- Create trainer pricing table
CREATE TABLE public.trainer_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  session_rate DECIMAL(10,2),
  pricing_type TEXT NOT NULL DEFAULT 'hourly' CHECK (pricing_type IN ('hourly', 'session')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trainer_id)
);

-- Create platform settings table for admin-controlled fees
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value DECIMAL(10,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
('commission_rate', 0.15, 'Platform commission rate (15%)'),
('gst_rate', 0.18, 'GST rate (18%)'),
('platform_fee', 50.00, 'Fixed platform fee per booking');

-- Add RLS policies for trainer_availability
ALTER TABLE public.trainer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own availability" 
  ON public.trainer_availability 
  FOR ALL 
  USING (
    trainer_id IN (
      SELECT id FROM public.trainers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view trainer availability for booking" 
  ON public.trainer_availability 
  FOR SELECT 
  USING (is_available = true AND is_booked = false);

-- Add RLS policies for trainer_pricing
ALTER TABLE public.trainer_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can manage their own pricing" 
  ON public.trainer_pricing 
  FOR ALL 
  USING (
    trainer_id IN (
      SELECT id FROM public.trainers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view trainer pricing" 
  ON public.trainer_pricing 
  FOR SELECT 
  USING (true);

-- Add RLS policies for platform_settings (admin only)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage platform settings" 
  ON public.platform_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view platform settings" 
  ON public.platform_settings 
  FOR SELECT 
  USING (true);

-- Add indexes for performance
CREATE INDEX idx_trainer_availability_trainer_date ON public.trainer_availability(trainer_id, date);
CREATE INDEX idx_trainer_availability_available ON public.trainer_availability(is_available, is_booked);
CREATE INDEX idx_trainer_pricing_trainer ON public.trainer_pricing(trainer_id);
CREATE INDEX idx_platform_settings_key ON public.platform_settings(setting_key);

-- Update bookings table to include more status options
ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_status_check,
  ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'assigned', 'delivering', 'delivered', 'cancelled', 'completed'));
