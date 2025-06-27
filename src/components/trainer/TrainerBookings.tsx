
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, DollarSign, Search, Link, Copy, Eye, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';

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
  student_name?: string;
  student_email?: string;
  feedback_token?: string;
}

const TrainerBookings = ({ trainerId }: TrainerBookingsProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings with client details - Fixed student profile fetching
  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['trainer-bookings', trainerId, statusFilter],
    queryFn: async () => {
      console.log('Fetching bookings for trainer:', trainerId);
      
      // Build the main bookings query
      let bookingsQuery = supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('start_time', { ascending: false });

      if (statusFilter !== 'all') {
        bookingsQuery = bookingsQuery.eq('status', statusFilter);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      
      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for trainer:', trainerId);
        return [];
      }

      // Get student/client details - Fixed the profile fetching logic
      const studentIds = [...new Set(bookingsData.map(b => b.student_id))];
      console.log('Fetching student profiles for IDs:', studentIds);
      
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (studentsError) {
        console.error('Error fetching student profiles:', studentsError);
        // Continue with empty profiles array instead of throwing
      }

      console.log('Student profiles fetched:', studentsData);

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

      // Combine all data - Fixed the profile matching logic
      const enrichedBookings = bookingsData.map(booking => {
        const studentProfile = studentsData?.find(s => s.id === booking.student_id);
        const feedbackLink = feedbackData?.find(f => f.booking_id === booking.id);
        
        console.log(`Booking ${booking.id}: student_id=${booking.student_id}, found profile:`, studentProfile);
        
        return {
          ...booking,
          student_name: studentProfile?.full_name || 'Unknown Client',
          student_email: studentProfile?.email || 'No email available',
          feedback_token: feedbackLink?.token || null
        };
      });

      console.log('Final enriched bookings:', enrichedBookings);
      return enrichedBookings;
    },
    enabled: !!trainerId
  });

  // Fixed booking status update mutation - removed automatic feedback link creation
  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      console.log('Updating booking status:', { bookingId, status });
      
      try {
        // Update booking status with proper error handling
        const { data, error } = await supabase
          .from('bookings')
          .update({ 
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', bookingId)
          .eq('trainer_id', trainerId) // Ensure trainer can only update their own bookings
          .select()
          .single();

        if (error) {
          console.error('Supabase error updating booking:', error);
          throw new Error(`Failed to update booking status: ${error.message}`);
        }

        console.log('Booking updated successfully:', data);
        return { bookingId, status };
      } catch (error) {
        console.error('Error in updateBookingStatusMutation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Booking ${data.status} successfully`
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

  // Fixed feedback link creation using database function for token generation
  const createFeedbackLinkOptimized = async (bookingId: string) => {
    try {
      console.log('Creating optimized feedback link for booking:', bookingId);
      
      // Check if feedback link already exists first
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

      // Generate token using the database function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_feedback_token');

      if (tokenError) {
        console.error('Error generating token:', tokenError);
        throw tokenError;
      }

      // Create feedback link with generated token
      const { data, error } = await supabase
        .from('feedback_links')
        .insert({
          booking_id: bookingId,
          token: tokenData,
          is_active: true,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
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

  // Manual feedback link creation mutation
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
    updateBookingStatusMutation.mutate({ bookingId, status });
  };

  const createFeedbackLink = (bookingId: string) => {
    createFeedbackLinkMutation.mutate(bookingId);
  };

  const copyFeedbackLink = (token: string) => {
    // Debug the token before encoding
    console.log('Original token:', token);
    console.log('Token length:', token.length);
    console.log('Token contains special chars:', /[+/=]/.test(token));
    
    // Use base64url encoding for better URL compatibility
    const base64urlToken = token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    console.log('Base64url token:', base64urlToken);
    
    const feedbackUrl = `${window.location.origin}/feedback/${base64urlToken}`;
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

  const filteredBookings = bookings?.filter(booking =>
    booking.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.training_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                filteredBookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{booking.student_name}</p>
                          <p className="text-sm text-gray-500">{booking.student_email}</p>
                          {booking.organization_name && (
                            <p className="text-xs text-blue-600">{booking.organization_name}</p>
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
                        <DollarSign className="h-4 w-4 text-green-600" />
                        ${booking.total_amount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status || 'pending')}>
                        {booking.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">CLIENT</h4>
                                    <p className="font-medium">{selectedBooking.student_name}</p>
                                    <p className="text-sm text-gray-500">{selectedBooking.student_email}</p>
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
                                {selectedBooking.organization_name && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">ORGANIZATION</h4>
                                    <p>{selectedBooking.organization_name}</p>
                                  </div>
                                )}
                                {selectedBooking.special_requirements && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">SPECIAL REQUIREMENTS</h4>
                                    <p className="bg-gray-50 p-3 rounded-md">{selectedBooking.special_requirements}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              disabled={updateBookingStatusMutation.isPending}
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updateBookingStatusMutation.isPending}
                              className="bg-red-50 text-red-700 border-red-200"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            disabled={updateBookingStatusMutation.isPending}
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {booking.status === 'completed' && booking.feedback_token && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyFeedbackLink(booking.feedback_token!)}
                            className="bg-purple-50 text-purple-700 border-purple-200"
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
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Generate Link
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainerBookings;
