
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrainerOnboardingStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: trainerProfile, isLoading } = useQuery({
    queryKey: ['trainer-profile', user?.id],
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application status...</p>
        </div>
      </div>
    );
  }

  if (!trainerProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Become a Trainer</CardTitle>
              <p className="text-gray-600">
                You haven't submitted a trainer application yet
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Ready to share your expertise?</h3>
                <p className="text-gray-600 mb-4">
                  Join thousands of trainers helping students master new skills
                </p>
                <Button onClick={() => navigate('/apply-trainer')} size="lg">
                  Start Your Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          title: 'Application Under Review',
          description: 'Our team is reviewing your application. This typically takes 2-3 business days.',
          badge: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
          color: 'border-yellow-200 bg-yellow-50'
        };
      case 'approved':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'Application Approved!',
          description: 'Congratulations! Your trainer application has been approved. You can now start accepting bookings.',
          badge: <Badge className="bg-green-100 text-green-800">Approved</Badge>,
          color: 'border-green-200 bg-green-50'
        };
      case 'rejected':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          title: 'Application Not Approved',
          description: 'Your application needs improvement. You can reapply after 6 months or take our trainer preparation course.',
          badge: <Badge className="bg-red-100 text-red-800">Rejected</Badge>,
          color: 'border-red-200 bg-red-50'
        };
      case 'suspended':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          title: 'Account Suspended',
          description: 'Your trainer account has been temporarily suspended. Please contact support for more information.',
          badge: <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>,
          color: 'border-orange-200 bg-orange-50'
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-gray-500" />,
          title: 'Status Unknown',
          description: 'Please contact support for assistance.',
          badge: <Badge variant="secondary">Unknown</Badge>,
          color: 'border-gray-200 bg-gray-50'
        };
    }
  };

  const statusInfo = getStatusInfo(trainerProfile.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Trainer Application Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Card */}
            <div className={`border-2 rounded-lg p-6 text-center ${statusInfo.color}`}>
              <div className="flex justify-center mb-4">
                {statusInfo.icon}
              </div>
              <div className="space-y-2 mb-4">
                {statusInfo.badge}
                <h3 className="text-xl font-semibold">{statusInfo.title}</h3>
                <p className="text-gray-600">{statusInfo.description}</p>
              </div>
              
              {trainerProfile.status === 'rejected' && (
                <div className="space-y-3 mt-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Next Steps:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Reapply after 6 months (next eligible date will be shown here)</span>
                      </div>
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm">
                          Take Trainer Prep Course
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {trainerProfile.status === 'approved' && (
                <div className="mt-6">
                  <Button onClick={() => navigate('/trainer')} size="lg">
                    Go to Trainer Dashboard
                  </Button>
                </div>
              )}
            </div>

            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="text-gray-600">{trainerProfile.title}</p>
                  </div>
                  <div>
                    <span className="font-medium">Specialization:</span>
                    <p className="text-gray-600">{trainerProfile.specialization}</p>
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span>
                    <p className="text-gray-600">{trainerProfile.experience_years} years</p>
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span>
                    <p className="text-gray-600">${trainerProfile.hourly_rate}/hour</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Submitted:</span>
                    <p className="text-gray-600">
                      {new Date(trainerProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {trainerProfile.skills && (
                  <div>
                    <span className="font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trainerProfile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Support */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Have questions about your application?
              </p>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerOnboardingStatus;
