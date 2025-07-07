import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { 
  User, 
  FileText, 
  DollarSign, 
  MapPin, 
  Plus, 
  X, 
  Users, 
  Building, 
  Target,
  Star,
  Calendar,
  MessageCircle,
  TrendingUp,
  Shield,
  CheckCircle
} from 'lucide-react';
import Header from '@/components/Header';

const ApplyTrainer = () => {
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(!user);
  const [loading, setLoading] = useState(false);

  // Auth form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Trainer application form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    specialization: '',
    experience_years: 0,
    hourly_rate: 0,
    skills: [] as string[],
    location: '',
    timezone: 'UTC'
  });
  const [newSkill, setNewSkill] = useState('');

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: typeof formData & { userId: string }) => {
      console.log('Starting trainer application submission for user:', data.userId);
      
      // First, update user role to trainer in profiles table
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'trainer' })
        .eq('id', data.userId);

      if (roleError) {
        console.error('Error updating user role:', roleError);
        throw new Error(`Failed to update user role: ${roleError.message}`);
      }

      console.log('User role updated to trainer successfully');

      // Then create trainer profile with all required fields
      const trainerData = {
        user_id: data.userId,
        name: data.name,
        title: data.title,
        bio: data.bio || '',
        specialization: data.specialization || '',
        experience_years: data.experience_years || 0,
        hourly_rate: data.hourly_rate || 0,
        skills: data.skills || [],
        location: data.location || '',
        timezone: data.timezone || 'UTC',
        status: 'approved' // Auto-approve for smoother flow
      };

      console.log('Creating trainer profile with data:', trainerData);

      const { error: trainerError, data: trainerResult } = await supabase
        .from('trainers')
        .insert(trainerData)
        .select()
        .single();
      
      if (trainerError) {
        console.error('Error creating trainer profile:', trainerError);
        throw new Error(`Failed to create trainer profile: ${trainerError.message}`);
      }

      console.log('Trainer profile created successfully:', trainerResult);
      return trainerResult;
    },
    onSuccess: () => {
      toast({
        title: "Welcome to TrainerConnect!",
        description: "Your trainer profile has been created successfully. Redirecting to your dashboard..."
      });
      
      // Redirect to trainer dashboard after a short delay
      setTimeout(() => {
        navigate('/trainer-dashboard');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Application submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create trainer profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() && isSignUp) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      let authResult;
      
      if (isSignUp) {
        authResult = await signUp(email, password, fullName);
      } else {
        authResult = await signIn(email, password);
      }

      if (authResult.error) {
        throw authResult.error;
      }

      // If sign up was successful, show message about email verification
      if (isSignUp) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account, then return to complete your trainer profile."
        });
      }
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

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in first",
        variant: "destructive"
      });
      return;
    }

    // Enhanced validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Professional title is required",
        variant: "destructive"
      });
      return;
    }

    console.log('Submitting trainer application with form data:', formData);
    console.log('Current user:', user);

    submitApplicationMutation.mutate({
      ...formData,
      userId: user.id
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const benefits = [
    {
      icon: Users,
      title: "Instant Access to High-Quality Clients",
      items: ["Top universities and colleges", "Corporate L&D teams", "Training agencies & institutes"],
      description: "You focus on training — we bring you the clients."
    },
    {
      icon: Star,
      title: "Build Your Personal Training Brand",
      items: ["Professional profile with bio & certifications", "Ratings & reviews showcase", "Attract bookings without cold outreach"],
      description: "Showcase your expertise and get discovered by the right clients."
    },
    {
      icon: Target,
      title: "Zero Marketing Needed",
      items: ["Inbound leads delivered to you", "No ads or sales needed", "Just deliver great sessions"],
      description: "We handle client acquisition, you handle the training."
    },
    {
      icon: Calendar,
      title: "Smart Booking Calendar",
      items: ["Set availability once", "Automatic booking system", "No back-and-forth scheduling"],
      description: "Streamlined scheduling that works around your availability."
    },
    {
      icon: DollarSign,
      title: "Transparent Payments with GST",
      items: ["Set your own pricing", "Automatic GST invoicing", "Transparent commission structure"],
      description: "Fair pay with all financial processes handled automatically."
    },
    {
      icon: TrendingUp,
      title: "Track Earnings & Growth",
      items: ["Real-time dashboard", "Booking analytics", "Performance insights"],
      description: "Monitor your success and optimize your training business."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-techblue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Become a Trainer on TrainerConnect
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Share your expertise, reach quality clients, and build your training business — all in one platform
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Verified Community</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Set Your Own Rates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Quality Clients</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Zero Marketing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Trainers Choose TrainerConnect
            </h2>
            <p className="text-lg text-gray-600">
              Join a professional network that puts your success first
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-2 hover:border-techblue-200 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-techblue-100 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-techblue-600" />
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-techblue-600">500+</div>
              <div className="text-sm text-gray-600">Active Trainers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-techblue-600">95%</div>
              <div className="text-sm text-gray-600">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-techblue-600">₹50L+</div>
              <div className="text-sm text-gray-600">Trainer Earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-techblue-600">24/7</div>
              <div className="text-sm text-gray-600">Platform Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Section */}
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {!user ? "Get Started Today" : "Complete Your Trainer Profile"}
            </h2>
            <p className="text-lg text-gray-600">
              {!user ? "Create your account and join our community of professional trainers" : "You're one step away from connecting with quality clients"}
            </p>
          </div>

          {!user ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {isSignUp ? 'Create Your Trainer Account' : 'Sign In to Continue'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Create Trainer Account' : 'Sign In')}
                  </Button>
                </form>
                
                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Complete Your Trainer Profile
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Fill out your profile to start receiving bookings from quality clients
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Professional Title *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Certified Personal Trainer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <Input
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="e.g., Weight Loss, Strength Training"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years)
                      </label>
                      <Input
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                        min="0"
                        placeholder="Years of experience"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly Rate (₹)
                      </label>
                      <Input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="100"
                        placeholder="Your hourly rate in INR"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State or Remote"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Bio
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell clients about your experience, training philosophy, and what makes you unique as a trainer..."
                      rows={4}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills & Certifications
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill or certification"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button type="button" onClick={addSkill}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                            {skill} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-techblue-600 to-purple-600 hover:from-techblue-700 hover:to-purple-700" 
                    disabled={submitApplicationMutation.isPending}
                  >
                    {submitApplicationMutation.isPending ? 'Creating Profile...' : 'Complete Setup & Start Training'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="py-12 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join a Professional, Quality-First Community
            </h3>
            <p className="text-gray-600">
              We only onboard certified, verified trainers — join a respected network trusted by institutions and companies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-techblue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Verified Trainers Only</h4>
              <p className="text-sm text-gray-600">All trainers are verified and background checked</p>
            </div>
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-techblue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Secure Communication</h4>
              <p className="text-sm text-gray-600">Built-in chat system for client communication</p>
            </div>
            <div className="text-center">
              <Building className="h-12 w-12 text-techblue-600 mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Enterprise Clients</h4>
              <p className="text-sm text-gray-600">Access to corporate and institutional clients</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyTrainer;
