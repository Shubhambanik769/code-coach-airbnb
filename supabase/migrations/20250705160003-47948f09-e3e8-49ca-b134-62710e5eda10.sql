-- Add missing notification type
ALTER TYPE notification_type ADD VALUE 'booking_status_changed';

-- Update bookings that have completed agreements but are still pending
UPDATE public.bookings 
SET status = 'confirmed', updated_at = NOW()
WHERE status = 'pending' 
AND agreement_id IN (
  SELECT id FROM public.agreements 
  WHERE client_signature_status = 'accepted' 
  AND trainer_signature_status = 'accepted' 
  AND completed_at IS NOT NULL
);