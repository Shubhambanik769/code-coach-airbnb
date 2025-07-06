-- Update database schema for generic payment system (PayPal integration)

-- Rename BMC-specific columns to generic payment columns
ALTER TABLE public.bookings 
  RENAME COLUMN bmc_payment_url TO payment_url;

ALTER TABLE public.bookings 
  RENAME COLUMN bmc_transaction_id TO payment_transaction_id;

ALTER TABLE public.bookings 
  RENAME COLUMN bmc_payment_confirmed_at TO payment_confirmed_at;

-- Update existing BMC payment status to generic values
UPDATE public.bookings 
SET payment_status = 'confirmed' 
WHERE bmc_payment_status = 'confirmed';

UPDATE public.bookings 
SET payment_status = 'pending' 
WHERE bmc_payment_status = 'pending' OR bmc_payment_status IS NULL;

-- Drop the old BMC-specific column
ALTER TABLE public.bookings 
  DROP COLUMN IF EXISTS bmc_payment_status;

-- Add PayPal order ID field for tracking
ALTER TABLE public.bookings 
  ADD COLUMN paypal_order_id TEXT;

-- Add payment provider field to track which payment system was used
ALTER TABLE public.bookings 
  ADD COLUMN payment_provider TEXT DEFAULT 'paypal';

-- Update existing records to mark them as BMC payments
UPDATE public.bookings 
SET payment_provider = 'bmc' 
WHERE payment_url LIKE '%buymeacoffee%' OR payment_url IS NOT NULL;

-- Add index for better payment queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_provider ON public.bookings(payment_provider);