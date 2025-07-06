-- Phase 1: BMC Integration Database Schema

-- Add BMC transaction tracking to bookings table
ALTER TABLE public.bookings 
ADD COLUMN bmc_payment_url TEXT,
ADD COLUMN bmc_transaction_id TEXT,
ADD COLUMN bmc_payment_status TEXT DEFAULT 'pending',
ADD COLUMN bmc_payment_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN platform_commission_rate DECIMAL(5,2) DEFAULT 20.00,
ADD COLUMN platform_commission_amount DECIMAL(10,2),
ADD COLUMN trainer_payout_amount DECIMAL(10,2);

-- Create trainer_payouts table to track what trainers should receive
CREATE TABLE public.trainer_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID NOT NULL REFERENCES public.trainers(id),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  gross_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid', 'cancelled')),
  payout_batch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create payout_batches table for weekly payout management
CREATE TABLE public.payout_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_name TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  trainer_count INTEGER NOT NULL,
  payout_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Add foreign key for payout_batch_id
ALTER TABLE public.trainer_payouts 
ADD CONSTRAINT fk_trainer_payouts_batch 
FOREIGN KEY (payout_batch_id) REFERENCES public.payout_batches(id);

-- Create indexes for better performance
CREATE INDEX idx_trainer_payouts_trainer_id ON public.trainer_payouts(trainer_id);
CREATE INDEX idx_trainer_payouts_booking_id ON public.trainer_payouts(booking_id);
CREATE INDEX idx_trainer_payouts_status ON public.trainer_payouts(payout_status);
CREATE INDEX idx_trainer_payouts_batch ON public.trainer_payouts(payout_batch_id);
CREATE INDEX idx_bookings_bmc_status ON public.bookings(bmc_payment_status);

-- Enable RLS on new tables
ALTER TABLE public.trainer_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_batches ENABLE ROW LEVEL SECURITY;

-- RLS policies for trainer_payouts
CREATE POLICY "Trainers can view their own payouts" 
ON public.trainer_payouts FOR SELECT 
USING (trainer_id IN (
  SELECT id FROM public.trainers WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payouts" 
ON public.trainer_payouts FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies for payout_batches
CREATE POLICY "Admins can manage payout batches" 
ON public.payout_batches FOR ALL 
USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Trainers can view batch info for their payouts" 
ON public.payout_batches FOR SELECT 
USING (id IN (
  SELECT payout_batch_id FROM public.trainer_payouts 
  WHERE trainer_id IN (
    SELECT id FROM public.trainers WHERE user_id = auth.uid()
  )
));

-- Function to calculate trainer payout amounts
CREATE OR REPLACE FUNCTION public.calculate_trainer_payout(
  p_booking_id UUID,
  p_commission_rate DECIMAL DEFAULT 20.00
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  booking_data RECORD;
  gross_amount DECIMAL(10,2);
  commission_amount DECIMAL(10,2);
  net_amount DECIMAL(10,2);
BEGIN
  -- Get booking data
  SELECT total_amount INTO gross_amount
  FROM public.bookings 
  WHERE id = p_booking_id;
  
  IF gross_amount IS NULL THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Calculate commission and net amount
  commission_amount := (gross_amount * p_commission_rate / 100);
  net_amount := gross_amount - commission_amount;
  
  RETURN jsonb_build_object(
    'gross_amount', gross_amount,
    'commission_rate', p_commission_rate,
    'commission_amount', commission_amount,
    'net_amount', net_amount
  );
END;
$$;

-- Function to create trainer payout record
CREATE OR REPLACE FUNCTION public.create_trainer_payout(p_booking_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  booking_data RECORD;
  payout_data JSONB;
  payout_id UUID;
BEGIN
  -- Get booking details
  SELECT * INTO booking_data
  FROM public.bookings 
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  -- Check if payout already exists
  IF EXISTS (SELECT 1 FROM public.trainer_payouts WHERE booking_id = p_booking_id) THEN
    RAISE EXCEPTION 'Payout already exists for this booking';
  END IF;
  
  -- Calculate payout amounts
  payout_data := calculate_trainer_payout(p_booking_id, booking_data.platform_commission_rate);
  
  -- Create payout record
  INSERT INTO public.trainer_payouts (
    trainer_id,
    booking_id,
    gross_amount,
    platform_commission,
    net_amount
  ) VALUES (
    booking_data.trainer_id,
    p_booking_id,
    (payout_data->>'gross_amount')::DECIMAL(10,2),
    (payout_data->>'commission_amount')::DECIMAL(10,2),
    (payout_data->>'net_amount')::DECIMAL(10,2)
  ) RETURNING id INTO payout_id;
  
  RETURN payout_id;
END;
$$;

-- Trigger to automatically create trainer payout when booking is completed
CREATE OR REPLACE FUNCTION public.auto_create_trainer_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create payout when status changes to completed and BMC payment is confirmed
  IF NEW.status = 'completed' AND NEW.bmc_payment_status = 'confirmed' AND 
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
$$;

CREATE TRIGGER trigger_auto_create_trainer_payout
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_trainer_payout();