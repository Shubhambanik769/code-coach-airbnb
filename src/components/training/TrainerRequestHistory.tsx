
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TrainingRequestHistory {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  duration_hours: number;
  budget_min: number;
  budget_max: number;
  status: string;
  created_at: string;
  application_status: string;
  proposed_price: number;
  applied_at: string;
  booking_status?: string;
  client_profile: {
    full_name: string;
    email: string;
  };
}

const TrainerRequestHistory = () => {
  const { user } = useAuth();

  const { data: history, isLoading } = useQuery({
    queryKey: ['trainer-request-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching request history for user:', user.id);

      // First get the trainer ID
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!trainer) {
        console.log('No trainer found for user');
        return [];
      }

      console.log('Found trainer:', trainer.id);

      // Get all applications with request details
      const { data, error } = await supabase
        .from('training_applications')
        .select(`
          id,
          proposed_price,
          created_at,
          status,
          training_request:training_requests(
            id,
            title,
            description,
            target_audience,
            duration_hours,
            budget_min,
            budget_max,
            status,
            created_at,
            client_profile:profiles!client_id(full_name, email)
          )
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching request history:', error);
        return [];
      }

      console.log('Request history fetched:', data);

      // Get booking status for each application
      const enrichedData = await Promise.all(
        data?.map(async (app) => {
          let bookingStatus = null;
          
          if (app.status === 'selected' && app.training_request) {
            // Check if there's a booking for this trainer and request
            const { data: booking } = await supabase
              .from('bookings')
              .select('status')
              .eq('trainer_id', trainer.id)
              .eq('training_topic', app.training_request.title)
              .maybeSingle();

            if (booking) {
              bookingStatus = booking.status;
            }
          }

          return {
            ...app,
            booking_status: bookingStatus
          };
        }) || []
      );

      // Filter to show only completed lifecycle applications (rejected or booking completed)
      const completedApplications = enrichedData.filter(app => {
        if (!app.training_request) return false;
        
        // Show rejected applications
        if (app.status === 'rejected') return true;
        
        // Show applications where booking is completed
        if (app.booking_status === 'completed') return true;
        
        return false;
      });

      return completedApplications.map(app => ({
        id: app.training_request.id,
        title: app.training_request.title,
        description: app.training_request.description,
        target_audience: app.training_request.target_audience,
        duration_hours: app.training_request.duration_hours,
        budget_min: app.training_request.budget_min,
        budget_max: app.training_request.budget_max,
        status: app.training_request.status,
        created_at: app.training_request.created_at,
        application_status: app.status,
        proposed_price: app.proposed_price,
        applied_at: app.created_at,
        booking_status: app.booking_status,
        client_profile: app.training_request.client_profile
      }));
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'trainer_selected': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionStatus = (applicationStatus: string, bookingStatus?: string) => {
    if (applicationStatus === 'rejected') {
      return { label: 'Application Rejected', color: 'bg-red-100 text-red-800' };
    }
    if (bookingStatus === 'completed') {
      return { label: 'Training Completed', color: 'bg-purple-100 text-purple-800' };
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading request history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Training Request History ({history?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No completed applications found</p>
            <p className="text-sm text-gray-400 mt-2">
              Rejected applications and completed trainings will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history?.map((request) => {
              const completionStatus = getCompletionStatus(request.application_status, request.booking_status);
              
              return (
                <Card key={`${request.id}-${request.applied_at}`} className="border-l-4 border-l-gray-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getApplicationStatusColor(request.application_status)}>
                            Application: {request.application_status}
                          </Badge>
                          {completionStatus && (
                            <Badge className={completionStatus.color}>
                              {completionStatus.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{request.description}</p>
                        <div className="text-sm text-gray-500 mb-2">
                          Client: {request.client_profile?.full_name || 'N/A'} ({request.client_profile?.email || 'N/A'})
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.target_audience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.duration_hours}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          Budget: ${request.budget_min}-${request.budget_max}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Your Bid: ${request.proposed_price}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Request Posted: {format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Applied: {format(new Date(request.applied_at), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerRequestHistory;
