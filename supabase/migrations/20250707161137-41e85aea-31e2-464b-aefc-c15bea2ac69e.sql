-- Enable MFA for Supabase Auth
-- This migration ensures MFA is properly configured

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

-- Create a function to get MFA status for admins only
CREATE OR REPLACE FUNCTION public.get_user_mfa_status()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  has_mfa boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Only allow admins to call this function
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
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1 FROM public.profiles admin_check
    WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
  );
$$;

-- Grant appropriate permissions
GRANT EXECUTE ON FUNCTION public.user_has_mfa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_mfa_status() TO authenticated;