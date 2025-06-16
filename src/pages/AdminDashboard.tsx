
import { useState } from 'react';
import { BarChart3, Users, GraduationCap, Calendar, MessageSquare, Settings, UserCheck, Shield, Globe, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Analytics from '@/components/admin/Analytics';
import UserManagement from '@/components/admin/UserManagement';
import TrainerManagement from '@/components/admin/TrainerManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import ChatAudit from '@/components/admin/ChatAudit';
import EnhancedUserManagement from '@/components/admin/EnhancedUserManagement';
import EnhancedTrainerManagement from '@/components/admin/EnhancedTrainerManagement';
import EnhancedBookingOverview from '@/components/admin/EnhancedBookingOverview';
import GlobalSettings from '@/components/admin/GlobalSettings';
import TopTrainersAnalytics from '@/components/admin/TopTrainersAnalytics';
import AdminHeader from '@/components/admin/AdminHeader';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'top-trainers':
        return <TopTrainersAnalytics />;
      case 'users':
        return <UserManagement />;
      case 'enhanced-users':
        return <EnhancedUserManagement />;
      case 'trainers':
        return <TrainerManagement />;
      case 'enhanced-trainers':
        return <EnhancedTrainerManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'enhanced-bookings':
        return <EnhancedBookingOverview />;
      case 'chat-audit':
        return <ChatAudit />;
      case 'global-settings':
        return <GlobalSettings />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-2">
            {[
              { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
              { id: 'top-trainers', label: 'Top Trainers', icon: TrendingUp },
              { id: 'enhanced-bookings', label: 'Bookings Overview', icon: Calendar },
              { id: 'enhanced-users', label: 'User Management', icon: UserCheck },
              { id: 'enhanced-trainers', label: 'Trainer Control', icon: GraduationCap },
              { id: 'global-settings', label: 'Global Settings', icon: Globe },
              { id: 'chat-audit', label: 'Chat Audit', icon: MessageSquare },
              { id: 'users', label: 'Basic Users', icon: Users },
              { id: 'trainers', label: 'Basic Trainers', icon: GraduationCap },
              { id: 'bookings', label: 'Basic Bookings', icon: Calendar },
              { id: 'settings', label: 'System Settings', icon: Settings },
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

export default AdminDashboard;
