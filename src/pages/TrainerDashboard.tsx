
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import TrainerOnboardingStatus from '@/components/trainer/TrainerOnboardingStatus';
import TrainerCalendar from '@/components/trainer/TrainerCalendar';
import TrainerPricing from '@/components/trainer/TrainerPricing';
import TrainerBookingManagement from '@/components/trainer/TrainerBookingManagement';
import TrainerSchedule from '@/components/trainer/TrainerSchedule';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerProfile from '@/components/trainer/TrainerProfile';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import TrainerReviews from '@/components/trainer/TrainerReviews';
import TrainerSettings from '@/components/trainer/TrainerSettings';
import { Calendar, DollarSign, Settings, User, MessageSquare, TrendingUp, Star, Clock } from 'lucide-react';
import ChatList from '@/components/chat/ChatList';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, signOut } = useAuth();

  const { data: trainerProfile, isLoading } = useQuery({
    queryKey: ['trainer-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TrainerProfile trainerId={trainerProfile?.id || ''} />;
      case 'bookings':
        return <TrainerBookings trainerId={trainerProfile?.id || ''} />;
      case 'booking-management':
        return <TrainerBookingManagement trainerId={trainerProfile?.id || ''} />;
      case 'calendar':
        return <TrainerCalendar trainerId={trainerProfile?.id || ''} />;
      case 'pricing':
        return <TrainerPricing trainerId={trainerProfile?.id || ''} />;
      case 'messages':
        return <ChatList userRole="trainer" />;
      case 'earnings':
        return <TrainerEarnings trainerId={trainerProfile?.id || ''} />;
      case 'reviews':
        return <TrainerReviews trainerId={trainerProfile?.id || ''} />;
      case 'schedule':
        return <TrainerSchedule trainerId={trainerProfile?.id || ''} />;
      case 'settings':
        return <TrainerSettings trainerId={trainerProfile?.id || ''} />;
      default:
        return <TrainerProfile trainerId={trainerProfile?.id || ''} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-techblue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trainer dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding status if not approved
  if (!trainerProfile || trainerProfile.status !== 'approved') {
    return <TrainerOnboardingStatus />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {trainerProfile.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {[
              { id: 'overview', label: 'Profile Overview', icon: User },
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'booking-management', label: 'Booking Management', icon: Settings },
              { id: 'calendar', label: 'Calendar', icon: Calendar },
              { id: 'pricing', label: 'Pricing', icon: DollarSign },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'earnings', label: 'Earnings', icon: TrendingUp },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'schedule', label: 'Schedule', icon: Clock },
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
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
