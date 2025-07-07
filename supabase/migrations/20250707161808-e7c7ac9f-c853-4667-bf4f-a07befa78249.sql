-- Clean up MFA-related database entries that are no longer needed

-- Drop MFA functions
DROP FUNCTION IF EXISTS public.user_has_mfa(uuid);
DROP FUNCTION IF EXISTS public.get_user_mfa_status();

-- Drop SMS OTP table if it exists
DROP TABLE IF EXISTS public.sms_otp_verifications;

-- Clean up any MFA-related admin configs
DELETE FROM public.admin_configs WHERE config_key LIKE '%mfa%' OR config_key LIKE '%sms%';