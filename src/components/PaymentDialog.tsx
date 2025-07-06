import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { formatINR } from '@/lib/bmc';
import { format } from 'date-fns';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    training_topic: string;
    total_amount: number;
    start_time: string;
    duration_hours: number;
    bmc_payment_url: string | null;
    bmc_payment_status: string | null;
    trainer_name: string;
  };
  onPaymentCompleted?: () => void;
}

const PaymentDialog = ({ isOpen, onClose, booking, onPaymentCompleted }: PaymentDialogProps) => {
  const handlePaymentClick = () => {
    if (booking.bmc_payment_url) {
      window.open(booking.bmc_payment_url, '_blank');
    }
  };

  const getStatusIcon = () => {
    switch (booking.bmc_payment_status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusText = () => {
    switch (booking.bmc_payment_status) {
      case 'confirmed':
        return 'Payment Confirmed';
      case 'pending':
        return 'Payment Pending';
      default:
        return 'Payment Required';
    }
  };

  const getStatusColor = () => {
    switch (booking.bmc_payment_status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon()}
            Complete Your Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-semibold text-gray-900">{booking.training_topic}</div>
                <div className="text-sm text-gray-600">with {booking.trainer_name}</div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {format(new Date(booking.start_time), 'MMM d, yyyy • h:mm a')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{booking.duration_hours} hour(s)</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="font-bold text-xl text-primary">{formatINR(booking.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              <span className="font-semibold">{getStatusText()}</span>
            </div>
            
            {booking.bmc_payment_status === 'confirmed' ? (
              <div className="space-y-3">
                <p className="text-sm">Your booking has been confirmed! The trainer will contact you soon.</p>
                <Button 
                  onClick={() => {
                    onPaymentCompleted?.();
                    onClose();
                  }}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continue to Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm">
                  {booking.bmc_payment_status === 'pending' 
                    ? 'Complete your payment to confirm this booking.'
                    : 'Click below to complete your payment and confirm this booking.'
                  }
                </p>
                
                {booking.bmc_payment_url && (
                  <Button 
                    onClick={handlePaymentClick}
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Pay {formatINR(booking.total_amount)}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full"
                >
                  I'll Pay Later
                </Button>
              </div>
            )}
          </div>

          {/* Payment Note */}
          <div className="text-xs text-gray-500 text-center">
            Secure payment powered by Buy Me a Coffee. You'll be redirected to complete your payment.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;