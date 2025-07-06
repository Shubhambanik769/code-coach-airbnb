import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PayPalIntegration } from '@/lib/paypal';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const bookingId = searchParams.get('booking_id');
  const orderId = searchParams.get('token'); // PayPal returns token as order ID

  useEffect(() => {
    if (!bookingId || !orderId) {
      setPaymentStatus('error');
      setIsProcessing(false);
      return;
    }

    const processPayment = async () => {
      try {
        console.log('Processing payment for booking:', bookingId, 'Order:', orderId);
        
        // Capture the payment
        const captureResult = await PayPalIntegration.capturePayment(orderId, bookingId);
        console.log('Payment capture result:', captureResult);

        // Fetch updated booking details
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            trainers!inner (
              name,
              user_id
            )
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) {
          throw new Error('Failed to fetch booking details');
        }

        setBookingDetails(booking);
        setPaymentStatus('success');
        
        toast({
          title: "Payment Successful!",
          description: "Your booking has been confirmed. The trainer will contact you soon.",
        });

      } catch (error: any) {
        console.error('Payment processing error:', error);
        setPaymentStatus('error');
        toast({
          title: "Payment Processing Error",
          description: error.message || "Failed to process payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [bookingId, orderId, toast]);

  const handleContinue = () => {
    navigate('/user-dashboard');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment with PayPal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {paymentStatus === 'success' ? (
              <CheckCircle className="h-16 w-16 text-green-600" />
            ) : (
              <AlertCircle className="h-16 w-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Payment Error'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {paymentStatus === 'success' && bookingDetails ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Booking Confirmed</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div><strong>Training:</strong> {bookingDetails.training_topic}</div>
                  <div><strong>Trainer:</strong> {bookingDetails.trainers.name}</div>
                  <div><strong>Date:</strong> {new Date(bookingDetails.start_time).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> {new Date(bookingDetails.start_time).toLocaleTimeString()}</div>
                </div>
              </div>
              
              <div className="text-center text-gray-600">
                <p>Your trainer will contact you soon to coordinate the session details.</p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Payment Failed</h3>
              <p className="text-sm text-red-700">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleContinue}
              className="flex-1"
              variant={paymentStatus === 'success' ? 'default' : 'outline'}
            >
              {paymentStatus === 'success' ? 'Go to Dashboard' : 'Try Again'}
            </Button>
            
            {paymentStatus === 'error' && (
              <Button 
                onClick={() => window.location.href = 'mailto:support@skilloop.com'}
                variant="outline"
                className="flex-1"
              >
                Contact Support
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;