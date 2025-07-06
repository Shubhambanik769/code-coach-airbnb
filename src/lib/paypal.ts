// PayPal Integration Library
// Handles payment order creation and capture with fixed INR amounts

export interface PayPalPaymentData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  bookingId: string;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  purchase_units: Array<{
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
}

export class PayPalIntegration {
  /**
   * Format payment description for booking
   */
  static formatPaymentDescription(booking: {
    training_topic: string;
    trainer_name?: string;
    start_time: string;
  }): string {
    const date = new Date(booking.start_time).toLocaleDateString('en-IN');
    return `Training: ${booking.training_topic} with ${booking.trainer_name || 'Trainer'} on ${date}`;
  }

  /**
   * Calculate platform fees and trainer payout
   */
  static calculatePayoutBreakdown(totalAmount: number, commissionRate: number = 20) {
    const platformCommission = Math.round((totalAmount * commissionRate) / 100);
    const trainerPayout = totalAmount - platformCommission;
    
    return {
      totalAmount,
      platformCommission,
      trainerPayout,
      commissionRate
    };
  }

  /**
   * Create PayPal order via Supabase edge function
   */
  static async createOrder(paymentData: PayPalPaymentData): Promise<PayPalOrderResponse> {
    console.log('PayPal.createOrder called with:', paymentData);
    
    // Convert INR to USD for PayPal (PayPal doesn't support INR)
    const usdAmount = paymentData.currency === 'INR' 
      ? Math.round(paymentData.amount * 0.012 * 100) / 100 // Convert INR to USD
      : paymentData.amount;
    
    const paypalPaymentData = {
      ...paymentData,
      amount: usdAmount,
      currency: 'USD' // PayPal requires USD for most transactions
    };
    
    console.log('Converted payment data for PayPal:', paypalPaymentData);
    
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('Calling create-paypal-order edge function...');
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: paypalPaymentData
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('PayPal order creation error:', error);
      throw new Error(error.message || 'Failed to create PayPal order');
    }

    console.log('PayPal order created successfully:', data);
    return data;
  }

  /**
   * Capture PayPal payment via Supabase edge function
   */
  static async capturePayment(orderId: string, bookingId: string): Promise<PayPalCaptureResponse> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('capture-paypal-payment', {
      body: { orderId, bookingId }
    });

    if (error) {
      console.error('PayPal capture error:', error);
      throw new Error(error.message || 'Failed to capture PayPal payment');
    }

    return data;
  }

  /**
   * Get PayPal approval URL from order response
   */
  static getApprovalUrl(orderResponse: PayPalOrderResponse): string | null {
    const approvalLink = orderResponse.links.find(link => link.rel === 'approve');
    return approvalLink?.href || null;
  }
}

// Helper function to format currency in Indian Rupees
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Helper function to create booking reference
export const createBookingReference = (bookingId: string): string => {
  return `BK-${bookingId.slice(0, 8).toUpperCase()}`;
};