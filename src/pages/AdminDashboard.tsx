import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, DollarSign, Star, TrendingUp, Calendar } from 'lucide-react';
import TrainerManagement from '@/components/admin/TrainerManagement';
import EnhancedTrainerManagement from '@/components/admin/EnhancedTrainerManagement';
import FeaturedTrainerManagement from '@/components/admin/FeaturedTrainerManagement';
import JobManagement from '@/components/admin/JobManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not admin
  if (!user || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [trainersResult, bookingsResult, usersResult] = await Promise.all([
        supabase.from('trainers').select('status', { count: 'exact' }),
        supabase.from('bookings').select('status, total_amount', { count: 'exact' }),
        supabase.from('profiles').select('role', { count: 'exact' })
      ]);

      const totalTrainers = trainersResult.count || 0;
      const pendingTrainers = trainersResult.data?.filter(t => t.status === 'pending').length || 0;
      const approvedTrainers = trainersResult.data?.filter(t => t.status === 'approved').length || 0;
      
      const totalBookings = bookingsResult.count || 0;
      const completedBookings = bookingsResult.data?.filter(b => b.status === 'completed').length || 0;
      const totalRevenue = bookingsResult.data
        ?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

      const totalUsers = usersResult.count || 0;

      return {
        totalTrainers,
        pendingTrainers,
        approvedTrainers,
        totalBookings,
        completedBookings,
        totalRevenue,
        totalUsers
      };
    }
  });

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage trainers, bookings, and platform operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Trainers"
                value={stats?.totalTrainers || 0}
                icon={Users}
                description={`${stats?.pendingTrainers || 0} pending approval`}
              />
              <StatCard
                title="Active Bookings"
                value={stats?.totalBookings || 0}
                icon={Calendar}
                description={`${stats?.completedBookings || 0} completed`}
              />
              <StatCard
                title="Total Revenue"
                value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                description="From completed bookings"
              />
              <StatCard
                title="Platform Users"
                value={stats?.totalUsers || 0}
                icon={BookOpen}
                description="Registered users"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New trainer application</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Booking completed</p>
                        <p className="text-xs text-gray-500">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment processed</p>
                        <p className="text-xs text-gray-500">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('trainers')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">Review Trainer Applications</div>
                      <div className="text-sm text-gray-500">{stats?.pendingTrainers || 0} pending</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">Manage Bookings</div>
                      <div className="text-sm text-gray-500">View all platform bookings</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">Post New Job</div>
                      <div className="text-sm text-gray-500">Add career opportunities</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trainers">
            <div className="space-y-6">
              <TrainerManagement />
              <EnhancedTrainerManagement />
              <FeaturedTrainerManagement />
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Booking management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <JobManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
