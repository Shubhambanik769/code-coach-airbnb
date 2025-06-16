
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, CheckCircle, FileText } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/Header';
import PlatformBenefits from './PlatformBenefits';

const trainerApplicationSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  specialization: z.string().min(2, 'Specialization is required'),
  experienceYears: z.number().min(0, 'Experience must be 0 or more years').max(50, 'Maximum 50 years'),
  hourlyRate: z.number().min(10, 'Minimum rate is $10/hour').max(1000, 'Maximum rate is $1000/hour'),
  bio: z.string().min(50, 'Bio must be at least 50 characters').max(1000, 'Bio must be less than 1000 characters'),
  skills: z.string().min(2, 'Please list your skills'),
  location: z.string().min(2, 'Location is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  certificationDocuments: z.array(z.string()).min(1, 'At least one certification document is required'),
  identityProof: z.string().min(1, 'Identity proof is required'),
  demoVideoUrl: z.string().url('Please provide a valid demo video URL').optional().or(z.literal(''))
});

type TrainerApplicationData = z.infer<typeof trainerApplicationSchema>;

const specializations = [
  'Software Development',
  'Data Science',
  'Machine Learning',
  'Cybersecurity',
  'Cloud Computing',
  'Mobile Development',
  'Web Development',
  'DevOps',
  'Product Management',
  'Digital Marketing',
  'UI/UX Design',
  'Project Management'
];

const timezones = [
  'UTC-8 (PST)',
  'UTC-5 (EST)',
  'UTC+0 (GMT)',
  'UTC+1 (CET)',
  'UTC+5:30 (IST)',
  'UTC+8 (CST)',
  'UTC+9 (JST)',
  'UTC+10 (AEST)'
];

const TrainerApplicationForm = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{[key: string]: boolean}>({});
  const [showForm, setShowForm] = useState(false);

  // Check if user already has a trainer application
  const { data: existingApplication, isLoading: applicationLoading } = useQuery({
    queryKey: ['trainer-application', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user
  });

  // If user is not logged in, show login prompt
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <PlatformBenefits />
            
            <div className="mt-8">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">Ready to Become a Trainer?</CardTitle>
                  <p className="text-gray-600">
                    Sign in or create an account to start your trainer application
                  </p>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="space-y-4">
                    <Button 
                      onClick={() => navigate('/auth')} 
                      size="lg" 
                      className="w-full max-w-xs"
                    >
                      Sign In to Apply
                    </Button>
                    <p className="text-sm text-gray-500">
                      Don't have an account? You can create one during the sign-in process.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in and has an application, redirect to status page
  if (user && !applicationLoading && existingApplication) {
    navigate('/trainer-status');
    return null;
  }

  // Loading state
  if (authLoading || applicationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const form = useForm<TrainerApplicationData>({
    resolver: zodResolver(trainerApplicationSchema),
    defaultValues: {
      title: '',
      specialization: '',
      experienceYears: 0,
      hourlyRate: 50,
      bio: '',
      skills: '',
      location: '',
      timezone: '',
      certificationDocuments: [],
      identityProof: '',
      demoVideoUrl: ''
    }
  });

  const handleFileUpload = async (file: File, type: 'certification' | 'identity') => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
    
    setUploadingFiles(prev => ({ ...prev, [type]: true }));

    try {
      const { error: uploadError } = await supabase.storage
        .from('trainer-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('trainer-documents')
        .getPublicUrl(fileName);

      setUploadingFiles(prev => ({ ...prev, [type]: false }));
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => ({ ...prev, [type]: false }));
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const onSubmit = async (data: TrainerApplicationData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const skillsArray = data.skills.split(',').map(skill => skill.trim());

      const { error } = await supabase
        .from('trainers')
        .insert({
          user_id: user.id,
          title: data.title,
          specialization: data.specialization,
          experience_years: data.experienceYears,
          hourly_rate: data.hourlyRate,
          bio: data.bio,
          skills: skillsArray,
          location: data.location,
          timezone: data.timezone,
          certification_documents: data.certificationDocuments,
          demo_video_url: data.demoVideoUrl || null,
          status: 'pending'
        });

      if (error) throw error;

      // Update user role to trainer
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'trainer' })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Application Submitted!",
        description: "Your trainer application has been submitted for review."
      });

      navigate('/trainer');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PlatformBenefits />
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Trainer Application Form</CardTitle>
                <p className="text-gray-600 text-center">
                  Tell us about your expertise and experience
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Senior Software Engineer, Data Scientist" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialization</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your area of expertise" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {specializations.map((spec) => (
                                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="experienceYears"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Experience</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hourlyRate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hourly Rate (USD)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="50"
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your background, experience, and what makes you a great trainer..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum 50 characters. This will be shown to potential students.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills & Technologies</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="React, Node.js, Python, AWS, Docker..."
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Separate skills with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location & Availability */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Location & Availability</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., New York, USA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Document Uploads */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Required Documents</h3>
                      
                      <FormField
                        control={form.control}
                        name="certificationDocuments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certification Documents</FormLabel>
                            <FormControl>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <div className="space-y-2">
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    disabled={uploadingFiles.certification}
                                    onClick={() => document.getElementById('cert-upload')?.click()}
                                  >
                                    {uploadingFiles.certification ? 'Uploading...' : 'Upload Certifications'}
                                  </Button>
                                  <p className="text-sm text-gray-500">
                                    Upload relevant certifications, degrees, or training certificates
                                  </p>
                                </div>
                                <input
                                  id="cert-upload"
                                  type="file"
                                  multiple
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files || []);
                                    const uploadPromises = files.map(file => handleFileUpload(file, 'certification'));
                                    const urls = await Promise.all(uploadPromises);
                                    const validUrls = urls.filter(url => url !== null) as string[];
                                    field.onChange([...field.value, ...validUrls]);
                                  }}
                                />
                                {field.value.length > 0 && (
                                  <div className="mt-4 space-y-2">
                                    {field.value.map((url, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        Certification {index + 1} uploaded
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="identityProof"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identity Proof</FormLabel>
                            <FormControl>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <div className="space-y-2">
                                  <Button 
                                    type="button" 
                                    variant="outline"
                                    disabled={uploadingFiles.identity}
                                    onClick={() => document.getElementById('id-upload')?.click()}
                                  >
                                    {uploadingFiles.identity ? 'Uploading...' : 'Upload ID Proof'}
                                  </Button>
                                  <p className="text-sm text-gray-500">
                                    Upload government-issued ID (passport, driver's license)
                                  </p>
                                </div>
                                <input
                                  id="id-upload"
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = await handleFileUpload(file, 'identity');
                                      if (url) field.onChange(url);
                                    }
                                  }}
                                />
                                {field.value && (
                                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    Identity proof uploaded
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Optional Demo Video */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Demo Video (Optional)</h3>
                      
                      <FormField
                        control={form.control}
                        name="demoVideoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Demo Video URL</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://youtube.com/watch?v=..."
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Share a video showcasing your teaching style (YouTube, Vimeo, etc.)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerApplicationForm;
