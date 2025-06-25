
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, DollarSign, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

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
  };
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

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch trainer's applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['trainer-applications', trainer?.id, statusFilter],
    queryFn: async () => {
      if (!trainer?.id) return [];
      
      let query = supabase
        .from('training_applications')
        .select(`
          *,
          training_request:training_requests(*)
        `)
        .eq('trainer_id', trainer.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrainerApplication[];
    },
    enabled: !!trainer?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-blue-100 text-blue-800';
      case 'selected': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <div className="space-y-4">
            {applications?.map((application) => (
              <Card key={application.id} className="border-l-4 border-l-techblue-500">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.training_request.title}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                        <Badge className={getRequestStatusColor(application.training_request.status)}>
                          Request: {application.training_request.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{application.training_request.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <span className="text-sm text-gray-500">Your Quote:</span>
                        <p className="font-semibold">${application.proposed_price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Duration:</span>
                        <p>{application.proposed_duration_hours || application.training_request.duration_hours}h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Audience:</span>
                        <p>{application.training_request.target_audience}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-500">Applied:</span>
                        <p>{format(new Date(application.created_at), 'MMM dd')}</p>
                      </div>
                    </div>
                  </div>

                  {application.training_request.budget_min > 0 && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Client Budget Range:</span>
                      <p className="text-sm">
                        ${application.training_request.budget_min} - ${application.training_request.budget_max}
                      </p>
                    </div>
                  )}

                  {application.message_to_client && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Your Message:</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{application.message_to_client}</p>
                    </div>
                  )}

                  {application.availability_notes && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-600">Availability Notes:</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{application.availability_notes}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      Request Posted: {format(new Date(application.training_request.created_at), 'MMM dd, yyyy')}
                    </span>
                    {application.proposed_start_date && (
                      <span>
                        Proposed Start: {format(new Date(application.proposed_start_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerApplications;
