
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Star,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface TrainingRequest {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  expected_start_date: string;
  expected_end_date: string;
  duration_hours: number;
  delivery_mode: string;
  location: string;
  budget_min: number;
  budget_max: number;
  application_deadline: string;
  status: string;
  created_at: string;
  selected_trainer_id: string;
  client_id: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface TrainingApplication {
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
  trainer?: {
    id: string;
    name: string;
    rating: number;
    total_reviews: number;
    title: string;
    experience_years: number;
    hourly_rate: number;
  };
}

const AdminTrainingRequests = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [viewingApplications, setViewingApplications] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all training requests with client details
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-training-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('training_requests')
        .select(`
          *,
          profiles!client_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TrainingRequest[];
    }
  });

  // Fetch applications for selected request
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['admin-training-applications', selectedRequest?.id],
    queryFn: async () => {
      if (!selectedRequest?.id) return [];
      
      const { data, error } = await supabase
        .from('training_applications')
        .select(`
          *,
          trainer:trainers(id, name, rating, total_reviews, title, experience_years, hourly_rate)
        `)
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingApplication[];
    },
    enabled: !!selectedRequest?.id
  });

  // Update request status mutation
  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const { error } = await supabase
        .from('training_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request status updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-training-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request status",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const handleViewDetails = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setViewingApplications(true);
  };

  const handleUpdateRequestStatus = (requestId: string, status: string) => {
    updateRequestStatusMutation.mutate({ requestId, status });
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Training Requests Management ({requests?.length || 0})
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading training requests...</div>
          ) : requests?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? "No training requests found"
                  : `No requests with status: ${statusFilter}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests?.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-techblue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{request.title}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                        
                        {/* Client Information */}
                        <div className="flex items-center gap-2 mb-3">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">Client:</span>
                          <span className="text-sm">{request.profiles?.full_name || 'N/A'}</span>
                          <span className="text-sm text-gray-500">({request.profiles?.email})</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {request.status === 'open' && (
                          <Select
                            onValueChange={(value) => handleUpdateRequestStatus(request.id, value)}
                            defaultValue={request.status}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Close</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs text-gray-500">Audience:</span>
                          <p className="text-sm font-medium">{request.target_audience}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs text-gray-500">Duration:</span>
                          <p className="text-sm font-medium">{request.duration_hours}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs text-gray-500">Mode:</span>
                          <p className="text-sm font-medium">{request.delivery_mode || 'N/A'}</p>
                        </div>
                      </div>
                      {(request.budget_min > 0 || request.budget_max > 0) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-xs text-gray-500">Budget:</span>
                            <p className="text-sm font-medium">
                              ${request.budget_min}-${request.budget_max}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-xs text-gray-500">Posted:</span>
                          <p className="text-sm font-medium">
                            {format(new Date(request.created_at), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.application_deadline && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                        Deadline: {format(new Date(request.application_deadline), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <Dialog open={viewingApplications} onOpenChange={setViewingApplications}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Details: {selectedRequest?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Client:</span>
                      <p>{selectedRequest.profiles?.full_name} ({selectedRequest.profiles?.email})</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Posted:</span>
                      <p>{format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Duration:</span>
                      <p>{selectedRequest.duration_hours} hours</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Delivery Mode:</span>
                      <p>{selectedRequest.delivery_mode || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Location:</span>
                      <p>{selectedRequest.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Description:</span>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.description}</p>
                  </div>
                  
                  {(selectedRequest.budget_min > 0 || selectedRequest.budget_max > 0) && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Budget Range:</span>
                      <p className="text-lg font-semibold text-green-600">
                        ${selectedRequest.budget_min} - ${selectedRequest.budget_max}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Trainer Applications ({applications?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div className="text-center py-8">Loading applications...</div>
                  ) : applications?.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No applications received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications?.map((application) => (
                        <Card key={application.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold">{application.trainer?.name}</h4>
                                  <Badge className={getApplicationStatusColor(application.status)}>
                                    {application.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{application.trainer?.title}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span>{application.trainer?.rating?.toFixed(1) || 'N/A'}</span>
                                    <span>({application.trainer?.total_reviews || 0} reviews)</span>
                                  </div>
                                  <span>{application.trainer?.experience_years || 0} years exp</span>
                                  <span>${application.trainer?.hourly_rate}/hour</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Proposed Price:</span>
                                <p className="text-lg font-semibold text-green-600">
                                  ${application.proposed_price}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Duration:</span>
                                <p>{application.proposed_duration_hours || selectedRequest.duration_hours}h</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Start Date:</span>
                                <p>
                                  {application.proposed_start_date
                                    ? format(new Date(application.proposed_start_date), 'MMM dd, yyyy')
                                    : 'Flexible'}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Applied:</span>
                                <p>{format(new Date(application.created_at), 'MMM dd')}</p>
                              </div>
                            </div>

                            {application.message_to_client && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-600">Message:</span>
                                <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{application.message_to_client}</p>
                              </div>
                            )}

                            {application.proposed_syllabus && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Proposed Syllabus:</span>
                                <p className="mt-1 p-2 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                                  {application.proposed_syllabus}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrainingRequests;
