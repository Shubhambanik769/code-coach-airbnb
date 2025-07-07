
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Users, 
  Star, 
  Calendar, 
  Shield, 
  TrendingUp,
  MessageCircle,
  Target,
  Building
} from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, userRole, requiresMFA } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Handle MFA requirement
    if (user && requiresMFA) {
      console.log('MFA required, redirecting to MFA flow');
      navigate('/mfa');
      return;
    }

    // Redirect authenticated users to their appropriate dashboard based on role
    if (user && userRole && !requiresMFA) {
      console.log('User authenticated with role:', userRole);
      switch (userRole) {
        case 'admin':
          navigate('/admin');
          break;
        case 'trainer':
          navigate('/trainer-dashboard');
          break;
        case 'user':
        default:
          navigate('/dashboard');
          break;
      }
    }
  }, [user, userRole, requiresMFA, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Default role for normal signup is 'user'
      const { error } = await signUp(email, password, fullName, 'user');
      if (error) throw error;

      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to confirm your account."
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Navigation will be handled by useEffect after auth state change
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

  // Don't render auth form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const benefits = [
    {
      icon: Users,
      title: "Connect with Expert Trainers",
      description: "Access certified professionals across all domains"
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "All trainers are verified with ratings & reviews"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe payments and verified trainer profiles"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-techblue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-techblue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">SL</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-gradient">Skilloop.io</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with professional trainers and transform your learning journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="signin" className="w-full">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-white shadow-md">
                <TabsTrigger value="signin" className="text-lg font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-lg font-medium">Sign Up</TabsTrigger>
              </TabsList>
            </div>

            {/* Sign In Content */}
            <TabsContent value="signin">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Welcome Content */}
                <div className="order-2 lg:order-1">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Welcome Back! 👋
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                      Continue your learning journey with our expert trainers. Sign in to access your dashboard, manage bookings, and connect with professionals.
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-techblue-600">500+</div>
                        <div className="text-sm text-gray-600">Expert Trainers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-techblue-600">95%</div>
                        <div className="text-sm text-gray-600">Satisfaction Rate</div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Secure and verified platform</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>24/7 customer support</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Flexible scheduling options</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Sign In Form */}
                <div className="order-1 lg:order-2">
                  <Card className="max-w-md mx-auto shadow-2xl border-0">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl">Sign In</CardTitle>
                      <p className="text-gray-600">Enter your credentials to continue</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignIn} className="space-y-6">
                        <div>
                          <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password" className="text-base font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="mt-2 h-12"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700 text-lg font-medium" 
                          disabled={loading}
                        >
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Sign Up Content */}
            <TabsContent value="signup">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Benefits Content */}
                <div className="order-2 lg:order-1">
                  <div className="max-w-lg mx-auto lg:mx-0">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      Join Our Learning Community 🚀
                    </h2>
                    <p className="text-lg text-gray-600 mb-8">
                      Discover expert trainers, book personalized sessions, and accelerate your professional growth with our verified community of professionals.
                    </p>
                    
                    {/* Benefits List */}
                    <div className="space-y-6 mb-8">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-techblue-100 rounded-lg flex items-center justify-center">
                            <benefit.icon className="h-6 w-6 text-techblue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                            <p className="text-gray-600 text-sm">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Benefits */}
                    <div className="bg-gradient-to-r from-techblue-50 to-purple-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">What makes us different?</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>Personalized learning paths</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                          <span>Direct communication with trainers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <span>Goal-oriented training sessions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-orange-500" />
                          <span>Corporate training solutions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Sign Up Form */}
                <div className="order-1 lg:order-2">
                  <Card className="max-w-md mx-auto shadow-2xl border-0">
                    <CardHeader className="text-center pb-6">
                      <CardTitle className="text-2xl">Create Account</CardTitle>
                      <p className="text-gray-600">Join thousands of learners today</p>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSignUp} className="space-y-6">
                        <div>
                          <Label htmlFor="fullName" className="text-base font-medium">Full Name</Label>
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-email" className="text-base font-medium">Email Address</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                            className="mt-2 h-12"
                          />
                        </div>
                        <div>
                          <Label htmlFor="signup-password" className="text-base font-medium">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Create a password (min 6 characters)"
                            minLength={6}
                            className="mt-2 h-12"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700 text-lg font-medium"
                          disabled={loading}
                        >
                          {loading ? 'Creating Account...' : 'Create Free Account'}
                        </Button>
                      </form>
                      
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                          By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Looking to share your expertise?</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/apply-trainer')}
            className="text-techblue-600 border-techblue-600 hover:bg-techblue-50"
          >
            Become a Trainer →
          </Button>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button variant="link" onClick={() => navigate('/')} className="text-gray-500">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
