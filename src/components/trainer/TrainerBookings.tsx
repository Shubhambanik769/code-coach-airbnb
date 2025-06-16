
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, DollarSign, Search, Link, Copy } from 'lucide-react';
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
  student_profile?: {
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
  const { toast } = useToast();

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['trainer-bookings', trainerId, statusFilter],
    queryFn: async () => {
      console.log('Fetching bookings for trainer:', trainerId);
      
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          feedback_links (
            id,
            token,
            is_active
          )
        `)
        .eq('trainer_id', trainerId)
        .order('start_time', { ascending: false });

      if (statusFilter !== 'all') {
        bookingsQuery = bookingsQuery.eq('status', statusFilter);
      }

      const { data: bookingsData, error: bookingsError } = await bookingsQuery;
      
      console.log('Bookings query result:', { bookingsData, bookingsError });
      
      if (bookingsError) throw bookingsError;

      if (bookingsData && bookingsData.length > 0) {
        const studentIds = bookingsData.map(booking => booking.student_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds);

        if (profilesError) {
          console.warn('Profiles query error:', profilesError);
        }

        const bookingsWithProfiles: BookingWithProfile[] = bookingsData.map(booking => ({
          ...booking,
          student_profile: profilesData?.find(profile => profile.id === booking.student_id)
        }));

        console.log('Final bookings with profiles:', bookingsWithProfiles);
        return bookingsWithProfiles;
      }

      return bookingsData as BookingWithProfile[] || [];
    },
    enabled: !!trainerId
  });

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      console.log('Updating booking status:', { bookingId, status });
      
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${status} successfully`
      });
      refetch();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const copyFeedbackLink = (token: string) => {
    const feedbackUrl = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(feedbackUrl);
    toast({
      title: "Link Copied!",
      description: "Feedback link has been copied to clipboard"
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
    booking.student_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.student_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              placeholder="Search students or topics..."
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
                <TableHead>Student</TableHead>
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
                          <p className="font-medium">{booking.student_profile?.full_name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{booking.student_profile?.email || 'N/A'}</p>
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
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
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
                          <span className="text-sm text-gray-500">Feedback link generating...</span>
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
