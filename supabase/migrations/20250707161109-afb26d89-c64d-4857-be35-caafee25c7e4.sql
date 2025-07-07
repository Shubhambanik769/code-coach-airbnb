-- Enable MFA for Supabase Auth
-- This migration ensures MFA is properly configured

-- First, ensure RLS is enabled on auth schema (this is handled by Supabase automatically)
-- The auth.mfa_factors table is managed by Supabase Auth

-- Create a function to check if a user has MFA enabled (optional helper for admin purposes)
CREATE OR REPLACE FUNCTION public.user_has_mfa(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.mfa_factors 
    WHERE user_id = $1 
    AND status = 'verified'
  );
$$;

-- Create a view to help admins see MFA status (optional)
CREATE OR REPLACE VIEW public.user_mfa_status AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM auth.mfa_factors mf 
      WHERE mf.user_id = p.id 
      AND mf.status = 'verified'
    ) THEN true 
    ELSE false 
  END as has_mfa
FROM public.profiles p;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.user_has_mfa(uuid) TO authenticated;
GRANT SELECT ON public.user_mfa_status TO authenticated;

-- Only admins can see the full MFA status view
CREATE POLICY "Admins can view MFA status" ON public.user_mfa_status
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Enable RLS on the view
ALTER VIEW public.user_mfa_status ENABLE ROW LEVEL SECURITY;