
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Eye, Users, Calendar, DollarSign, User } from 'lucide-react';
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
  client_profile: {
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
  trainer_id: string;
  trainer?: {
    name: string;
    rating: number;
    total_reviews: number;
    title: string;
    experience_years: number;
  };
}

const AdminTrainingRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [viewingApplications, setViewingApplications] = useState(false);

  // Fetch all training requests for admin view
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-training-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_requests')
        .select(`
          *,
          client_profile:profiles!client_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

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
          trainer:trainers(name, rating, total_reviews, title, experience_years)
        `)
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingApplication[];
    },
    enabled: !!selectedRequest?.id
  });

  const handleViewApplications = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setViewingApplications(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'trainer_selected': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Training Requests ({requests?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading training requests...</div>
          ) : requests?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No training requests found</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {request.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{request.client_profile?.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{request.client_profile?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{request.target_audience}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{request.duration_hours}h</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(request.budget_min > 0 || request.budget_max > 0) && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              ${request.budget_min}-${request.budget_max}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplications(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <Dialog open={viewingApplications} onOpenChange={setViewingApplications}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Training Request Details: {selectedRequest?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Basic Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Title:</span> {selectedRequest.title}</p>
                        <p><span className="font-medium">Description:</span> {selectedRequest.description}</p>
                        <p><span className="font-medium">Target Audience:</span> {selectedRequest.target_audience}</p>
                        <p><span className="font-medium">Duration:</span> {selectedRequest.duration_hours} hours</p>
                        <p><span className="font-medium">Delivery Mode:</span> {selectedRequest.delivery_mode || 'N/A'}</p>
                        <p><span className="font-medium">Location:</span> {selectedRequest.location || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Timeline & Budget</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Expected Start:</span> {selectedRequest.expected_start_date ? format(new Date(selectedRequest.expected_start_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        <p><span className="font-medium">Expected End:</span> {selectedRequest.expected_end_date ? format(new Date(selectedRequest.expected_end_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        <p><span className="font-medium">Application Deadline:</span> {selectedRequest.application_deadline ? format(new Date(selectedRequest.application_deadline), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                        <p><span className="font-medium">Budget Range:</span> ${selectedRequest.budget_min || 0} - ${selectedRequest.budget_max || 0}</p>
                        <p><span className="font-medium">Status:</span> <Badge className={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Badge></p>
                        <p><span className="font-medium">Posted:</span> {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applications ({applications?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {applicationsLoading ? (
                    <div className="text-center py-8">Loading applications...</div>
                  ) : applications?.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No applications received</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications?.map((application) => (
                        <Card key={application.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h5 className="font-semibold">{application.trainer?.name}</h5>
                                  <Badge className={getApplicationStatusColor(application.status)}>
                                    {application.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{application.trainer?.title}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Rating: {application.trainer?.rating?.toFixed(1) || 'N/A'}</span>
                                  <span>Reviews: {application.trainer?.total_reviews || 0}</span>
                                  <span>Experience: {application.trainer?.experience_years || 0} years</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Proposed Price:</span>
                                <p className="text-lg font-semibold text-green-600">${application.proposed_price}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Duration:</span>
                                <p>{application.proposed_duration_hours || selectedRequest.duration_hours}h</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Start Date:</span>
                                <p>{application.proposed_start_date ? format(new Date(application.proposed_start_date), 'MMM dd, yyyy') : 'Flexible'}</p>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-600">Applied:</span>
                                <p>{format(new Date(application.created_at), 'MMM dd, yyyy')}</p>
                              </div>
                            </div>

                            {application.message_to_client && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-600">Message:</span>
                                <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{application.message_to_client}</p>
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
