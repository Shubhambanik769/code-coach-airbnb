
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface BookingWithTrainer {
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
  trainer_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

const UserBookings = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching bookings for user:', user.id);
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('student_id', user.id)
        .order('start_time', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching user bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('User bookings data:', bookingsData);

      if (bookingsData && bookingsData.length > 0) {
        const trainerIds = bookingsData.map(booking => booking.trainer_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', trainerIds);

        if (profilesError) {
          console.warn('Profiles query error:', profilesError);
        }

        const bookingsWithTrainers: BookingWithTrainer[] = bookingsData.map(booking => ({
          ...booking,
          trainer_profile: profilesData?.find(profile => profile.id === booking.trainer_id)
        }));

        console.log('Final bookings with trainers:', bookingsWithTrainers);
        return bookingsWithTrainers;
      }

      return bookingsData as BookingWithTrainer[] || [];
    },
    enabled: !!user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending': return 'Waiting for trainer confirmation';
      case 'confirmed': return 'Session confirmed by trainer';
      case 'completed': return 'Session completed';
      case 'cancelled': return 'Session cancelled';
      default: return 'Unknown status';
    }
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading your bookings...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Training Sessions ({bookings?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings?.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't booked any training sessions yet.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Find a Trainer
              </button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Training Topic</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{booking.trainer_profile?.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{booking.trainer_profile?.email || 'N/A'}</p>
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
                        <div className="space-y-1">
                          <Badge className={getStatusColor(booking.status || 'pending')}>
                            {booking.status || 'pending'}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {getStatusDescription(booking.status || 'pending')}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBookings;
