
-- Update the generate_feedback_token function to use standard base64 encoding
CREATE OR REPLACE FUNCTION public.generate_feedback_token()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;
