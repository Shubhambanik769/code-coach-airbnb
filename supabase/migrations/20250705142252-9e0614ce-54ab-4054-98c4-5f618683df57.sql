-- Create agreements table to store agreement records
CREATE TABLE public.agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_signature_status TEXT NOT NULL DEFAULT 'pending',
  trainer_signature_status TEXT NOT NULL DEFAULT 'pending', 
  agreement_terms JSONB NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  client_agreed_at TIMESTAMP WITH TIME ZONE,
  trainer_agreed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add agreement tracking columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN agreement_id UUID REFERENCES public.agreements(id),
ADD COLUMN requires_agreement BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS on agreements table
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

-- RLS policies for agreements
CREATE POLICY "Users can view agreements for their bookings" 
ON public.agreements 
FOR SELECT 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE student_id = auth.uid() OR trainer_id IN (
      SELECT id FROM public.trainers WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "System can create agreements" 
ON public.agreements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their signature status" 
ON public.agreements 
FOR UPDATE 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE student_id = auth.uid() OR trainer_id IN (
      SELECT id FROM public.trainers WHERE user_id = auth.uid()
    )
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_agreements_updated_at
BEFORE UPDATE ON public.agreements
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Function to generate agreement terms
CREATE OR REPLACE FUNCTION public.generate_agreement_terms(
  p_booking_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_data RECORD;
  trainer_data RECORD;
  client_data RECORD;
  agreement_terms JSONB;
BEGIN
  -- Get booking details
  SELECT * INTO booking_data 
  FROM public.bookings 
  WHERE id = p_booking_id;
  
  -- Get trainer details
  SELECT t.*, p.full_name as trainer_name, p.email as trainer_email
  INTO trainer_data
  FROM public.trainers t
  JOIN public.profiles p ON t.user_id = p.id
  WHERE t.id = booking_data.trainer_id;
  
  -- Get client details
  SELECT * INTO client_data
  FROM public.profiles
  WHERE id = booking_data.student_id;
  
  -- Generate agreement terms JSON
  agreement_terms := jsonb_build_object(
    'booking_details', jsonb_build_object(
      'training_topic', booking_data.training_topic,
      'start_time', booking_data.start_time,
      'end_time', booking_data.end_time,
      'duration_hours', booking_data.duration_hours,
      'organization_name', booking_data.organization_name,
      'special_requirements', booking_data.special_requirements
    ),
    'trainer_details', jsonb_build_object(
      'name', trainer_data.trainer_name,
      'email', trainer_data.trainer_email,
      'specialization', trainer_data.specialization,
      'experience_years', trainer_data.experience_years
    ),
    'client_details', jsonb_build_object(
      'name', COALESCE(booking_data.client_name, client_data.full_name),
      'email', COALESCE(booking_data.client_email, client_data.email),
      'company_name', COALESCE(booking_data.organization_name, client_data.company_name),
      'designation', client_data.designation
    ),
    'financial_terms', jsonb_build_object(
      'hourly_rate', booking_data.total_amount / booking_data.duration_hours,
      'total_cost', booking_data.total_amount,
      'duration_hours', booking_data.duration_hours
    ),
    'terms_and_conditions', jsonb_build_object(
      'cancellation_policy', '24 hours notice required for cancellation',
      'payment_terms', 'Payment due upon completion of training',
      'liability', 'Both parties agree to professional conduct during training sessions',
      'intellectual_property', 'Training materials remain property of the trainer',
      'confidentiality', 'Both parties agree to maintain confidentiality of discussed topics'
    )
  );
  
  RETURN agreement_terms;
END;
$$;