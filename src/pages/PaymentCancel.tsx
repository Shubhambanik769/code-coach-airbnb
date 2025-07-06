import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. You can try again anytime.",
      variant: "destructive"
    });
  }, [toast]);

  const handleRetryPayment = () => {
    if (bookingId) {
      // Navigate back to user dashboard where they can retry payment
      navigate('/user-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Payment Cancelled</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">No Payment Processed</h3>
            <p className="text-sm text-red-700">
              You cancelled the payment process. Your booking is still pending payment.
            </p>
          </div>

          <div className="text-center text-gray-600">
            <p>No charges were made to your account. You can complete your payment anytime to confirm your booking.</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleRetryPayment}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {bookingId ? 'Complete Payment' : 'Go to Dashboard'}
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </div>

          {bookingId && (
            <div className="text-xs text-gray-500 text-center">
              Booking ID: {bookingId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancel;