
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, DollarSign } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ChatWindow from '@/components/chat/ChatWindow';

interface TrainerBookingManagementProps {
  trainerId: string;
}

type BookingWithClientProfile = Tables<'bookings'> & {
  client_profile?: {
    id: string;
    full_name: string | null;
    email: string;
  };
};

const TrainerBookingManagement = ({ trainerId }: TrainerBookingManagementProps) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChat, setSelectedChat] = useState<{
    bookingId: string;
    studentId: string;
    studentName: string;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['trainer-bookings', trainerId, statusFilter],
    queryFn: async (): Promise<BookingWithClientProfile[]> => {
      console.log('Fetching bookings for trainer:', trainerId);
      
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('start_time', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: bookingsData, error } = await query;
      if (error) throw error;

      if (!bookingsData || bookingsData.length === 0) {
        return [];
      }

      // Get unique student IDs from bookings
      const studentIds = [...new Set(bookingsData.map(b => b.student_id))];
      console.log('Fetching student profiles for IDs:', studentIds);
      
      // Fetch student profiles (these are the clients who booked the trainer)
      const { data: clientProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

      if (profilesError) {
        console.error('Error fetching client profiles:', profilesError);
      }

      console.log('Student profiles fetched:', clientProfiles);

      // Map bookings with client profiles
      const enrichedBookings = bookingsData.map(booking => ({
        ...booking,
        client_profile: clientProfiles?.find(profile => profile.id === booking.student_id) || {
          id: booking.student_id,
          full_name: 'Unknown Client',
          email: 'No email available'
        }
      }));

      console.log('Final enriched bookings:', enrichedBookings);
      return enrichedBookings;
    },
    enabled: !!trainerId
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainer-bookings'] });
      toast({
        title: "Success",
        description: "Booking status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'assigned': 'delivering',
      'delivering': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const canUpdateStatus = (status: string) => {
    return ['assigned', 'delivering'].includes(status);
  };

  const totalEarnings = bookings?.filter(b => b.status === 'delivered' || b.status === 'completed')
    .reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

  if (selectedChat) {
    return (
      <div className="space-y-6">
        <ChatWindow
          bookingId={selectedChat.bookingId}
          receiverId={selectedChat.studentId}
          receiverName={selectedChat.studentName}
          onClose={() => setSelectedChat(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-xl font-bold">{bookings?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-bold">
                  {bookings?.filter(b => ['assigned', 'delivering'].includes(b.status)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold">
                  {bookings?.filter(b => ['delivered', 'completed'].includes(b.status)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-xl font-bold">₹{totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Booking Management</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
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
                ) : bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.client_profile?.full_name || 'Unknown Client'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.client_profile?.email || 'No email available'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.training_topic}</TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.start_time).toLocaleTimeString()} - 
                            {new Date(booking.end_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.duration_hours}h</TableCell>
                      <TableCell>₹{booking.total_amount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(booking.status || 'pending')}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {canUpdateStatus(booking.status || '') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatusMutation.mutate({
                                bookingId: booking.id,
                                status: getNextStatus(booking.status || '')
                              })}
                              disabled={updateBookingStatusMutation.isPending}
                            >
                              Mark as {getNextStatus(booking.status || '')}
                            </Button>
                          )}
                          {['confirmed', 'assigned', 'delivering', 'delivered', 'completed'].includes(booking.status || '') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedChat({
                                bookingId: booking.id,
                                studentId: booking.student_id,
                                studentName: booking.client_profile?.full_name || booking.client_profile?.email || 'Client'
                              })}
                            >
                              Chat
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
    </div>
  );
};

export default TrainerBookingManagement;
