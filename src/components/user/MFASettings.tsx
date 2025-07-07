import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useMFA } from '@/hooks/useMFA';
import MFASetup from '@/components/auth/MFASetup';
import { useToast } from '@/hooks/use-toast';

const MFASettings = () => {
  const { mfaFactors, hasMFA, loading, disableMFA, checkMFAStatus } = useMFA();
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();

  const handleSetupComplete = () => {
    setShowSetup(false);
    checkMFAStatus();
    toast({
      title: "MFA Setup Complete! 🎉",
      description: "Your account is now protected with two-factor authentication."
    });
  };

  const handleDisableMFA = async (factorId: string) => {
    if (window.confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      await disableMFA(factorId);
    }
  };

  if (showSetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <MFASetup 
          onComplete={handleSetupComplete}
          onSkip={() => setShowSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
              <p className="text-gray-600">Add an extra layer of security to your account</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasMFA ? (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommended:</strong> Enable two-factor authentication to protect your account 
                  from unauthorized access, even if your password is compromised.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Benefits of Two-Factor Authentication:</h3>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Protect against password breaches</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Secure access to sensitive data</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Works with popular authenticator apps</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Quick and easy verification process</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowSetup(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                disabled={loading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Great!</strong> Your account is protected with two-factor authentication. 
                  You'll need to enter a code from your authenticator app when signing in.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold">Active MFA Methods:</h3>
                {mfaFactors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Settings className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Authenticator App</div>
                        <div className="text-sm text-gray-500">
                          {factor.friendly_name || 'TOTP Authenticator'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisableMFA(factor.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Disable
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Recovery Information</h4>
                <p className="text-sm text-blue-700">
                  If you lose access to your authenticator app, contact our support team 
                  for assistance in recovering your account.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MFASettings;