import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Eye, Users, Star, DollarSign, Calendar, CheckCircle, XCircle, BookOpen } from 'lucide-react';
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
    id: string;
    name: string;
    rating: number;
    total_reviews: number;
    title: string;
    experience_years: number;
  };
}

const ClientTrainingRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [viewingApplications, setViewingApplications] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<TrainingApplication | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch client's training requests (including completed/closed ones for history)
  const { data: requests, isLoading } = useQuery({
    queryKey: ['client-training-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('training_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingRequest[];
    },
    enabled: !!user?.id
  });

  // Fetch applications for selected request
  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ['training-applications', selectedRequest?.id],
    queryFn: async () => {
      if (!selectedRequest?.id) return [];
      
      const { data, error } = await supabase
        .from('training_applications')
        .select(`
          *,
          trainer:trainers(id, name, rating, total_reviews, title, experience_years)
        `)
        .eq('request_id', selectedRequest.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrainingApplication[];
    },
    enabled: !!selectedRequest?.id
  });

  // Update application status mutation
  const updateApplicationStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('training_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application status updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['training-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive"
      });
    }
  });

  // Select trainer and update request mutation
  const selectTrainerMutation = useMutation({
    mutationFn: async ({ requestId, trainerId }: { requestId: string; trainerId: string }) => {
      const { error } = await supabase
        .from('training_requests')
        .update({ 
          selected_trainer_id: trainerId,
          status: 'trainer_selected'
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Trainer selected successfully. You can now proceed with booking."
      });
      queryClient.invalidateQueries({ queryKey: ['client-training-requests'] });
      queryClient.invalidateQueries({ queryKey: ['training-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to select trainer",
        variant: "destructive"
      });
    }
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async ({ request, application }: { request: TrainingRequest; application: TrainingApplication }) => {
      const startDate = new Date(application.proposed_start_date || request.expected_start_date);
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + (application.proposed_duration_hours || request.duration_hours));

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user!.id,
          trainer_id: application.trainer_id,
          training_topic: request.title,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          duration_hours: application.proposed_duration_hours || request.duration_hours,
          total_amount: application.proposed_price,
          status: 'pending',
          special_requirements: request.description,
          notes: application.message_to_client,
          organization_name: request.location
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking created successfully!"
      });
      setShowBookingDialog(false);
      queryClient.invalidateQueries({ queryKey: ['client-training-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    }
  });

  // Close training request mutation
  const closeRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('training_requests')
        .update({ status: 'closed' })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Training request closed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['client-training-requests'] });
      setSelectedRequest(null);
      setViewingApplications(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close training request",
        variant: "destructive"
      });
    }
  });

  const handleViewApplications = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setViewingApplications(true);
  };

  const handleUpdateApplicationStatus = (applicationId: string, status: string) => {
    updateApplicationStatusMutation.mutate({ applicationId, status });
  };

  const handleSelectTrainer = (application: TrainingApplication) => {
    if (selectedRequest) {
      selectTrainerMutation.mutate({ 
        requestId: selectedRequest.id, 
        trainerId: application.trainer_id 
      });
      setSelectedApplication(application);
    }
  };

  const handleCreateBooking = () => {
    if (selectedRequest && selectedApplication) {
      createBookingMutation.mutate({ 
        request: selectedRequest, 
        application: selectedApplication 
      });
    }
  };

  const handleCloseRequest = (requestId: string) => {
    closeRequestMutation.mutate(requestId);
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
            My Training Requests ({requests?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading your training requests...</div>
          ) : requests?.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">You haven't posted any training requests yet</p>
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
                        <p className="text-gray-600 mb-3">{request.description}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplications(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Applications
                        </Button>
                        {request.status === 'trainer_selected' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowBookingDialog(true);
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-1" />
                            Book Training
                          </Button>
                        )}
                        {request.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloseRequest(request.id)}
                            disabled={closeRequestMutation.isPending}
                          >
                            Close Request
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.target_audience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.duration_hours}h</span>
                      </div>
                      {(request.budget_min > 0 || request.budget_max > 0) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            ${request.budget_min}-${request.budget_max}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Posted: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    {request.application_deadline && (
                      <div className="text-sm text-gray-500">
                        Application Deadline: {format(new Date(request.application_deadline), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Modal */}
      <Dialog open={viewingApplications} onOpenChange={setViewingApplications}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Applications for: {selectedRequest?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
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
                    <Card key={application.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold">{application.trainer?.name}</h4>
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
                              <span>{application.trainer?.experience_years || 0} years experience</span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {selectedRequest.status === 'open' && application.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'shortlisted')}
                                  disabled={updateApplicationStatusMutation.isPending}
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Shortlist
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                                  disabled={updateApplicationStatusMutation.isPending}
                                  className="bg-red-50 text-red-700 border-red-200"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {selectedRequest.status === 'open' && application.status === 'shortlisted' && (
                              <Button
                                size="sm"
                                onClick={() => handleSelectTrainer(application)}
                                disabled={selectTrainerMutation.isPending}
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Select Trainer
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                            <span className="text-sm font-medium text-gray-600">End Date:</span>
                            <p>
                              {application.proposed_end_date
                                ? format(new Date(application.proposed_end_date), 'MMM dd, yyyy')
                                : 'Flexible'}
                            </p>
                          </div>
                        </div>

                        {application.message_to_client && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-600">Message:</span>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md">{application.message_to_client}</p>
                          </div>
                        )}

                        {application.availability_notes && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-600">Availability Notes:</span>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md">{application.availability_notes}</p>
                          </div>
                        )}

                        {application.proposed_syllabus && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-gray-600">Proposed Syllabus:</span>
                            <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                              {application.proposed_syllabus}
                            </p>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          Applied: {format(new Date(application.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Confirmation Modal */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          {selectedRequest && selectedApplication && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Training Request: {selectedRequest.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedRequest.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Trainer:</span> {selectedApplication.trainer?.name}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${selectedApplication.proposed_price}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {selectedApplication.proposed_duration_hours || selectedRequest.duration_hours}h
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span> {
                      selectedApplication.proposed_start_date 
                        ? format(new Date(selectedApplication.proposed_start_date), 'MMM dd, yyyy')
                        : 'To be scheduled'
                    }
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateBooking}
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? 'Creating...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientTrainingRequests;
