
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Eye, Users, Calendar, DollarSign, User, GraduationCap } from 'lucide-react';
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
  selected_trainer?: {
    name: string;
    title: string;
    rating: number;
  };
  applications_count: number;
  booking_status?: string;
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
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all training requests for admin view with comprehensive details
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-training-requests', statusFilter],
    queryFn: async () => {
      console.log('Fetching training requests with filter:', statusFilter);

      // Build the query with status filter if needed
      let query = supabase
        .from('training_requests')
        .select(`
          *,
          client_profile:profiles!client_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: requestsData, error } = await query;

      if (error) {
        console.error('Error fetching training requests:', error);
        throw error;
      }

      console.log('Training requests fetched:', requestsData);

      // Enhance each request with additional details
      const enhancedRequests = await Promise.all(
        requestsData.map(async (request) => {
          // Get applications count
          const { count: applicationsCount } = await supabase
            .from('training_applications')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', request.id);

          // Get selected trainer details if exists
          let selectedTrainer = null;
          if (request.selected_trainer_id) {
            const { data: trainerData } = await supabase
              .from('trainers')
              .select('name, title, rating')
              .eq('id', request.selected_trainer_id)
              .single();
            
            selectedTrainer = trainerData;
          }

          // Get booking status if trainer is selected
          let bookingStatus = null;
          if (request.selected_trainer_id) {
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('status')
              .eq('trainer_id', request.selected_trainer_id)
              .eq('training_topic', request.title)
              .maybeSingle();

            if (bookingData) {
              bookingStatus = bookingData.status;
            }
          }

          return {
            ...request,
            selected_trainer: selectedTrainer,
            applications_count: applicationsCount || 0,
            booking_status: bookingStatus
          };
        })
      );

      console.log('Enhanced requests:', enhancedRequests);
      return enhancedRequests as TrainingRequest[];
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

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Training Requests ({requests?.length || 0})
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="trainer_selected">Trainer Selected</SelectItem>
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
                {statusFilter === 'all' ? 'No training requests found' : `No training requests with status: ${statusFilter}`}
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Duration & Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Selected Trainer</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm">{request.title}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {request.description}
                          </p>
                          {request.delivery_mode && (
                            <p className="text-xs text-blue-600 mt-1">
                              {request.delivery_mode}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{request.client_profile?.full_name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{request.client_profile?.email || 'N/A'}</p>
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">{request.duration_hours}h</span>
                          </div>
                          {(request.budget_min > 0 || request.budget_max > 0) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-gray-400" />
                              <span className="text-xs">
                                ${request.budget_min}-${request.budget_max}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(request.status)} variant="secondary">
                            {request.status.replace('_', ' ')}
                          </Badge>
                          {request.booking_status && (
                            <Badge className={getBookingStatusColor(request.booking_status)} variant="outline">
                              Booking: {request.booking_status}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.selected_trainer ? (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">{request.selected_trainer.name}</p>
                              <p className="text-xs text-gray-500">{request.selected_trainer.title}</p>
                              <p className="text-xs text-yellow-600">★ {request.selected_trainer.rating?.toFixed(1) || 'N/A'}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No trainer selected</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {request.applications_count}
                          </span>
                        </div>
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
                  <CardTitle className="text-lg flex items-center justify-between">
                    Request Information
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                      {selectedRequest.booking_status && (
                        <Badge className={getBookingStatusColor(selectedRequest.booking_status)}>
                          Booking: {selectedRequest.booking_status}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
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
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Client Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Name:</span> {selectedRequest.client_profile?.full_name || 'N/A'}</p>
                          <p><span className="font-medium">Email:</span> {selectedRequest.client_profile?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Timeline & Budget</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Expected Start:</span> {selectedRequest.expected_start_date ? format(new Date(selectedRequest.expected_start_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        <p><span className="font-medium">Expected End:</span> {selectedRequest.expected_end_date ? format(new Date(selectedRequest.expected_end_date), 'MMM dd, yyyy') : 'N/A'}</p>
                        <p><span className="font-medium">Application Deadline:</span> {selectedRequest.application_deadline ? format(new Date(selectedRequest.application_deadline), 'MMM dd, yyyy HH:mm') : 'N/A'}</p>
                        <p><span className="font-medium">Budget Range:</span> ${selectedRequest.budget_min || 0} - ${selectedRequest.budget_max || 0}</p>
                        <p><span className="font-medium">Posted:</span> {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                      {selectedRequest.selected_trainer && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Selected Trainer</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Name:</span> {selectedRequest.selected_trainer.name}</p>
                            <p><span className="font-medium">Title:</span> {selectedRequest.selected_trainer.title}</p>
                            <p><span className="font-medium">Rating:</span> ★ {selectedRequest.selected_trainer.rating?.toFixed(1) || 'N/A'}</p>
                          </div>
                        </div>
                      )}
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

                            {application.availability_notes && (
                              <div className="mb-3">
                                <span className="text-sm font-medium text-gray-600">Availability:</span>
                                <p className="mt-1 p-2 bg-blue-50 rounded text-sm">{application.availability_notes}</p>
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
