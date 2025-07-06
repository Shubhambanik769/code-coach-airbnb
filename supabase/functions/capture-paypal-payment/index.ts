import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, bookingId } = await req.json();

    console.log('Capturing PayPal payment for order:', orderId, 'booking:', bookingId);

    // Get PayPal credentials from environment
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const tokenResponse = await fetch(
      `https://api-m.${paypalEnvironment === 'live' ? '' : 'sandbox.'}paypal.com/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Capture PayPal payment
    const captureResponse = await fetch(
      `https://api-m.${paypalEnvironment === 'live' ? '' : 'sandbox.'}paypal.com/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!captureResponse.ok) {
      const errorData = await captureResponse.json();
      console.error('PayPal capture failed:', errorData);
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await captureResponse.json();
    const captureId = captureData.purchase_units[0]?.payments?.captures[0]?.id;
    const captureStatus = captureData.purchase_units[0]?.payments?.captures[0]?.status;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update booking with payment confirmation
    const updateData: any = {
      payment_status: captureStatus === 'COMPLETED' ? 'confirmed' : 'failed',
      payment_confirmed_at: captureStatus === 'COMPLETED' ? new Date().toISOString() : null,
      status: captureStatus === 'COMPLETED' ? 'confirmed' : 'pending'
    };

    // Add capture ID if available
    if (captureId) {
      updateData.payment_transaction_id = captureId;
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      throw new Error('Failed to update booking with payment status');
    }

    // Create notification for successful payment
    if (captureStatus === 'COMPLETED') {
      // Get booking details for notification
      const { data: booking } = await supabase
        .from('bookings')
        .select('student_id, trainer_id, training_topic')
        .eq('id', bookingId)
        .single();

      if (booking) {
        // Notify client
        await supabase.rpc('create_notification', {
          p_user_id: booking.student_id,
          p_type: 'booking_confirmed',
          p_title: 'Payment Confirmed',
          p_message: `Your payment for "${booking.training_topic}" has been confirmed.`,
          p_data: { booking_id: bookingId }
        });

        // Notify trainer
        const { data: trainer } = await supabase
          .from('trainers')
          .select('user_id')
          .eq('id', booking.trainer_id)
          .single();

        if (trainer) {
          await supabase.rpc('create_notification', {
            p_user_id: trainer.user_id,
            p_type: 'payment_received',
            p_title: 'Payment Received',
            p_message: `Payment received for training session "${booking.training_topic}".`,
            p_data: { booking_id: bookingId }
          });
        }
      }
    }

    console.log('PayPal payment captured successfully:', captureId);

    return new Response(JSON.stringify(captureData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in capture-paypal-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});