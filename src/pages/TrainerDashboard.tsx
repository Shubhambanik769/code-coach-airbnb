
import { useState } from 'react';
import { BarChart3, Calendar, DollarSign, Settings, Star, TrendingUp, User, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TrainerProfile from '@/components/trainer/TrainerProfile';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import TrainerCalendar from '@/components/trainer/TrainerCalendar';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerSettings from '@/components/trainer/TrainerSettings';
import EnhancedTrainerReviews from '@/components/trainer/EnhancedTrainerReviews';
import TrainerAnalytics from '@/components/trainer/TrainerAnalytics';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
  };

  // Get trainer ID for the current user
  const { data: trainer, isLoading: trainerLoading, error } = useQuery({
    queryKey: ['trainer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching trainer for user:', user.id);
      
      const { data, error } = await supabase
        .from('trainers')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results
      
      if (error) {
        console.error('Error fetching trainer:', error);
        throw error;
      }
      
      console.log('Trainer data:', data);
      return data;
    },
    enabled: !!user?.id
  });

  // Redirect to trainer status page if no trainer record exists or if not approved
  useEffect(() => {
    if (!trainerLoading && user?.id) {
      if (!trainer) {
        console.log('No trainer record found, redirecting to trainer status');
        navigate('/trainer-status');
      } else if (trainer.status !== 'approved') {
        console.log('Trainer not approved, redirecting to trainer status');
        navigate('/trainer-status');
      }
    }
  }, [trainer, trainerLoading, user?.id, navigate]);

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
          <div className="text-center">
            <p className="text-gray-500 mb-4">Trainer profile not found</p>
            <button 
              onClick={() => navigate('/trainer-status')}
              className="text-techblue-600 hover:text-techblue-700 underline"
            >
              Check your application status
            </button>
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
      case 'calendar':
        return <TrainerCalendar trainerId={trainerId} />;
      case 'earnings':
        return <TrainerEarnings trainerId={trainerId} />;
      case 'reviews':
        return <EnhancedTrainerReviews />;
      case 'settings':
        return <TrainerSettings trainerId={trainerId} />;
      default:
        return <TrainerAnalytics />;
    }
  };

  // Don't render the full dashboard until we know the trainer status
  if (trainerLoading || !trainer || trainer.status !== 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Trainer Dashboard
            </h1>
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
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
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
