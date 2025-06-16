
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, Star, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Analytics = () => {
  // Fetch analytics data with better error handling
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      try {
        // Get booking data with status filtering
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('created_at, total_amount, status');

        if (bookingsError) throw bookingsError;

        // Get user registration data
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('created_at, role');

        if (usersError) throw usersError;

        // Get trainer specialization data
        const { data: trainers, error: trainersError } = await supabase
          .from('trainers')
          .select('specialization, status');

        if (trainersError) throw trainersError;

        console.log('Analytics - All bookings:', bookings);

        // Process monthly bookings with confirmed revenue only
        const monthlyBookings = bookings?.reduce((acc: Record<string, any>, booking) => {
          if (!booking.created_at) return acc;
          
          const month = new Date(booking.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          
          if (!acc[month]) {
            acc[month] = { month, bookings: 0, completedBookings: 0, confirmedRevenue: 0 };
          }
          
          acc[month].bookings += 1;
          
          // Count completed bookings (completed status only)
          if (booking.status === 'completed') {
            acc[month].completedBookings += 1;
          }
          
          // Add to confirmed revenue only if status is confirmed or beyond
          if (['confirmed', 'assigned', 'delivering', 'delivered', 'completed'].includes(booking.status)) {
            acc[month].confirmedRevenue += Number(booking.total_amount) || 0;
          }
          
          return acc;
        }, {}) || {};

        // Process user registrations
        const monthlyUsers = users?.reduce((acc: Record<string, any>, user) => {
          if (!user.created_at) return acc;
          
          const month = new Date(user.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          
          if (!acc[month]) {
            acc[month] = { month, users: 0 };
          }
          acc[month].users += 1;
          return acc;
        }, {}) || {};

        // Process trainer specializations
        const specializationData = trainers?.reduce((acc: Record<string, number>, trainer) => {
          if (trainer.status === 'approved' && trainer.specialization) {
            acc[trainer.specialization] = (acc[trainer.specialization] || 0) + 1;
          }
          return acc;
        }, {}) || {};

        console.log('Analytics - Monthly bookings processed:', Object.values(monthlyBookings));

        return {
          monthlyBookings: Object.values(monthlyBookings).slice(-12), // Last 12 months
          monthlyUsers: Object.values(monthlyUsers).slice(-12),
          specializations: Object.entries(specializationData).map(([name, value]) => ({ name, value }))
        };
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try refreshing the page or contact support if the issue persists.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.monthlyBookings?.reduce((sum: number, month: any) => sum + month.completedBookings, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{analytics?.monthlyBookings?.reduce((sum: number, month: any) => sum + month.confirmedRevenue, 0)?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.monthlyUsers?.reduce((sum: number, month: any) => sum + month.users, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Specializations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.specializations?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Completed Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Completed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.monthlyBookings || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completedBookings" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confirmed Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Confirmed Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyBookings || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Confirmed Revenue']} />
                <Line type="monotone" dataKey="confirmedRevenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.monthlyUsers || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Trainer Specializations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.specializations && analytics.specializations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.specializations}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.specializations.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No specialization data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
