import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAgreements } from '@/hooks/useAgreements';
import { Calendar, Clock, User, Search, Eye, Copy, FileText } from 'lucide-react';
import { format } from 'date-fns';
import AgreementModal from '@/components/agreements/AgreementModal';

interface TrainerBookingsProps {
  trainerId: string;
}

interface BookingData {
  id: string;
  created_at: string | null;
  end_time: string;
  start_time: string;
  status: string | null;
  student_id: string;
  total_amount: number;
  trainer_id: string;
  updated_at: string | null;
  training_topic: string;
  duration_hours: number;
  organization_name: string | null;
  special_requirements: string | null;
  meeting_link: string | null;
  notes: string | null;
  booking_type?: string;
  feedback_token?: string;
  is_training_request?: boolean;
  client_name?: string;
  client_email?: string;
  agreement_id?: string;
  client_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    company_name: string | null;
    designation: string | null;
    contact_person: string | null;
  } | null;
}

const TrainerBookings = ({ trainerId }: TrainerBookingsProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [pendingConfirmBookingId, setPendingConfirmBookingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchAgreement } = useAgreements();

  // Fetch bookings with client details using separate queries
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['trainer-bookings', trainerId, statusFilter],
    queryFn: async () => {
      console.log('Fetching bookings for trainer:', trainerId);
      
      if (!trainerId) {
        console.log('No trainer ID provided');
        return [];
      }

      // First, fetch bookings - only show assigned bookings
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', trainerId)
        .neq('trainer_id', '00000000-0000-0000-0000-000000000000') // Exclude unassigned bookings
        .order('start_time', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: bookingsData, error } = await query;
      
      if (error) {
        console.error('Error fetching bookings:', error);
        throw error;
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for trainer:', trainerId);
        return [];
      }

      console.log('Raw bookings:', bookingsData);

      // Get unique student IDs from bookings
      const studentIds = [...new Set(bookingsData.map(b => b.student_id))];
      console.log('Fetching profiles for student IDs:', studentIds);
      
      // Fetch student profiles separately with better error handling
      let profilesData = [];
      try {
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, company_name, designation, contact_person')
          .in('id', studentIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          profilesData = [];
        } else {
          profilesData = data || [];
        }
      } catch (error) {
        console.error('Exception fetching profiles:', error);
        profilesData = [];
      }

      console.log('Profiles data:', profilesData);

      // Get feedback links
      const bookingIds = bookingsData.map(b => b.id);
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_links')
        .select('booking_id, token, is_active')
        .in('booking_id', bookingIds)
        .eq('is_active', true);

      if (feedbackError) {
        console.error('Error fetching feedback links:', feedbackError);
      }

      // Transform the data to match our interface
      const enrichedBookings: BookingData[] = bookingsData.map(booking => {
        const feedbackLink = feedbackData?.find(f => f.booking_id === booking.id);
        const isTrainingRequestBooking = booking.booking_type === 'training_request';
        
        // Find the profile for this student
        const profileData = profilesData?.find(p => p.id === booking.student_id);
        
        console.log(`Booking ${booking.id} - profile data:`, profileData);
        
        // Use client name and email from booking if available, otherwise fall back to profile
        const clientName = booking.client_name || profileData?.full_name || profileData?.contact_person || 'Unknown Client';
        const clientEmail = booking.client_email || profileData?.email || 'No email provided';
        
        return {
          ...booking,
          client_profile: profileData || null,
          client_name: clientName,
          client_email: clientEmail,
          feedback_token: feedbackLink?.token || null,
          is_training_request: isTrainingRequestBooking
        };
      });

      console.log('Final enriched bookings:', enrichedBookings);
      return enrichedBookings;
    },
    enabled: !!trainerId
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      console.log('Updating booking status:', { bookingId, status });
      
      try {
        const { data, error } = await supabase
          .from('bookings')
          .update({ 
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId)
          .eq('trainer_id', trainerId)
          .select()
          .single();

        if (error) {
          console.error('Supabase error updating booking:', error);
          throw new Error(`Failed to update booking status: ${error.message}`);
        }

        console.log('Booking updated successfully:', data);

        // Create notification for the client
        const booking = bookings?.find(b => b.id === bookingId);
        if (booking?.client_profile) {
          const notificationType = status === 'confirmed' ? 'booking_confirmed' : 
                                 status === 'cancelled' ? 'booking_cancelled' : 
                                 status === 'completed' ? 'booking_completed' : null;
          
          if (notificationType) {
            await supabase.rpc('create_notification', {
              p_user_id: booking.student_id,
              p_type: notificationType,
              p_title: `Booking ${status === 'confirmed' ? 'Confirmed' : status === 'cancelled' ? 'Cancelled' : 'Completed'}`,
              p_message: `Your training session "${booking.training_topic}" has been ${status}.`,
              p_data: {
                booking_id: bookingId,
                training_topic: booking.training_topic,
                trainer_action: true
              }
            });
          }
        }

        return { bookingId, status };
      } catch (error) {
        console.error('Error in updateBookingStatusMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      const statusText = data.status === 'confirmed' ? 'confirmed' : 
                        data.status === 'cancelled' ? 'cancelled' : 
                        data.status === 'completed' ? 'marked as complete' : data.status;
      
      toast({
        title: "Success",
        description: `Booking ${statusText} successfully. The client has been notified.`
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
    },
    onError: (error: any) => {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive"
      });
    }
  });

  const createFeedbackLinkOptimized = async (bookingId: string) => {
    try {
      console.log('Creating optimized feedback link for booking:', bookingId);
      
      const { data: existingLink, error: checkError } = await supabase
        .from('feedback_links')
        .select('id, token')
        .eq('booking_id', bookingId)
        .eq('is_active', true)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing feedback link:', checkError);
        throw checkError;
      }

      if (existingLink) {
        console.log('Feedback link already exists:', existingLink);
        return existingLink;
      }

      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_feedback_token');

      if (tokenError) {
        console.error('Error generating token:', tokenError);
        throw tokenError;
      }

      const { data, error } = await supabase
        .from('feedback_links')
        .insert({
          booking_id: bookingId,
          token: tokenData,
          is_active: true,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feedback link:', error);
        throw error;
      }

      console.log('Feedback link created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createFeedbackLinkOptimized:', error);
      throw error;
    }
  };

  const createFeedbackLinkMutation = useMutation({
    mutationFn: createFeedbackLinkOptimized,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback link created successfully"
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Error creating feedback link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create feedback link",
        variant: "destructive"
      });
    }
  });

  const updateBookingStatus = (bookingId: string, status: string) => {
    // In managed model, trainers can only update status to confirmed, completed, or cancelled
    if (status === 'confirmed') {
      // Check if agreement exists and handle accordingly
      const booking = bookings?.find(b => b.id === bookingId);
      if (booking?.agreement_id) {
        // Agreement exists, show agreement modal for trainer signature
        setPendingConfirmBookingId(bookingId);
        setIsAgreementModalOpen(true);
      } else {
        // No agreement, create one and show modal
        setPendingConfirmBookingId(bookingId);
        setIsAgreementModalOpen(true);
      }
    } else {
      // For other status changes, proceed normally
      updateBookingStatusMutation.mutate({ bookingId, status });
    }
  };

  const handleAgreementCompleted = () => {
    setIsAgreementModalOpen(false);
    setPendingConfirmBookingId(null);
    // Refetch bookings to get updated status
    refetch();
    // Also invalidate queries to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
    queryClient.invalidateQueries({ queryKey: ['agreement'] });
  };

  // Fetch agreement data for the pending booking
  const { data: pendingAgreementData } = fetchAgreement(pendingConfirmBookingId || '');

  const createFeedbackLink = (bookingId: string) => {
    createFeedbackLinkMutation.mutate(bookingId);
  };

  const copyFeedbackLink = (token: string) => {
    const cleanToken = token
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    const feedbackUrl = `${window.location.origin}/feedback/${cleanToken}`;
    console.log('Generated feedback URL:', feedbackUrl);
    
    navigator.clipboard.writeText(feedbackUrl);
    toast({
      title: "Link Copied!",
      description: "Feedback link has been copied to clipboard."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    const clientName = booking.client_name || 'Client';
    const clientEmail = booking.client_email || '';
    const companyName = booking.client_profile?.company_name || booking.organization_name || '';
    
    return (
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.training_topic?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Bookings ({bookings?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Details</TableHead>
                <TableHead>Training Topic</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading bookings...
                  </TableCell>
                </TableRow>
              ) : filteredBookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {bookings?.length === 0 ? 'No bookings found' : 'No bookings match your search'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings?.map((booking) => {
                  const clientName = booking.client_name || 'Unknown Client';
                  const clientEmail = booking.client_email || 'No email provided';
                  const companyName = booking.client_profile?.company_name || booking.organization_name;
                  
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-foreground">
                              {clientName}
                            </p>
                            <p className="text-sm text-muted-foreground">{clientEmail}</p>
                            {companyName && (
                              <p className="text-xs text-blue-600">{companyName}</p>
                            )}
                            {booking.client_profile?.designation && (
                              <p className="text-xs text-gray-500">{booking.client_profile.designation}</p>
                            )}
                            {booking.is_training_request && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                Training Request
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{booking.training_topic}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(booking.start_time), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.duration_hours}h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">₹</span>
                          {booking.total_amount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status || 'pending')}>
                          {booking.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          {booking.status === 'pending' && !booking.is_training_request && (
                            <>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                 disabled={updateBookingStatusMutation.isPending}
                                 className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1"
                               >
                                 <FileText className="h-4 w-4" />
                                 Confirm Session
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                 disabled={updateBookingStatusMutation.isPending}
                                 className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                               >
                                 Cannot Attend
                               </Button>
                            </>
                          )}
                          
                          {booking.is_training_request && booking.status === 'confirmed' && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Auto-Confirmed
                            </Badge>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              disabled={updateBookingStatusMutation.isPending}
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            >
                              Mark Complete
                            </Button>
                          )}
                          
                          {booking.status === 'completed' && booking.feedback_token && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyFeedbackLink(booking.feedback_token!)}
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Feedback Link
                            </Button>
                          )}
                          {booking.status === 'completed' && !booking.feedback_token && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => createFeedbackLink(booking.id)}
                              disabled={createFeedbackLinkMutation.isPending}
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            >
                              Generate Link
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Booking Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">CLIENT</h4>
                    <p className="font-medium">{selectedBooking.client_name || 'Unknown Client'}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.client_email || 'No email provided'}</p>
                    {(selectedBooking.client_profile?.company_name || selectedBooking.organization_name) && (
                      <p className="text-sm text-blue-600">{selectedBooking.client_profile?.company_name || selectedBooking.organization_name}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">STATUS</h4>
                    <Badge className={getStatusColor(selectedBooking.status || 'pending')}>
                      {selectedBooking.status || 'pending'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">TRAINING TOPIC</h4>
                  <p>{selectedBooking.training_topic}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">DATE & TIME</h4>
                    <p>{format(new Date(selectedBooking.start_time), 'PPP')}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">DURATION & AMOUNT</h4>
                    <p>{selectedBooking.duration_hours} hours</p>
                    <p className="text-green-600 font-medium">₹{selectedBooking.total_amount}</p>
                  </div>
                </div>
                {selectedBooking.special_requirements && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">SPECIAL REQUIREMENTS</h4>
                    <p className="bg-gray-50 p-3 rounded-md">{selectedBooking.special_requirements}</p>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600">NOTES</h4>
                    <p className="bg-gray-50 p-3 rounded-md">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Agreement Modal for Trainer Acceptance */}
        {pendingConfirmBookingId && (
          <AgreementModal
            isOpen={isAgreementModalOpen}
            onClose={() => setIsAgreementModalOpen(false)}
            bookingId={pendingConfirmBookingId}
            userType="trainer"
            agreementData={pendingAgreementData}
            onSuccess={handleAgreementCompleted}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TrainerBookings;
