import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transactionId, bookingId } = await req.json()
    
    if (!transactionId || !bookingId) {
      throw new Error('Missing required parameters')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get BMC access token from secrets
    const bmcToken = Deno.env.get('BMC_ACCESS_TOKEN')
    if (!bmcToken) {
      throw new Error('BMC access token not configured')
    }

    // Verify payment with BMC API
    const bmcResponse = await fetch(`https://developers.buymeacoffee.com/api/v1/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${bmcToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!bmcResponse.ok) {
      throw new Error('Failed to verify payment with BMC')
    }

    const paymentData = await bmcResponse.json()
    
    // Check if payment is successful
    if (paymentData.status === 'completed' || paymentData.status === 'paid') {
      // Update booking with payment confirmation
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          bmc_transaction_id: transactionId,
          bmc_payment_status: 'confirmed',
          bmc_payment_confirmed_at: new Date().toISOString(),
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', bookingId)

      if (updateError) {
        throw new Error(`Failed to update booking: ${updateError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment verified and booking confirmed',
          paymentData 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment not completed',
          status: paymentData.status 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

  } catch (error) {
    console.error('Error verifying BMC payment:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})