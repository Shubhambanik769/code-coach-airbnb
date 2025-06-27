
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Search, Calendar, MapPin, Users, DollarSign, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

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
  language_preference: string;
  tools_required: string[];
  syllabus_content: string;
  allow_trainer_pricing: boolean;
  allow_trainer_syllabus: boolean;
  budget_min: number;
  budget_max: number;
  application_deadline: string;
  created_at: string;
}

interface ApplicationFormData {
  proposed_price: number;
  proposed_start_date: string;
  proposed_end_date: string;
  proposed_duration_hours: number;
  availability_notes: string;
  message_to_client: string;
  proposed_syllabus: string;
}

const TrainingRequestsFeed = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryModeFilter, setDeliveryModeFilter] = useState('all');
  const [targetAudienceFilter, setTargetAudienceFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
  const [applicationData, setApplicationData] = useState<ApplicationFormData>({
    proposed_price: 0,
    proposed_start_date: '',
    proposed_end_date: '',
    proposed_duration_hours: 0,
    availability_notes: '',
    message_to_client: '',
    proposed_syllabus: ''
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Check if we need to highlight a specific request from marketplace navigation
  const highlightedRequestId = location.state?.requestId;

  // Fetch training requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['training-requests', searchTerm, deliveryModeFilter, targetAudienceFilter],
    queryFn: async () => {
      let query = supabase
        .from('training_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (deliveryModeFilter !== 'all') {
        query = query.eq('delivery_mode', deliveryModeFilter);
      }

      if (targetAudienceFilter !== 'all') {
        query = query.eq('target_audience', targetAudienceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TrainingRequest[];
    }
  });

  // Auto-open highlighted request from marketplace
  useEffect(() => {
    if (highlightedRequestId && requests) {
      const request = requests.find(r => r.id === highlightedRequestId);
      if (request) {
        handleApply(request);
      }
    }
  }, [highlightedRequestId, requests]);

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

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async ({ requestId, data }: { requestId: string; data: ApplicationFormData }) => {
      if (!trainer?.id) throw new Error('Trainer profile not found');

      const { error } = await supabase
        .from('training_applications')
        .insert({
          request_id: requestId,
          trainer_id: trainer.id,
          proposed_price: data.proposed_price,
          proposed_start_date: data.proposed_start_date || null,
          proposed_end_date: data.proposed_end_date || null,
          proposed_duration_hours: data.proposed_duration_hours || null,
          availability_notes: data.availability_notes || null,
          message_to_client: data.message_to_client || null,
          proposed_syllabus: data.proposed_syllabus || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application submitted successfully!"
      });
      setSelectedRequest(null);
      setApplicationData({
        proposed_price: 0,
        proposed_start_date: '',
        proposed_end_date: '',
        proposed_duration_hours: 0,
        availability_notes: '',
        message_to_client: '',
        proposed_syllabus: ''
      });
      queryClient.invalidateQueries({ queryKey: ['trainer-applications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
    }
  });

  const handleApply = (request: TrainingRequest) => {
    setSelectedRequest(request);
    setApplicationData({
      proposed_price: request.budget_min || 0,
      proposed_start_date: request.expected_start_date || '',
      proposed_end_date: request.expected_end_date || '',
      proposed_duration_hours: request.duration_hours || 0,
      availability_notes: '',
      message_to_client: '',
      proposed_syllabus: ''
    });
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (applicationData.proposed_price <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid proposed price",
        variant: "destructive"
      });
      return;
    }

    submitApplicationMutation.mutate({
      requestId: selectedRequest.id,
      data: applicationData
    });
  };

  const filteredRequests = requests?.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Available Training Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search training requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={deliveryModeFilter} onValueChange={setDeliveryModeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Delivery Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetAudienceFilter} onValueChange={setTargetAudienceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="college">College</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading training requests...</div>
            ) : filteredRequests?.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No training requests found matching your criteria</p>
              </div>
            ) : (
              filteredRequests?.map((request) => (
                <Card 
                  key={request.id} 
                  className={`border-l-4 border-l-techblue-500 ${
                    request.id === highlightedRequestId ? 'ring-2 ring-techblue-300 bg-techblue-50' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                        <p className="text-gray-600 mb-3">{request.description}</p>
                      </div>
                      <Button onClick={() => handleApply(request)} className="ml-4">
                        Apply Now
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.target_audience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{request.delivery_mode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
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
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {request.tools_required?.map((tool, index) => (
                        <Badge key={index} variant="secondary">{tool}</Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Posted: {format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                      {request.application_deadline && (
                        <span>Deadline: {format(new Date(request.application_deadline), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Application Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Training Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposed_price">Proposed Price ($) *</Label>
                  <Input
                    id="proposed_price"
                    type="number"
                    value={applicationData.proposed_price}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      proposed_price: parseFloat(e.target.value) || 0
                    }))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="proposed_duration_hours">Duration (Hours)</Label>
                  <Input
                    id="proposed_duration_hours"
                    type="number"
                    value={applicationData.proposed_duration_hours}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      proposed_duration_hours: parseInt(e.target.value) || 0
                    }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proposed_start_date">Proposed Start Date</Label>
                  <Input
                    id="proposed_start_date"
                    type="date"
                    value={applicationData.proposed_start_date}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      proposed_start_date: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="proposed_end_date">Proposed End Date</Label>
                  <Input
                    id="proposed_end_date"
                    type="date"
                    value={applicationData.proposed_end_date}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      proposed_end_date: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="availability_notes">Availability Notes</Label>
                <Textarea
                  id="availability_notes"
                  value={applicationData.availability_notes}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    availability_notes: e.target.value
                  }))}
                  placeholder="Share your availability details..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="message_to_client">Message to Client</Label>
                <Textarea
                  id="message_to_client"
                  value={applicationData.message_to_client}
                  onChange={(e) => setApplicationData(prev => ({
                    ...prev,
                    message_to_client: e.target.value
                  }))}
                  placeholder="Introduce yourself and explain why you're the right fit..."
                  rows={4}
                />
              </div>

              {selectedRequest.allow_trainer_syllabus && (
                <div>
                  <Label htmlFor="proposed_syllabus">Proposed Syllabus</Label>
                  <Textarea
                    id="proposed_syllabus"
                    value={applicationData.proposed_syllabus}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      proposed_syllabus: e.target.value
                    }))}
                    placeholder="Propose your detailed training syllabus..."
                    rows={6}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={submitApplicationMutation.isPending}
                  className="flex-1"
                >
                  {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrainingRequestsFeed;
