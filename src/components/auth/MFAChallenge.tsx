import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MFAChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MFAChallenge = ({ onSuccess, onCancel }: MFAChallengeProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [challengeId, setChallengeId] = useState<string>('');
  const { toast } = useToast();

  const initiateMFAChallenge = async () => {
    try {
      setLoading(true);
      
      // Get MFA factors for the user
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) throw factorsError;
      
      const totpFactor = factors.totp.find(factor => factor.status === 'verified');
      
      if (!totpFactor) {
        throw new Error('No verified MFA factor found');
      }

      // Create a challenge
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      });

      if (error) throw error;

      setChallengeId(data.id);
      
      toast({
        title: "MFA Challenge Created",
        description: "Please enter the code from your authenticator app."
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

  const verifyMFACode = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: challengeId,
        challengeId,
        code: verificationCode
      });

      if (error) throw error;

      toast({
        title: "Access Granted! ✅",
        description: "MFA verification successful."
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Invalid Code",
        description: "Please check your authenticator app and try again.",
        variant: "destructive"
      });
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  // Auto-initiate challenge on component mount
  useEffect(() => {
    initiateMFAChallenge();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-techblue-50 flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
          <p className="text-gray-600">
            Enter the verification code from your authenticator app
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your account is protected by two-factor authentication. 
              Please enter the 6-digit code from your authenticator app.
            </AlertDescription>
          </Alert>

          <div>
            <Label htmlFor="mfa-code" className="text-base font-medium">
              Verification Code
            </Label>
            <Input
              id="mfa-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="mt-2 h-12 text-center text-xl tracking-widest font-mono"
              maxLength={6}
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={verifyMFACode} 
              disabled={loading || verificationCode.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button 
              variant="outline" 
              onClick={initiateMFAChallenge}
              disabled={loading}
              className="w-full h-12"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Challenge
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
              Lost access to your authenticator app? Contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MFAChallenge;