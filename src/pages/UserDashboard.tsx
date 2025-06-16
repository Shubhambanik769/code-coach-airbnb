import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Calendar, MessageSquare, Settings } from 'lucide-react';
import ChatList from '@/components/chat/ChatList';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview />;
      case 'bookings':
        return <UserBookings />;
      case 'messages':
        return <ChatList userRole="user" />;
      case 'settings':
        return <UserSettings />;
      default:
        return <ProfileOverview />;
    }
  };

  const ProfileOverview = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Profile Overview</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user?.email}</h3>
              <p className="text-gray-600">Student</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Learning Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bookings:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours Learned:</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UserBookings = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
        <div className="bg-white rounded-lg shadow p-6 text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't booked any training sessions yet.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Find a Trainer
          </button>
        </div>
      </div>
    );
  };

  const UserSettings = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border rounded-md px-3 py-2"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Preferences</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="emailNotifications" className="mr-2" />
                  <label htmlFor="emailNotifications">
                    Receive email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="marketingEmails" className="mr-2" />
                  <label htmlFor="marketingEmails">
                    Receive marketing emails
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {[
              { id: 'overview', label: 'Profile Overview', icon: User },
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
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

export default UserDashboard;
