
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Search, Filter, CheckCircle, Trash2 } from 'lucide-react';
import type { NotificationType } from '@/types/notifications';

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.is_read) ||
      notification.type === filter;
    
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadNotifications = notifications.filter(n => !n.is_read);

  const handleMarkAsRead = (notificationIds: string[]) => {
    markAsRead(notificationIds);
  };

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      markAllAsRead();
    }
  };

  const getNotificationTypeLabel = (type: NotificationType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'booking_confirmed':
      case 'training_application_accepted':
      case 'trainer_approved':
        return 'text-green-600 bg-green-50';
      case 'booking_cancelled':
      case 'training_application_rejected':
      case 'trainer_rejected':
        return 'text-red-600 bg-red-50';
      case 'booking_completed':
      case 'training_application_received':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>All Notifications</CardTitle>
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive">
                  {unreadNotifications.length} unread
                </Badge>
              )}
            </div>
            {unreadNotifications.length > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="booking_confirmed">Booking Confirmed</SelectItem>
                <SelectItem value="booking_cancelled">Booking Cancelled</SelectItem>
                <SelectItem value="booking_completed">Booking Completed</SelectItem>
                <SelectItem value="training_application_received">Applications Received</SelectItem>
                <SelectItem value="training_application_accepted">Applications Accepted</SelectItem>
                <SelectItem value="trainer_approved">Trainer Approved</SelectItem>
                <SelectItem value="system_announcement">System Announcements</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You\'ll see notifications here when you have new updates'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary" 
                            className={getNotificationColor(notification.type)}
                          >
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        
                        <p className="text-sm text-gray-400">
                          {format(new Date(notification.created_at), 'EEEE, MMMM dd, yyyy \'at\' HH:mm')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead([notification.id])}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
