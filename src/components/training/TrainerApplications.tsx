
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, DollarSign, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import ApplicationStatusBar from './ApplicationStatusBar';

interface TrainerApplication {
  id: string;
  proposed_price: number;
  proposed_start_date: string;
  proposed_end_date: string;
  proposed_duration_hours: number;
  availability_notes: string;
  message_to_client: string;
  proposed_syllabus: string;
  status: string;
  created_at: string;
  training_request: {
    id: string;
    title: string;
    description: string;
    target_audience: string;
    expected_start_date: string;
    expected_end_date: string;
    duration_hours: number;
    delivery_mode: string;
    budget_min: number;
    budget_max: number;
    status: string;
    created_at: string;
    location: string;
    client_profile: {
      full_name: string;
      email: string;
    };
  } | null;
  booking_id?: string;
}

const TrainerApplications = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  // Get trainer ID for the current user
  const { data: trainer } = useQuery({
    queryKey: ['current-trainer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching trainer:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch trainer's applications with booking status
  const { data: applications, isLoading } = useQuery({
    queryKey: ['trainer-applications', trainer?.id, statusFilter],
    queryFn: async () => {
      if (!trainer?.id) return [];
      
      console.log('Fetching applications for trainer:', trainer.id);
      
      // First get all applications for this trainer
      let applicationQuery = supabase
        .from('training_applications')
        .select('*')
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        applicationQuery = applicationQuery.eq('status', statusFilter);
      }

      const { data: applicationsData, error: applicationsError } = await applicationQuery;

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        return [];
      }

      if (!applicationsData || applicationsData.length === 0) {
        console.log('No applications found for trainer:', trainer.id);
        return [];
      }

      console.log('Applications fetched:', applicationsData);

      // Get all unique request IDs
      const requestIds = [...new Set(applicationsData.map(app => app.request_id))];
      console.log('Fetching training requests for IDs:', requestIds);

      // Fetch training requests separately
      const { data: requestsData, error: requestsError } = await supabase
        .from('training_requests')
        .select(`
          *,
          client_profile:profiles!client_id(full_name, email)
        `)
        .in('id', requestIds);

      if (requestsError) {
        console.error('Error fetching training requests:', requestsError);
      }

      console.log('Training requests fetched:', requestsData);

      // Check for related bookings for selected applications
      const enrichedApplications = await Promise.all(
        applicationsData.map(async (app) => {
          // Find the matching training request
          const trainingRequest = requestsData?.find(req => req.id === app.request_id) || null;
          
          let bookingId = null;
          if (app.status === 'selected' && trainingRequest) {
            // Check if there's a booking for this trainer and request
            const { data: booking } = await supabase
              .from('bookings')
              .select('id, status')
              .eq('trainer_id', trainer.id)
              .eq('training_topic', trainingRequest.title)
              .eq('status', 'confirmed')
              .maybeSingle();

            if (booking) {
              bookingId = booking.id;
            }
          }

          return {
            ...app,
            training_request: trainingRequest,
            booking_id: bookingId,
            status: bookingId ? 'booking_confirmed' : app.status
          };
        })
      );
      
      console.log('Final enriched applications:', enrichedApplications);
      return enrichedApplications as TrainerApplication[];
    },
    enabled: !!trainer?.id
  });

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!trainer) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Loading trainer data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Applications ({applications?.length || 0})
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="selected">Selected</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading your applications...</div>
        ) : applications?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? "You haven't applied to any training requests yet"
                : `No applications with status: ${statusFilter}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications?.map((application) => {
              return (
                <Card key={application.id} className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    {/* Status Bar */}
                    <div className="mb-6">
                      <ApplicationStatusBar
                        status={application.status}
                        createdAt={application.created_at}
                        bookingId={application.booking_id}
                      />
                    </div>

                    {/* Application Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {application.training_request?.title || 'Training Request (Deleted)'}
                          </h3>
                          {application.training_request && (
                            <Badge className={getRequestStatusColor(application.training_request.status)}>
                              Request: {application.training_request.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          {application.training_request?.description || 'Training request details not available'}
                        </p>
                        {application.training_request?.client_profile && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>Client: {application.training_request.client_profile.full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Your Quote</span>
                        </div>
                        <p className="text-lg font-bold text-green-700">${application.proposed_price}</p>
                        {application.training_request && application.training_request.budget_min > 0 && (
                          <p className="text-xs text-green-600">
                            Budget: ${application.training_request.budget_min} - ${application.training_request.budget_max}
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Duration</span>
                        </div>
                        <p className="text-lg font-bold text-blue-700">
                          {application.proposed_duration_hours || application.training_request?.duration_hours || 'N/A'}h
                        </p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">Audience</span>
                        </div>
                        <p className="text-sm font-medium text-purple-700">
                          {application.training_request?.target_audience || 'N/A'}
                        </p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">Applied</span>
                        </div>
                        <p className="text-sm font-bold text-orange-700">
                          {format(new Date(application.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Details */}
                    {application.training_request && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Delivery Mode:</span>
                          <p className="text-sm text-gray-800">{application.training_request.delivery_mode || 'Not specified'}</p>
                        </div>
                        {application.training_request.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-600">Location:</span>
                              <p className="text-sm text-gray-800">{application.training_request.location}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Application Details */}
                    {application.message_to_client && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Your Message to Client:</span>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-sm text-gray-700">{application.message_to_client}</p>
                        </div>
                      </div>
                    )}

                    {application.availability_notes && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Availability Notes:</span>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
                          <p className="text-sm text-gray-700">{application.availability_notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
                      <span>
                        Request Posted: {application.training_request 
                          ? format(new Date(application.training_request.created_at), 'MMM dd, yyyy')
                          : 'N/A'
                        }
                      </span>
                      {application.proposed_start_date && (
                        <span>
                          Proposed Start: {format(new Date(application.proposed_start_date), 'MMM dd, yyyy')}
                        </span>
                      )}
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

export default TrainerApplications;
