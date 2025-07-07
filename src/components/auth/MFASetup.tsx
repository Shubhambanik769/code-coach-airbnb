import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Shield, Smartphone, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MFASetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const MFASetup = ({ onComplete, onSkip }: MFASetupProps) => {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setupMFA = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setQrCodeUrl(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
      
      toast({
        title: "MFA Setup Initiated",
        description: "Please scan the QR code with your authenticator app."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "MFA Setup Complete! 🎉",
        description: "Your account is now secured with two-factor authentication."
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: "Please check your authenticator app and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Secure Your Account</CardTitle>
          <p className="text-gray-600">
            Add an extra layer of security with Two-Factor Authentication
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              MFA helps protect your account even if your password is compromised. 
              You'll need an authenticator app like Google Authenticator or Authy.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-blue-600">1</span>
              </div>
              <span>Download an authenticator app (Google Authenticator, Authy, etc.)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-blue-600">2</span>
              </div>
              <span>Scan the QR code we'll provide</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-blue-600">3</span>
              </div>
              <span>Enter the verification code from your app</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={setupMFA} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? 'Setting up...' : 'Setup MFA'}
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
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Scan QR Code</CardTitle>
        <p className="text-gray-600">
          Scan this QR code with your authenticator app
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {qrCodeUrl && (
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img 
                src={qrCodeUrl} 
                alt="MFA QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
          </div>
        )}

        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <strong>Manual setup:</strong> If you can't scan the QR code, 
            enter this secret key manually: <code className="bg-gray-100 px-1 rounded">{secret}</code>
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="verification-code" className="text-base font-medium">
            Verification Code
          </Label>
          <Input
            id="verification-code"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="mt-2 h-12 text-center text-lg tracking-widest"
            maxLength={6}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Button 
          onClick={verifyMFA} 
          disabled={loading || verificationCode.length !== 6}
          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {loading ? 'Verifying...' : 'Verify & Complete Setup'}
        </Button>

        <div className="text-center">
          <Button variant="link" onClick={() => setStep('setup')} className="text-gray-500">
            ← Back to setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MFASetup;