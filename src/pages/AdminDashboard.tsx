
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Calendar, Star, DollarSign, Activity } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import UserManagement from '@/components/admin/UserManagement';
import TrainerManagement from '@/components/admin/TrainerManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import Analytics from '@/components/admin/Analytics';
import SystemSettings from '@/components/admin/SystemSettings';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Starting authentication check...');
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          toast({
            title: "Authentication Error",
            description: "Failed to get session. Please sign in again.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (!session) {
          console.log('❌ No session found, redirecting to auth');
          toast({
            title: "Access Denied",
            description: "Please sign in to access the admin dashboard.",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        console.log('✅ Session found for user:', session.user.email);
        setUser(session.user);

        // Check admin role using a direct query with RLS bypassed by selecting only own profile
        console.log('🔍 Checking admin role for user ID:', session.user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, full_name')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile error:', profileError);
          
          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116') {
            console.log('🔧 Creating missing profile...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || session.user.email,
                role: 'user'
              });
              
            if (insertError) {
              console.error('❌ Error creating profile:', insertError);
              toast({
                title: "Error",
                description: "Failed to create user profile. Please contact support.",
                variant: "destructive"
              });
              navigate('/');
              return;
            }
            
            toast({
              title: "Profile Created",
              description: "Your profile has been created with 'user' role. Please contact an admin to grant you admin access.",
              variant: "destructive"
            });
            navigate('/');
            return;
          }
          
          toast({
            title: "Error",
            description: "Failed to check user permissions. Please try signing in again.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('👤 Profile found:', { 
          email: profile.email, 
          role: profile.role, 
          full_name: profile.full_name 
        });

        if (profile?.role !== 'admin') {
          console.log('❌ User is not admin, current role:', profile?.role);
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }

        console.log('✅ User is admin, granting access');
        setIsAdmin(true);
        
      } catch (error) {
        console.error('❌ Unexpected error during authentication check:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
        navigate('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Fetch dashboard stats - only fetch when user is confirmed admin
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      console.log('📊 Fetching admin dashboard stats...');
      
      const [usersResult, trainersResult, bookingsResult, reviewsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('trainers').select('*', { count: 'exact' }),
        supabase.from('bookings').select('total_amount', { count: 'exact' }),
        supabase.from('reviews').select('rating')
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const avgRating = reviewsResult.data?.length > 0 
        ? reviewsResult.data.reduce((sum, review) => sum + review.rating, 0) / reviewsResult.data.length 
        : 0;

      const statsData = {
        totalUsers: usersResult.count || 0,
        totalTrainers: trainersResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10
      };

      console.log('📊 Stats fetched successfully:', statsData);
      return statsData;
    },
    enabled: isAdmin && !isLoading
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrainers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgRating || '0.0'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trainers">Trainers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="trainers">
            <TrainerManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
