
-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Enable admin access to all profiles" ON public.profiles;

-- Drop the security definer function if it exists
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create a new security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin policy using the security definer function
CREATE POLICY "Admin can access all profiles" ON public.profiles
  FOR ALL USING (
    public.get_user_role(auth.uid()) = 'admin'
  );
