
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
import { User, FileText, DollarSign, MapPin, Plus, X } from 'lucide-react';
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
      // First, update user role to trainer
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'trainer' })
        .eq('id', data.userId);

      if (roleError) throw roleError;

      // Then create trainer profile
      const { error: trainerError } = await supabase
        .from('trainers')
        .insert({
          user_id: data.userId,
          name: data.name,
          title: data.title,
          bio: data.bio,
          specialization: data.specialization,
          experience_years: data.experience_years,
          hourly_rate: data.hourly_rate,
          skills: data.skills,
          location: data.location,
          timezone: data.timezone,
          status: 'approved' // Auto-approve for smoother flow
        });
      
      if (trainerError) throw trainerError;
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
      console.error('Application error:', error);
      toast({
        title: "Error",
        description: "Failed to create trainer profile. Please try again.",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Become a Trainer
            </h1>
            <p className="text-lg text-gray-600">
              Share your expertise and help others learn new skills
            </p>
          </div>

          {!user ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {isSignUp ? 'Create Your Account' : 'Sign In to Continue'}
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
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
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
                        Hourly Rate ($)
                      </label>
                      <Input
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        placeholder="Your hourly rate"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State/Country or Remote"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell students about yourself, your experience, and training philosophy..."
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
                    className="w-full" 
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
    </div>
  );
};

export default ApplyTrainer;
