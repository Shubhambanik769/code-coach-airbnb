
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, User, DollarSign, Eye, MapPin, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

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
  organization_name: string | null;
  special_requirements: string | null;
  meeting_link: string | null;
  notes: string | null;
  trainer_profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

const UserBookings = () => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithTrainer | null>(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching bookings for user:', user.id);
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          trainers!inner(
            id,
            user_id
          )
        `)
        .eq('student_id', user.id)
        .order('start_time', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching user bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('User bookings data:', bookingsData);

      if (bookingsData && bookingsData.length > 0) {
        const trainerUserIds = bookingsData.map(booking => booking.trainers.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', trainerUserIds);

        if (profilesError) {
          console.warn('Profiles query error:', profilesError);
        }

        const bookingsWithTrainers: BookingWithTrainer[] = bookingsData.map(booking => ({
          ...booking,
          trainer_profile: profilesData?.find(profile => profile.id === booking.trainers.user_id)
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
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
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
                                    <h4 className="font-semibold text-sm text-gray-600">TRAINER</h4>
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-gray-400" />
                                      <div>
                                        <p className="font-medium">{selectedBooking.trainer_profile?.full_name || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{selectedBooking.trainer_profile?.email || 'N/A'}</p>
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
