
import { useState } from 'react';
import { BarChart3, Calendar, DollarSign, Settings, Star, TrendingUp, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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

  // Get trainer ID for the current user
  const { data: trainer } = useQuery({
    queryKey: ['trainer', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  const trainerId = trainer?.id;

  const renderContent = () => {
    if (!trainerId) {
      return (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500">Loading trainer data...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Trainer Dashboard
          </h1>
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
