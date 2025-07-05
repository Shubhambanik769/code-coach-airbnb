
import { useState } from 'react';
import { Calendar, CreditCard, User, Settings, LogOut, FileText, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import UserBookings from '@/components/user/UserBookings';
import EnhancedUserProfile from '@/components/user/EnhancedUserProfile';
import UserBilling from '@/components/user/UserBilling';
import UserTrainingRequests from '@/components/user/UserTrainingRequests';
import NotificationsPage from '@/components/notifications/NotificationsPage';
import NotificationBell from '@/components/notifications/NotificationBell';

const UserDashboard = () => {
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
        return <UserBookings />;
      case 'training-requests':
        return <UserTrainingRequests />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <EnhancedUserProfile />;
      case 'billing':
        return <UserBilling />;
      case 'settings':
        return <div className="p-6">Account settings coming soon...</div>;
      default:
        return <UserBookings />;
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
                Client Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage your bookings and training requests</p>
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
                { id: 'training-requests', label: 'Training Requests', icon: FileText },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'billing', label: 'Billing', icon: CreditCard },
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

export default UserDashboard;
