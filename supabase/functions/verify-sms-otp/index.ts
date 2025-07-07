import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, code }: VerifyOTPRequest = await req.json();

    if (!phoneNumber || !code) {
      throw new Error('Phone number and code are required');
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Verify OTP from database
    const { data: otpRecord, error: otpError } = await supabase
      .from('sms_otp_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', phoneNumber)
      .eq('otp_code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (otpError || !otpRecord) {
      throw new Error('Invalid or expired OTP code');
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('sms_otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('Error updating OTP record:', updateError);
      throw new Error('Failed to verify OTP');
    }

    // Update user profile with verified phone number
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        phone: phoneNumber,
        phone_verified: true 
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't throw here, as OTP is already verified
    }

    console.log(`OTP verified for user ${user.id} phone ${phoneNumber}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP verified successfully',
        phoneNumber 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in verify-sms-otp function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);