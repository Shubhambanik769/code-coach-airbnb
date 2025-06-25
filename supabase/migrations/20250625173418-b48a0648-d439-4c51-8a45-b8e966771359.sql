
-- Create training_requests table for client posts
CREATE TABLE public.training_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('college', 'corporate', 'custom')),
  expected_start_date DATE,
  expected_end_date DATE,
  duration_hours INTEGER,
  delivery_mode TEXT CHECK (delivery_mode IN ('online', 'offline', 'hybrid')),
  location TEXT,
  language_preference TEXT,
  tools_required TEXT[],
  syllabus_content TEXT,
  syllabus_file_url TEXT,
  allow_trainer_pricing BOOLEAN DEFAULT true,
  allow_trainer_syllabus BOOLEAN DEFAULT false,
  budget_min NUMERIC,
  budget_max NUMERIC,
  application_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'in_progress', 'completed', 'cancelled')),
  selected_trainer_id UUID REFERENCES public.trainers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_applications table for trainer responses
CREATE TABLE public.training_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.training_requests(id) ON DELETE CASCADE NOT NULL,
  trainer_id UUID REFERENCES public.trainers(id) NOT NULL,
  proposed_price NUMERIC NOT NULL,
  proposed_start_date DATE,
  proposed_end_date DATE,
  proposed_duration_hours INTEGER,
  availability_notes TEXT,
  message_to_client TEXT,
  proposed_syllabus TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'selected', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, trainer_id) -- Prevent duplicate applications
);

-- Add RLS policies for training_requests
ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;

-- Clients can view all open requests and their own requests
CREATE POLICY "Anyone can view open training requests"
  ON public.training_requests
  FOR SELECT
  USING (status = 'open' OR client_id = auth.uid());

-- Only clients can create requests
CREATE POLICY "Clients can create training requests"
  ON public.training_requests
  FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update their own requests
CREATE POLICY "Clients can update their own training requests"
  ON public.training_requests
  FOR UPDATE
  USING (auth.uid() = client_id);

-- Add RLS policies for training_applications
ALTER TABLE public.training_applications ENABLE ROW LEVEL SECURITY;

-- Trainers can view all applications, clients can view applications for their requests
CREATE POLICY "Trainers and request owners can view applications"
  ON public.training_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trainers t WHERE t.user_id = auth.uid() AND t.id = trainer_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.training_requests tr WHERE tr.client_id = auth.uid() AND tr.id = request_id
    )
  );

-- Only trainers can create applications
CREATE POLICY "Trainers can create applications"
  ON public.training_applications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trainers t WHERE t.user_id = auth.uid() AND t.id = trainer_id
    )
  );

-- Trainers can update their own applications, clients can update status for their requests
CREATE POLICY "Trainers and clients can update applications"
  ON public.training_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trainers t WHERE t.user_id = auth.uid() AND t.id = trainer_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.training_requests tr WHERE tr.client_id = auth.uid() AND tr.id = request_id
    )
  );

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_training_requests
  BEFORE UPDATE ON public.training_requests
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_training_applications
  BEFORE UPDATE ON public.training_applications
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
