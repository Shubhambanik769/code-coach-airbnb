import { useState } from 'react';
import { BarChart3, Users, GraduationCap, Calendar, MessageSquare, Settings } from 'lucide-react';
import Analytics from '@/components/admin/Analytics';
import UserManagement from '@/components/admin/UserManagement';
import TrainerManagement from '@/components/admin/TrainerManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import ChatAudit from '@/components/admin/ChatAudit';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
      case 'trainers':
        return <TrainerManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'chat-audit':
        return <ChatAudit />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'trainers', label: 'Trainer Management', icon: GraduationCap },
              { id: 'bookings', label: 'Booking Management', icon: Calendar },
              { id: 'chat-audit', label: 'Chat Audit', icon: MessageSquare },
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

export default AdminDashboard;
