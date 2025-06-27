
import { useState } from 'react';
import { BarChart3, Users, Calendar, Settings, LogOut, MessageSquare, DollarSign, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import TrainerBookings from '@/components/trainer/TrainerBookings';
import TrainerProfile from '@/components/trainer/TrainerProfile';
import TrainerEarnings from '@/components/trainer/TrainerEarnings';
import TrainerAnalytics from '@/components/trainer/TrainerAnalytics';
import TrainerSettings from '@/components/trainer/TrainerSettings';
import TrainerTrainingRequests from '@/components/trainer/TrainerTrainingRequests';
import NotificationsPage from '@/components/notifications/NotificationsPage';
import NotificationBell from '@/components/notifications/NotificationBell';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <TrainerBookings trainerId="trainer-id" />;
      case 'training-requests':
        return <TrainerTrainingRequests />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <TrainerProfile />;
      case 'earnings':
        return <TrainerEarnings />;
      case 'analytics':
        return <TrainerAnalytics />;
      case 'settings':
        return <TrainerSettings />;
      default:
        return <TrainerBookings trainerId="trainer-id" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <BackButton to="/" label="Back to Home" />
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Trainer Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <NotificationBell />
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
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'training-requests', label: 'Training Requests', icon: FileText },
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
