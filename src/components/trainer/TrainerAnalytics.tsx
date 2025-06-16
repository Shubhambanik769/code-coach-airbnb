
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Star, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const TrainerAnalytics = () => {
  const { user } = useAuth();

  const { data: analytics } = useQuery({
    queryKey: ['trainer-analytics', user?.id],
    queryFn: async () => {
      // Get trainer data
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!trainer) throw new Error('Trainer not found');

      // Get bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select('created_at, total_amount, status')
        .eq('trainer_id', trainer.id);

      // Get reviews data
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('trainer_id', trainer.id);

      // Process monthly bookings and earnings
      const monthlyData = bookings?.reduce((acc: any, booking) => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        if (!acc[month]) {
          acc[month] = { month, bookings: 0, earnings: 0, completed: 0 };
        }
        acc[month].bookings += 1;
        if (booking.status === 'completed') {
          acc[month].completed += 1;
          acc[month].earnings += booking.total_amount || 0;
        }
        return acc;
      }, {});

      // Calculate totals
      const totalBookings = bookings?.length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const totalEarnings = bookings?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const averageRating = reviews?.length 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return {
        monthlyData: Object.values(monthlyData || {}),
        totals: {
          totalBookings,
          completedBookings,
          totalEarnings,
          averageRating,
          totalReviews: reviews?.length || 0,
          completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
        }
      };
    },
    enabled: !!user?.id
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{analytics?.totals.totalBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics?.totals.totalEarnings || 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{analytics?.totals.averageRating.toFixed(1) || 0}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics?.totals.completionRate.toFixed(1) || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3B82F6" name="Total Bookings" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerAnalytics;
