
import { useState } from 'react';
import { BarChart3, Calendar, DollarSign, Settings, Star, TrendingUp, User, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TrainerProfile from '@/components/trainer/TrainerProfile';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import TrainerSchedule from '@/components/trainer/TrainerSchedule';
import TrainerCalendar from '@/components/trainer/TrainerCalendar';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerSettings from '@/components/trainer/TrainerSettings';
import EnhancedTrainerReviews from '@/components/trainer/EnhancedTrainerReviews';
import TrainerAnalytics from '@/components/trainer/TrainerAnalytics';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  // Get trainer ID for the current user - simplified query
  const { data: trainer, isLoading: trainerLoading } = useQuery({
    queryKey: ['trainer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching trainer for user:', user.id);
      
      const { data, error } = await supabase
        .from('trainers')
        .select('id, status, name, title')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching trainer:', error);
        return null;
      }
      
      console.log('Trainer data:', data);
      return data;
    },
    enabled: !!user?.id
  });

  const trainerId = trainer?.id;

  const renderContent = () => {
    if (trainerLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading trainer data...</p>
          </div>
        </div>
      );
    }

    if (!trainerId) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Trainer Profile Not Found</h3>
            <p className="text-yellow-700 mb-4">You need to complete your trainer registration first.</p>
            <Button onClick={() => navigate('/auth')} variant="outline">
              Go to Registration
            </Button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'analytics':
        return <TrainerAnalytics />;
      case 'profile':
        return <TrainerProfile trainerId={trainerId} />;
      case 'bookings':
        return <TrainerBookings trainerId={trainerId} />;
      case 'schedule':
        return <TrainerSchedule trainerId={trainerId} />;
      case 'calendar':
        return <TrainerCalendar trainerId={trainerId} />;
      case 'earnings':
        return <TrainerEarnings trainerId={trainerId} />;
      case 'reviews':
        return <EnhancedTrainerReviews />;
      case 'settings':
        return <TrainerSettings trainerId={trainerId} />;
      default:
        return <TrainerBookings trainerId={trainerId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Trainer Dashboard
              </h1>
              {trainer && (
                <p className="text-gray-600 mt-1">
                  Welcome back, {trainer.name || 'Trainer'}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2">
            {[
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'schedule', label: 'Weekly Schedule', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'reviews', label: 'Reviews & Ratings', icon: Star },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-techblue-100 text-techblue-700 border border-techblue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden lg:block">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
