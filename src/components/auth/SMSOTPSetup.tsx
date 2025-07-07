import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface SMSOTPSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const SMSOTPSetup = ({ onComplete, onSkip }: SMSOTPSetupProps) => {
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendOTP = async () => {
    try {
      setLoading(true);
      
      // Call edge function to send OTP
      const { data, error } = await supabase.functions.invoke('send-sms-otp', {
        body: { phoneNumber }
      });

      if (error) throw error;

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`
      });
      
      setStep('verify');
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
      
      // Call edge function to verify OTP
      const { data, error } = await supabase.functions.invoke('verify-sms-otp', {
        body: { phoneNumber, code: verificationCode }
      });

      if (error) throw error;

      toast({
        title: "Phone Verified! 🎉",
        description: "Your phone number has been verified for SMS OTP."
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: "Please check the code and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Setup SMS Authentication</CardTitle>
          <p className="text-gray-600">
            Add your mobile number for SMS-based two-factor authentication
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You'll receive a verification code via SMS whenever you sign in. 
              Make sure you have access to this number.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="phone" className="text-base font-medium">
              Mobile Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="mt-2 h-12"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">
              Include country code (e.g., +1 for US, +44 for UK)
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={sendOTP} 
              disabled={loading || !phoneNumber.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip} className="flex-1">
                Skip for now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Verify Your Number</CardTitle>
        <p className="text-gray-600">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="verification-code" className="text-base font-medium">
            Verification Code
          </Label>
          <Input
            id="verification-code"
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
            {loading ? 'Verifying...' : 'Verify & Complete Setup'}
          </Button>

          <Button 
            variant="outline" 
            onClick={sendOTP}
            disabled={loading}
            className="w-full h-12"
          >
            Resend Code
          </Button>

          <Button variant="link" onClick={() => setStep('phone')} className="w-full text-gray-500">
            ← Change Phone Number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SMSOTPSetup;