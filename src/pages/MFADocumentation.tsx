import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MFADocumentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-techblue-50 py-12">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Two-Factor Authentication (MFA)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn how to secure your Skilloop.io account with an extra layer of protection
          </p>
        </div>

        <div className="space-y-8">
          {/* What is MFA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Key className="h-6 w-6 text-blue-600" />
                What is Two-Factor Authentication?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Two-Factor Authentication (MFA) adds an extra layer of security to your account by requiring 
                a second form of identification beyond just your password. Even if someone obtains your password, 
                they won't be able to access your account without the second factor.
              </p>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>How it works:</strong> After entering your password, you'll be prompted to enter 
                  a 6-digit code from your authenticator app. This code changes every 30 seconds.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Why Enable MFA?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Protection Against Password Breaches</h3>
                      <p className="text-gray-600 text-sm">Even if your password is compromised, your account remains secure.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure Sensitive Data</h3>
                      <p className="text-gray-600 text-sm">Protect your training history, payments, and personal information.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Industry Standard</h3>
                      <p className="text-gray-600 text-sm">Used by banks, tech companies, and security-conscious organizations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Easy to Use</h3>
                      <p className="text-gray-600 text-sm">Quick setup process and seamless daily use.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-purple-600" />
                How to Set Up MFA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-blue-600 text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Download an Authenticator App</h3>
                    <p className="text-gray-600 mb-2">Install one of these popular authenticator apps:</p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Google Authenticator (iOS/Android)</li>
                      <li>• Microsoft Authenticator (iOS/Android)</li>
                      <li>• Authy (iOS/Android/Desktop)</li>
                      <li>• 1Password (Premium feature)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-blue-600 text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enable MFA in Your Settings</h3>
                    <p className="text-gray-600">Go to your account settings and click "Enable Two-Factor Authentication".</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-blue-600 text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Scan the QR Code</h3>
                    <p className="text-gray-600">Use your authenticator app to scan the QR code we provide.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-blue-600 text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Verify and Complete</h3>
                    <p className="text-gray-600">Enter the 6-digit code from your app to complete the setup.</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Keep your authenticator app secure and consider backing up 
                  your account recovery codes in a safe place.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What happens if I lose my phone?</h3>
                <p className="text-gray-600 text-sm">
                  Contact our support team immediately. We can help you regain access to your account 
                  after verifying your identity through alternative methods.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I disable MFA later?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can disable MFA from your account settings, but we strongly recommend keeping 
                  it enabled for maximum security.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Does MFA cost extra?</h3>
                <p className="text-gray-600 text-sm">
                  No, MFA is completely free for all Skilloop.io users. It's part of our commitment 
                  to keeping your account secure.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg px-8 py-3"
            >
              <Shield className="h-5 w-5 mr-2" />
              Set Up MFA Now
            </Button>
            <p className="text-gray-500 text-sm mt-3">
              Secure your account in less than 2 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFADocumentation;