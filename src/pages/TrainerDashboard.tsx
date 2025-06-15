
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Star, 
  Settings, 
  BarChart3,
  Clock,
  MessageSquare,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import TrainerProfile from '@/components/trainer/TrainerProfile';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerSchedule from '@/components/trainer/TrainerSchedule';
import TrainerReviews from '@/components/trainer/TrainerReviews';
import TrainerSettings from '@/components/trainer/TrainerSettings';

const TrainerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user is a trainer
      const { data: trainerProfile, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error || !trainerProfile) {
        navigate('/'); // Redirect if not a trainer
        return;
      }

      setTrainerData(trainerProfile);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
              <Badge className={getStatusColor(trainerData?.status || 'pending')}>
                {trainerData?.status || 'Pending'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button
                variant="outline"
                onClick={() => supabase.auth.signOut()}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:w-fit w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewStats trainerData={trainerData} />
          </TabsContent>

          <TabsContent value="bookings">
            <TrainerBookings trainerId={trainerData?.id} />
          </TabsContent>

          <TabsContent value="schedule">
            <TrainerSchedule trainerId={trainerData?.id} />
          </TabsContent>

          <TabsContent value="earnings">
            <TrainerEarnings trainerId={trainerData?.id} />
          </TabsContent>

          <TabsContent value="reviews">
            <TrainerReviews trainerId={trainerData?.id} />
          </TabsContent>

          <TabsContent value="profile">
            <TrainerProfile trainerId={trainerData?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Overview Stats Component
const OverviewStats = ({ trainerData }: { trainerData: any }) => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    if (trainerData?.id) {
      fetchStats();
    }
  }, [trainerData?.id]);

  const fetchStats = async () => {
    try {
      // Fetch booking stats
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status, total_amount')
        .eq('trainer_id', trainerData.id);

      const totalBookings = bookings?.length || 0;
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
      const totalEarnings = bookings?.filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

      setStats({
        totalBookings,
        completedBookings,
        totalEarnings,
        averageRating: trainerData.rating || 0,
        pendingBookings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Completed Sessions',
      value: stats.completedBookings,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TrainerDashboard;
