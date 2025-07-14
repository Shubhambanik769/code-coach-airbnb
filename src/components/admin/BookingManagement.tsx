
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, DollarSign, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add the mutation for assigning trainers
  const assignTrainerMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBooking || !selectedTrainerId) return;
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          trainer_id: selectedTrainerId,
          trainer_assignment_status: 'assigned',
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBooking.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Trainer Assigned",
        description: "Trainer has been successfully assigned to the booking."
      });
      setIsAssignDialogOpen(false);
      setSelectedTrainerId('');
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign trainer",
        variant: "destructive"
      });
    }
  });

  // Fetch available trainers
  const { data: trainers } = useQuery({
    queryKey: ['available-trainers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          id,
          name,
          title,
          specialization,
          status,
          user_id,
          profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'approved');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch bookings with related data
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          trainers (
            title,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: bookingsData, error } = await query;
      if (error) throw error;

      // Fetch student and trainer profiles separately
      const studentIds = [...new Set(bookingsData?.map(b => b.student_id) || [])];
      const trainerUserIds = [...new Set(bookingsData?.map(b => b.trainers?.user_id).filter(Boolean) || [])];

      const [studentsResult, trainersResult] = await Promise.all([
        studentIds.length > 0 ? supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', studentIds) : { data: [] },
        trainerUserIds.length > 0 ? supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', trainerUserIds) : { data: [] }
      ]);

      // Map the data together
      const mappedBookings = bookingsData?.map(booking => ({
        ...booking,
        student_profile: studentsResult.data?.find(p => p.id === booking.student_id),
        trainer_profile: trainersResult.data?.find(p => p.id === booking.trainers?.user_id)
      })) || [];

      console.log('BookingManagement - All bookings:', mappedBookings);
      console.log('BookingManagement - Booking statuses:', mappedBookings.map(b => b.status));

      return mappedBookings;
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate confirmed revenue (confirmed and beyond statuses)
  const confirmedRevenue = bookings?.filter(booking => 
    ['confirmed', 'assigned', 'delivering', 'delivered', 'completed'].includes(booking.status)
  ).reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

  // Calculate completed bookings (completed status only)
  const completedBookings = bookings?.filter(b => 
    b.status === 'completed'
  ).length || 0;

  console.log('BookingManagement - Confirmed revenue bookings:', bookings?.filter(booking => 
    ['confirmed', 'assigned', 'delivering', 'delivered', 'completed'].includes(booking.status)
  ));
  console.log('BookingManagement - Completed bookings:', bookings?.filter(b => b.status === 'completed'));

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{confirmedRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookings}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
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
                <SelectItem value="pending_assignment">Pending Assignment</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
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
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Booking Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs">
                        {booking.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{booking.student_profile?.full_name || booking.client_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{booking.student_profile?.email || booking.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.trainer_profile?.full_name || 'Unassigned'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{booking.training_topic}</div>
                          {booking.organization_name && (
                            <div className="text-xs text-gray-500">{booking.organization_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{new Date(booking.start_time).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.start_time).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.duration_hours}h</TableCell>
                      <TableCell className="font-medium">₹{booking.total_amount}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusColor(booking.payment_status)}>
                          {booking.payment_status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(booking.trainer_assignment_status === 'unassigned' || booking.status === 'pending_assignment') && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsAssignDialogOpen(true);
                            }}
                            className="flex items-center gap-1"
                          >
                            <UserCheck className="h-3 w-3" />
                            Assign Trainer
                          </Button>
                        )}
                        {booking.trainer_assignment_status === 'assigned' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Assigned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(booking.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trainer Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Trainer to Booking</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Booking Details</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Topic:</strong> {selectedBooking?.training_topic}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Client:</strong> {selectedBooking?.client_name}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Date:</strong> {selectedBooking && new Date(selectedBooking.start_time).toLocaleString()}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Select Trainer</label>
              <Select value={selectedTrainerId} onValueChange={setSelectedTrainerId}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Choose a trainer..." />
                </SelectTrigger>
                <SelectContent>
                  {trainers?.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{trainer.name}</p>
                          <p className="text-xs text-muted-foreground">{trainer.specialization}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => assignTrainerMutation.mutate()}
                disabled={!selectedTrainerId || assignTrainerMutation.isPending}
                className="flex-1"
              >
                {assignTrainerMutation.isPending ? 'Assigning...' : 'Assign Trainer'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedTrainerId('');
                  setSelectedBooking(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;
