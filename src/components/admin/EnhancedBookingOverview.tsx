
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Calendar, TrendingUp } from 'lucide-react';

const EnhancedBookingOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  // Fetch comprehensive booking data
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['enhanced-bookings', searchTerm, statusFilter, dateFilter, amountFilter],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data: bookings, error } = await query;
      if (error) throw error;

      // Get related data
      const studentIds = [...new Set(bookings?.map(b => b.student_id) || [])];
      const trainerIds = [...new Set(bookings?.map(b => b.trainer_id) || [])];

      const [studentsResult, trainersResult] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', studentIds),
        supabase.from('trainers').select('id, title, user_id').in('id', trainerIds)
      ]);

      // Get trainer profiles
      const trainerUserIds = trainersResult.data?.map(t => t.user_id) || [];
      const { data: trainerProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', trainerUserIds);

      return {
        bookings: bookings?.map(booking => ({
          ...booking,
          student_profile: studentsResult.data?.find(p => p.id === booking.student_id),
          trainer_data: trainersResult.data?.find(t => t.id === booking.trainer_id),
          trainer_profile: trainerProfiles?.find(p => {
            const trainer = trainersResult.data?.find(t => t.id === booking.trainer_id);
            return p.id === trainer?.user_id;
          })
        })) || [],
        stats: {
          total_bookings: bookings?.length || 0,
          total_revenue: bookings?.filter(b => ['confirmed', 'delivering', 'completed'].includes(b.status)).reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
          completed_bookings: bookings?.filter(b => b.status === 'completed').length || 0,
          pending_bookings: bookings?.filter(b => b.status === 'pending').length || 0,
          cancelled_revenue: bookings?.filter(b => b.status === 'cancelled').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
        }
      };
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookingsData?.bookings?.filter(booking => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        booking.training_topic?.toLowerCase().includes(searchLower) ||
        booking.student_profile?.full_name?.toLowerCase().includes(searchLower) ||
        booking.trainer_profile?.full_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsData?.stats.total_bookings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Revenue</CardTitle>
            <span className="text-green-600 font-medium">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{bookingsData?.stats.total_revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">Excluding cancelled bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsData?.stats.completed_bookings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsData?.stats.pending_bookings || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enhanced Booking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Advanced Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by topic, student, or trainer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>

            <Select value={amountFilter} onValueChange={setAmountFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="0-1000">₹0 - ₹1,000</SelectItem>
                <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                <SelectItem value="5000+">₹5,000+</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : filteredBookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">
                        {booking.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.student_profile?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.student_profile?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {booking.trainer_profile?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.trainer_data?.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.training_topic}</TableCell>
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
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
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
    </div>
  );
};

export default EnhancedBookingOverview;
