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
    console.log('PayPal order creation function called');
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { amount, currency, description, reference, bookingId } = requestBody;

    if (!amount || !currency || !bookingId) {
      console.error('Missing required fields:', { amount, currency, bookingId });
      throw new Error('Missing required fields: amount, currency, or bookingId');
    }

    console.log('Creating PayPal order for booking:', bookingId, 'Amount:', amount, currency);

    // Get PayPal credentials from environment
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';

    console.log('PayPal credentials check:', {
      hasClientId: !!paypalClientId,
      hasClientSecret: !!paypalClientSecret,
      environment: paypalEnvironment
    });

    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials missing:', { 
        paypalClientId: paypalClientId ? 'SET' : 'MISSING',
        paypalClientSecret: paypalClientSecret ? 'SET' : 'MISSING'
      });
      throw new Error('PayPal credentials not configured. Please check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in Supabase secrets.');
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

    // Create PayPal order with correct schema
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: reference,
          description: description,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: bookingId,
        },
      ],
      application_context: {
        brand_name: 'Skilloop Training Platform',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: `${req.headers.get('origin')}/payment/success?booking_id=${bookingId}&token={token}`,
        cancel_url: `${req.headers.get('origin')}/payment/cancel?booking_id=${bookingId}`,
      },
    };

    const orderResponse = await fetch(
      `https://api-m.${paypalEnvironment === 'live' ? '' : 'sandbox.'}paypal.com/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      }
    );

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('PayPal order creation failed:', errorData);
      console.error('PayPal error details:', JSON.stringify(errorData, null, 2));
      
      // Log the request data that caused the error
      console.error('Request data that failed:', JSON.stringify(orderData, null, 2));
      
      throw new Error(`PayPal API Error: ${errorData.message || 'Failed to create PayPal order'}`);
    }

    const order = await orderResponse.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update booking with PayPal order ID and payment URL
    const approvalLink = order.links.find((link: any) => link.rel === 'approve');
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_url: approvalLink?.href || null,
        payment_transaction_id: order.id,
        payment_status: 'pending'
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      throw new Error('Failed to update booking with PayPal order');
    }

    console.log('PayPal order created successfully:', order.id);

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-paypal-order function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});