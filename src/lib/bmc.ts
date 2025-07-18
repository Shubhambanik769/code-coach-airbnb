// Buy Me a Coffee Integration Library
// Handles payment URL generation and transaction verification

interface BMCPaymentData {
  amount: number;
  message: string;
  reference: string;
  currency?: string;
}

interface BMCTransactionDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  message?: string;
  reference?: string;
}

export class BMCIntegration {
  private baseUrl = 'https://developers.buymeacoffee.com/api/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Generate BMC payment URL for booking
   * Note: BMC uses their standard payment page format
   */
  generatePaymentUrl(data: BMCPaymentData): string {
    // Buy Me Coffee uses a simple URL format: https://buymeacoffee.com/username
    // Unfortunately, BMC doesn't support fixed amounts in URL parameters
    // Users will see the amount and message on the payment page but can modify the amount
    const baseUrl = `https://www.buymeacoffee.com/skilloop.io`;
    
    // Try adding parameters that might be supported (this may not work as expected)
    const params = new URLSearchParams({
      message: data.message,
      reference: data.reference
    });
    
    // BMC's URL might not support these parameters, but we'll try
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Verify payment using BMC API
   */
  async verifyPayment(transactionId: string): Promise<BMCTransactionDetails | null> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('BMC API Error:', response.status, response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying BMC payment:', error);
      return null;
    }
  }

  /**
   * Get recent transactions for reconciliation
   */
  async getRecentTransactions(limit: number = 50): Promise<BMCTransactionDetails[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payments?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('BMC API Error:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching BMC transactions:', error);
      return [];
    }
  }

  /**
   * Format payment message for booking
   */
  static formatPaymentMessage(booking: {
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