
-- Add foreign key constraint for training_requests.client_id to reference profiles.id
ALTER TABLE public.training_requests 
ADD CONSTRAINT fk_training_requests_client_id 
FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
