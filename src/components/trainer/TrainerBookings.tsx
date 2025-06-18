
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

interface BookingWithProfile {
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
  client_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
  feedback_links?: {
    id: string;
    token: string;
    is_active: boolean;
  }[];
}

const TrainerBookings = ({ trainerId }: TrainerBookingsProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['trainer-bookings', trainerId, statusFilter],
    queryFn: async () => {
      console.log('Fetching bookings for trainer:', trainerId);
      
      // First get all bookings for this trainer
      let bookingsQuery = supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('start_time', { ascending: false });

      if (statusFilter !== 'all') {
        bookingsQuery = bookingsQuery.eq('status', statusFilter);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      
      console.log('Bookings query result:', { bookingsData, bookingsError });
      
      if (bookingsError) throw bookingsError;

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found for trainer');
        return [];
      }

      // Get feedback links for these bookings
      const bookingIds = bookingsData.map(booking => booking.id);
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_links')
        .select('id, token, is_active, booking_id')
        .in('booking_id', bookingIds);

      if (feedbackError) {
        console.warn('Feedback links query error:', feedbackError);
      }

      // Get client profiles for the students (clients)
      const clientIds = [...new Set(bookingsData.map(booking => booking.student_id))];
      console.log('Client IDs to fetch:', clientIds);
      
      const { data: clientProfilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientIds);

      console.log('Client profiles data:', clientProfilesData);

      if (profilesError) {
        console.warn('Client profiles query error:', profilesError);
      }

      const bookingsWithProfiles: BookingWithProfile[] = bookingsData.map(booking => {
        const feedbackLinks = feedbackData?.filter(link => link.booking_id === booking.id) || [];
        const clientProfile = clientProfilesData?.find(profile => profile.id === booking.student_id);

        console.log('Mapping booking:', booking.id, 'client_id:', booking.student_id, 'found profile:', clientProfile);

        return {
          ...booking,
          client_profile: clientProfile ? {
            id: clientProfile.id,
            full_name: clientProfile.full_name,
            email: clientProfile.email
          } : undefined,
          feedback_links: feedbackLinks.map(link => ({
            id: link.id,
            token: link.token,
            is_active: link.is_active
          }))
        };
      });

      console.log('Final bookings with client profiles:', bookingsWithProfiles);
      return bookingsWithProfiles;
    },
    enabled: !!trainerId
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      console.log('Updating booking status:', { bookingId, status });
      
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // If marking as completed, create feedback link immediately
      if (status === 'completed') {
        await createFeedbackLink(bookingId);
      }

      return { bookingId, status };
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
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  });

  const updateBookingStatus = (bookingId: string, status: string) => {
    updateBookingStatusMutation.mutate({ bookingId, status });
  };

  const createFeedbackLinkMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      console.log('Creating feedback link for booking:', bookingId);
      
      // Check if feedback link already exists for this booking
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
        console.log('Feedback link already exists for this booking');
        return existingLink;
      }

      // Generate a unique token using crypto API for better randomness
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const token = btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').substring(0, 32);
      
      const { data, error } = await supabase
        .from('feedback_links')
        .insert({
          booking_id: bookingId,
          token: token,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating feedback link:', error);
        throw error;
      }

      console.log('Feedback link created successfully');
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feedback link created successfully"
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Error in createFeedbackLink:', error);
      if (error.message.includes('already exists')) {
        toast({
          title: "Info",
          description: "Feedback link already exists for this booking"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create feedback link",
          variant: "destructive"
        });
      }
    }
  });

  const createFeedbackLink = (bookingId: string) => {
    createFeedbackLinkMutation.mutate(bookingId);
  };

  const copyFeedbackLink = (token: string) => {
    const feedbackUrl = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(feedbackUrl);
    toast({
      title: "Link Copied!",
      description: "Feedback link has been copied to clipboard. Multiple team members can use this link to submit feedback."
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
    booking.client_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.client_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.training_topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Current bookings:', bookings);
  console.log('Filtered bookings:', filteredBookings);

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
                <TableHead>Client</TableHead>
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
                          <p className="font-medium">{booking.client_profile?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{booking.client_profile?.email || 'N/A'}</p>
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
                    <TableCell>
                      {booking.duration_hours}h
                    </TableCell>
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
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">CLIENT</h4>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <p className="font-medium">{selectedBooking.client_profile?.full_name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{selectedBooking.client_profile?.email || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">STATUS</h4>
                                    <Badge className={getStatusColor(selectedBooking.status || 'pending')}>
                                      {selectedBooking.status || 'pending'}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm text-gray-600">TRAINING TOPIC</h4>
                                  <p className="text-sm">{selectedBooking.training_topic}</p>
                                </div>

                                {selectedBooking.organization_name && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">ORGANIZATION</h4>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-gray-400" />
                                      <p className="text-sm">{selectedBooking.organization_name}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">DATE & TIME</h4>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <p className="text-sm font-medium">
                                          {format(new Date(selectedBooking.start_time), 'MMM dd, yyyy')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {format(new Date(selectedBooking.start_time), 'HH:mm')} - {format(new Date(selectedBooking.end_time), 'HH:mm')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">DURATION & AMOUNT</h4>
                                    <div>
                                      <p className="text-sm">{selectedBooking.duration_hours} hours</p>
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-medium">${selectedBooking.total_amount}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {selectedBooking.special_requirements && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">SPECIAL REQUIREMENTS</h4>
                                    <div className="flex items-start gap-2">
                                      <FileText className="h-4 w-4 text-gray-400 mt-1" />
                                      <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedBooking.special_requirements}</p>
                                    </div>
                                  </div>
                                )}

                                {selectedBooking.meeting_link && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">MEETING LINK</h4>
                                    <a 
                                      href={selectedBooking.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                                    >
                                      {selectedBooking.meeting_link}
                                    </a>
                                  </div>
                                )}

                                {selectedBooking.notes && (
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-sm text-gray-600">NOTES</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md">{selectedBooking.notes}</p>
                                  </div>
                                )}

                                <div className="pt-4 border-t">
                                  <p className="text-xs text-gray-500">
                                    Booking created: {selectedBooking.created_at ? format(new Date(selectedBooking.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                  </p>
                                </div>
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
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updateBookingStatusMutation.isPending}
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
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
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          >
                            Mark Complete
                          </Button>
                        )}
                        {booking.status === 'completed' && booking.feedback_links && booking.feedback_links.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyFeedbackLink(booking.feedback_links![0].token)}
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Feedback Link
                          </Button>
                        )}
                        {booking.status === 'completed' && (!booking.feedback_links || booking.feedback_links.length === 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => createFeedbackLink(booking.id)}
                            disabled={createFeedbackLinkMutation.isPending}
                            className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          >
                            <Link className="h-4 w-4 mr-1" />
                            Generate Link
                          </Button>
                        )}
                        {booking.status === 'cancelled' && (
                          <span className="text-sm text-red-500">Cancelled</span>
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
