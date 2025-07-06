import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PayPalIntegration } from '@/lib/paypal';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { formatINR } from '@/lib/paypal';

interface PaymentStatusProps {
  bookingId: string;
}

interface BookingWithPayment {
  id: string;
  training_topic: string;
  total_amount: number;
  payment_url: string | null;
  payment_status: string | null;
  payment_transaction_id: string | null;
  status: string | null;
  start_time: string;
  trainers: {
    name: string;
  };
}

const PaymentStatus = ({ bookingId }: PaymentStatusProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch booking with payment details
  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['booking-payment-status', bookingId],
    queryFn: async (): Promise<BookingWithPayment> => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          training_topic,
          total_amount,
          payment_url,
          payment_status,
          payment_transaction_id,
          status,
          start_time,
          trainers!inner (name)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      return data as BookingWithPayment;
    },
    enabled: !!bookingId,
    refetchInterval: 30000, // Poll every 30s for pending payments
  });

  const handlePayPayPal = async () => {
    setIsVerifying(true);
    try {
      const orderData = await PayPalIntegration.createOrder({
        amount: booking.total_amount,
        currency: 'INR',
        description: PayPalIntegration.formatPaymentDescription({
          training_topic: booking.training_topic,
          trainer_name: booking.trainers.name,
          start_time: booking.start_time
        }),
        reference: `BK-${booking.id.slice(0, 8).toUpperCase()}`,
        bookingId: booking.id
      });

      const approvalUrl = PayPalIntegration.getApprovalUrl(orderData);
      if (approvalUrl) {
        window.open(approvalUrl, '_blank');
        toast({
          title: "Redirected to PayPal",
          description: "Complete your payment to confirm the booking"
        });
      } else {
        throw new Error('No approval URL received from PayPal');
      }
    } catch (error: any) {
      console.error('PayPal payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to create PayPal payment",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!booking?.payment_transaction_id) {
      toast({
        title: "No Transaction ID",
        description: "Please complete the payment first",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('capture-paypal-payment', {
        body: { 
          orderId: booking.payment_transaction_id, 
          bookingId: booking.id 
        }
      });

      if (error) throw error;

      toast({
        title: "Payment Verified!",
        description: "Your booking has been confirmed"
      });
      refetch();
    } catch (error: any) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify payment",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Booking not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Status
          <Badge className={getStatusColor(booking.payment_status)}>
            {getStatusText(booking.payment_status)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-gray-700">Booking Details</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Session:</strong> {booking.training_topic}</div>
            <div><strong>Trainer:</strong> {booking.trainers.name}</div>
            <div><strong>Amount:</strong> {formatINR(booking.total_amount)}</div>
            <div><strong>Date:</strong> {new Date(booking.start_time).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        {/* Payment Status */}
        {booking.payment_status === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Payment Required</span>
            </div>
            
            {booking.payment_url ? (
              <Button 
                className="w-full" 
                onClick={() => window.open(booking.payment_url!, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Continue Payment ({formatINR(booking.total_amount)})
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handlePayPayPal}
                disabled={isVerifying}
              >
                {isVerifying ? 'Creating PayPal Order...' : 'Pay with PayPal'}
              </Button>
            )}

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mr-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleVerifyPayment}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Payment'}
              </Button>
            </div>
          </div>
        )}

        {booking.payment_status === 'confirmed' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Payment Confirmed</span>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800">
                Your booking has been confirmed! The trainer will contact you soon.
              </p>
              {booking.payment_transaction_id && (
                <p className="text-sm text-green-600 mt-2">
                  Transaction ID: {booking.payment_transaction_id}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;