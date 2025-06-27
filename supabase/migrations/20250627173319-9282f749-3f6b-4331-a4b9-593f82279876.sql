
-- Update the check constraint to include 'trainer_selected' status
ALTER TABLE public.training_requests 
DROP CONSTRAINT IF EXISTS training_requests_status_check;

ALTER TABLE public.training_requests 
ADD CONSTRAINT training_requests_status_check 
CHECK (status IN ('open', 'closed', 'in_progress', 'completed', 'cancelled', 'trainer_selected'));
