-- Urban Company Style Platform Transformation
-- 1. Update bookings table for platform-centric payments
ALTER TABLE public.bookings 
ADD COLUMN platform_fee_percentage DECIMAL(5,2) DEFAULT 20.00,
ADD COLUMN client_payment_amount DECIMAL(10,2),
ADD COLUMN platform_fee_amount DECIMAL(10,2),
ADD COLUMN trainer_assignment_status TEXT DEFAULT 'pending',
ADD COLUMN auto_assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN service_completion_status TEXT DEFAULT 'scheduled',
ADD COLUMN location_city TEXT,
ADD COLUMN location_area TEXT,
ADD COLUMN service_category TEXT,
ADD COLUMN team_size INTEGER DEFAULT 1,
ADD COLUMN urgency_level TEXT DEFAULT 'standard';

-- 2. Create trainer assignments table for Urban Company style matching
CREATE TABLE public.trainer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
  assignment_status TEXT DEFAULT 'offered', -- offered, accepted, declined, expired
  offered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_deadline TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '4 hours'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create service categories table
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create platform payments table for escrow-style payments
CREATE TABLE public.platform_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id),
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  trainer_payout DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'received', -- received, held, released, refunded
  payment_provider TEXT DEFAULT 'paypal',
  payment_transaction_id TEXT,
  held_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create trainer locations table for location-based matching
CREATE TABLE public.trainer_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES public.trainers(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  area TEXT,
  is_primary BOOLEAN DEFAULT false,
  travel_radius_km INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Update trainers table for Urban Company style profiles
ALTER TABLE public.trainers 
ADD COLUMN instant_booking_available BOOLEAN DEFAULT true,
ADD COLUMN minimum_booking_hours INTEGER DEFAULT 2,
ADD COLUMN response_time_hours INTEGER DEFAULT 4,
ADD COLUMN completion_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN average_response_time INTEGER DEFAULT 0,
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trainer_assignments
CREATE POLICY "Users can view their trainer assignments" ON public.trainer_assignments
FOR SELECT USING (
  trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()) OR
  booking_id IN (SELECT id FROM bookings WHERE student_id = auth.uid()) OR
  get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Platform can manage trainer assignments" ON public.trainer_assignments
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Trainers can update their assignments" ON public.trainer_assignments
FOR UPDATE USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- RLS Policies for service_categories
CREATE POLICY "Everyone can view active service categories" ON public.service_categories
FOR SELECT USING (is_active = true OR get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage service categories" ON public.service_categories
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for platform_payments
CREATE POLICY "Users can view their platform payments" ON public.platform_payments
FOR SELECT USING (
  client_id = auth.uid() OR
  booking_id IN (SELECT b.id FROM bookings b JOIN trainers t ON b.trainer_id = t.id WHERE t.user_id = auth.uid()) OR
  get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Platform can manage payments" ON public.platform_payments
FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for trainer_locations
CREATE POLICY "Users can view trainer locations" ON public.trainer_locations
FOR SELECT USING (true);

CREATE POLICY "Trainers can manage their locations" ON public.trainer_locations
FOR ALL USING (trainer_id IN (SELECT id FROM trainers WHERE user_id = auth.uid()));

-- Insert default service categories
INSERT INTO public.service_categories (name, slug, icon_name, description, base_price, display_order) VALUES
('Web Development', 'web-development', 'Code', 'Frontend, Backend, Full-stack training', 5000, 1),
('Mobile Development', 'mobile-development', 'Smartphone', 'iOS, Android, React Native training', 5500, 2),
('Data Science', 'data-science', 'BarChart3', 'AI, ML, Analytics, Python training', 6000, 3),
('Cloud Computing', 'cloud-computing', 'Cloud', 'AWS, Azure, GCP certification training', 5500, 4),
('DevOps', 'devops', 'Settings', 'CI/CD, Docker, Kubernetes training', 5200, 5),
('Cybersecurity', 'cybersecurity', 'Shield', 'Security, Penetration testing training', 6500, 6);

-- Create indexes for better performance
CREATE INDEX idx_trainer_assignments_booking_id ON public.trainer_assignments(booking_id);
CREATE INDEX idx_trainer_assignments_trainer_id ON public.trainer_assignments(trainer_id);
CREATE INDEX idx_trainer_assignments_status ON public.trainer_assignments(assignment_status);
CREATE INDEX idx_platform_payments_booking_id ON public.platform_payments(booking_id);
CREATE INDEX idx_trainer_locations_city ON public.trainer_locations(city);
CREATE INDEX idx_bookings_location_city ON public.bookings(location_city);
CREATE INDEX idx_bookings_service_category ON public.bookings(service_category);