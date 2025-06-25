
import { useState } from 'react';
import { BarChart3, Users, GraduationCap, Calendar, TrendingUp, Settings, Star, Briefcase, FileText } from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import EnhancedBookingOverview from '@/components/admin/EnhancedBookingOverview';
import EnhancedUserManagement from '@/components/admin/EnhancedUserManagement';
import EnhancedTrainerManagement from '@/components/admin/EnhancedTrainerManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import Analytics from '@/components/admin/Analytics';
import JobManagement from '@/components/admin/JobManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import SuccessStoryManagement from '@/components/admin/SuccessStoryManagement';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EnhancedBookingOverview />;
      case 'users':
        return <EnhancedUserManagement />;
      case 'trainers':
        return <EnhancedTrainerManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'training-requests':
        return <div className="p-6">Training requests management coming soon...</div>;
      case 'analytics':
        return <Analytics />;
      case 'stories':
        return <SuccessStoryManagement />;
      case 'jobs':
        return <JobManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <EnhancedBookingOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your platform and monitor performance</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-lg shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'trainers', label: 'Trainers', icon: GraduationCap },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'training-requests', label: 'Training Requests', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'stories', label: 'Success Stories', icon: Star },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-techblue-100 text-techblue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
