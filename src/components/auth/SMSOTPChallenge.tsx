import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface SMSOTPChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
  phoneNumber: string;
}

const SMSOTPChallenge = ({ onSuccess, onCancel, phoneNumber }: SMSOTPChallengeProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const sendOTP = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-sms-otp', {
        body: { phoneNumber }
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('verify-sms-otp', {
        body: { phoneNumber, code: verificationCode }
      });

      if (error) throw error;

      toast({
        title: "Access Granted! ✅",
        description: "SMS verification successful."
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: "Please check the SMS code and try again.",
        variant: "destructive"
      });
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // Auto-send OTP on component mount
  useState(() => {
    if (!otpSent) {
      sendOTP();
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-techblue-50 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">SMS Verification</CardTitle>
          <p className="text-gray-600">
            Enter the verification code sent to {phoneNumber}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your account is protected by SMS verification. 
              Please enter the 6-digit code from your text message.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="sms-code" className="text-base font-medium">
              Verification Code
            </Label>
            <Input
              id="sms-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="mt-2 h-12 text-center text-xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the 6-digit code from the SMS
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={verifyOTP} 
              disabled={loading || verificationCode.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button 
              variant="outline" 
              onClick={sendOTP}
              disabled={loading}
              className="w-full h-12"
            >
              {loading ? 'Sending...' : 'Resend Code'}
            </Button>

            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-full h-12 text-gray-500"
            >
              Cancel & Sign Out
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSOTPChallenge;