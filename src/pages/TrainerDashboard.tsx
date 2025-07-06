
import { useState } from 'react';
import { BarChart3, Users, Calendar, Settings, LogOut, MessageSquare, DollarSign, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import EnhancedTrainerProfile from '@/components/trainer/EnhancedTrainerProfile';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerAnalytics from '@/components/trainer/TrainerAnalytics';
import TrainerSettings from '@/components/trainer/TrainerSettings';
import TrainerTrainingRequests from '@/components/trainer/TrainerTrainingRequests';
import TrainerCalendar from '@/components/trainer/TrainerCalendar';
import NotificationsPage from '@/components/notifications/NotificationsPage';
import NotificationBell from '@/components/notifications/NotificationBell';
import TrainerFeedback from '@/components/trainer/TrainerFeedback';

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get trainer data for the current user
  const { data: trainerData, isLoading } = useQuery({
    queryKey: ['trainer-data', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trainers')
        .select('id')
        .eq('user_id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

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

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-6">Loading...</div>;
    }

    if (!trainerData?.id) {
      return <div className="p-6">Trainer profile not found.</div>;
    }

    switch (activeTab) {
      case 'bookings':
        return <TrainerBookings trainerId={trainerData.id} />;
      case 'calendar':
        return <TrainerCalendar trainerId={trainerData.id} />;
      case 'training-requests':
        return <TrainerTrainingRequests />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <EnhancedTrainerProfile trainerId={trainerData.id} />;
      case 'earnings':
        return <TrainerEarnings trainerId={trainerData.id} />;
      case 'analytics':
        return <TrainerAnalytics />;
      case 'feedback':
        return <TrainerFeedback trainerId={trainerData.id} />;
      default:
        return <TrainerBookings trainerId={trainerData.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <BackButton to="/" label="Back to Home" />
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Trainer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your training sessions and profile</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
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
          <div className="w-full lg:w-72">
            <div className="bg-card rounded-xl shadow-sm border p-4 space-y-2">
              {[
                { id: 'bookings', label: 'My Bookings', icon: Calendar },
                { id: 'calendar', label: 'Availability Calendar', icon: Calendar },
                { id: 'training-requests', label: 'Training Requests', icon: FileText },
                { id: 'feedback', label: 'Feedback Received', icon: MessageSquare },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'Profile', icon: Users },
                { id: 'earnings', label: 'Earnings', icon: DollarSign },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden lg:block font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
